import { ServerManager } from "@/lib/ServerManager";
import { Torrent, TorrentFile } from "@/lib/abstract/Torrent";
import groupBy from "lodash/groupBy";

const serverManager = new ServerManager();

browser.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case "saveSettings":
      return new Promise((resolve) => {
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
          return { id: s.id, name: s.name, state: s.getState() };
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
    case "addTorrent":
      browser.tabs.create({
        url: browser.extension.getURL(
          "index.html#/add/" + encodeURIComponent(request.torrent)
        )
      });
  }
});

browser.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (details.requestHeaders)
      for (let i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === "Origin")
          details.requestHeaders[i].value = details.url;
      }
    return {
      requestHeaders: details.requestHeaders
    };
  },
  { urls: ["*://*/api/v2/torrents/add"] },
  ["blocking", "requestHeaders"]
);
