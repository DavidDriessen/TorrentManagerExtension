import { ServerManager } from "@/lib/ServerManager";
import { Torrent, TorrentFile } from "@/lib/abstract/Torrent";
import groupBy from "lodash/groupBy";
import Tab = browser.tabs.Tab;
import OnClickData = browser.contextMenus.OnClickData;

const serverManager = new ServerManager();

function openAddTorrentDialog(link: string) {
  return Promise.all<Tab>(
    browser.extension.getViews({ type: "tab" }).map(view => {
      const browser = ((view as unknown) as {
        chrome: {
          tabs: { getCurrent(callback: (tab: Tab) => void): void };
        };
      }).chrome;
      return new Promise(resolve =>
        browser.tabs.getCurrent((tab: Tab) =>
          resolve(Object.assign(tab, { url: view.location.href }))
        )
      );
    })
  ).then(ownTabs => {
    const tab = ownTabs.find(tab => tab.url && tab.url.includes("index.html"));
    if (tab && tab.id) {
      browser.runtime.sendMessage({ uiAction: "AddLink", link });
      browser.tabs.update(tab.id, { active: true });
    } else {
      browser.tabs.create({
        url: browser.extension.getURL(
          "index.html#/add/" + encodeURIComponent(link)
        )
      });
    }
  });
}

browser.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case "saveSettings":
      return new Promise(resolve => {
        serverManager.verifyServers(request.data.servers).then(result => {
          if (!result) {
            browser.storage.sync.set(request.data).then(() => {
              resolve();
            });
          } else {
            resolve(result);
          }
        });
      });
    case "getServers":
      return Promise.resolve(
        serverManager.getServers().map(s => {
          return {
            id: s.id,
            name: s.name,
            state: s.getState(),
            settings: s.getSettings()
          };
        })
      );
    case "getTorrents":
      return Promise.resolve(
        serverManager.getTorrents().map((t: Torrent) => t.toObject())
      );
    case "getTrackers":
      return Promise.resolve(serverManager.getTrackers());
    case "getCategories":
      return Promise.resolve(serverManager.getCategories());
    case "loadTorrent":
      return new Promise(resolve => {
        const torrent = serverManager
          .getTorrents()
          .find(
            t =>
              t.server.id == request.torrent.server.id &&
              t.hash == request.torrent.hash
          );
        if (torrent) torrent.loadAll().then(() => resolve(torrent.toObject()));
      });
    case "loadTrackers":
      return new Promise(resolve => {
        const torrent = serverManager
          .getTorrents()
          .find(
            t =>
              t.server.id == request.torrent.server.id &&
              t.hash == request.torrent.hash
          );
        if (torrent)
          torrent.loadTrackers().then(() => resolve(torrent.toObject()));
      });
    case "deleteTorrents":
      return new Promise((resolve, reject) => {
        for (const [, torrents] of Object.entries(
          groupBy(request.data.torrents, (torrent: Torrent) => {
            return torrent.server.name;
          })
        )) {
          const server = serverManager
            .getServers()
            .find(s => s.id == torrents[0].server.id);
          if (server)
            server
              .deleteTorrents(
                torrents.map(t => t.hash),
                request.data.removeFiles
              )
              .then(resolve)
              .catch(reject);
        }
      });
    case "pauseTorrents":
      return new Promise((resolve, reject) => {
        for (const [, torrents] of Object.entries(
          groupBy(request.torrents, (torrent: Torrent) => {
            return torrent.server.name;
          })
        )) {
          const server = serverManager
            .getServers()
            .find(s => s.id == torrents[0].server.id);
          if (server)
            server
              .pauseTorrents(torrents.map(t => t.hash))
              .then(resolve)
              .catch(reject);
        }
      });
    case "resumeTorrents":
      return new Promise((resolve, reject) => {
        for (const [, torrents] of Object.entries(
          groupBy(request.torrents, (torrent: Torrent) => {
            return torrent.server.name;
          })
        )) {
          const server = serverManager
            .getServers()
            .find(s => s.id == torrents[0].server.id);
          if (server)
            server
              .resumeTorrents(torrents.map(t => t.hash))
              .then(resolve)
              .catch(reject);
        }
      });
    case "setFilePriority":
      return new Promise((resolve, reject) => {
        const torrent = serverManager
          .getTorrents()
          .find(
            t =>
              t.server.id == request.data.torrent.server.id &&
              t.hash == request.data.torrent.hash
          );
        if (torrent)
          torrent
            .setFilePriority(
              request.data.files.map((f: TorrentFile) => f.id),
              request.data.priority
            )
            .then(resolve)
            .catch(reject);
      });
    case "setCategory":
      return new Promise((resolve, reject) => {
        const torrent = serverManager
          .getTorrents()
          .find(
            t =>
              t.server.id == request.data.torrent.server.id &&
              t.hash == request.data.torrent.hash
          );
        if (torrent)
          torrent
            .setCategory(request.data.category)
            .then(resolve)
            .catch(reject);
      });
    case "addTorrent":
      if (request.data) {
        const server = serverManager
          .getServers()
          .find(s => s.id == request.data.server.id);
        if (server)
          return server.addTorrent(request.data.torrents, request.data.options);
      } else {
        return openAddTorrentDialog(request.torrent);
      }
  }
});

browser.contextMenus.create({
  id: "add_torrent",
  title: "Add torrent",
  contexts: ["link"],
  onclick: (info: OnClickData) => openAddTorrentDialog(info.linkUrl || "")
});
