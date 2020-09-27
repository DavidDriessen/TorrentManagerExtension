import TorrentServer, {
  ServerType,
  TorrentServerError,
  TorrentServerEvents
} from "@/lib/abstract/TorrentServer";
import { QbitTorrentServer } from "@/lib/serverTypes/qbitTorrentServer";

export interface Notify {
  downloading: boolean;
  downloaded: boolean;
}

export class ServerManager {
  private servers: TorrentServer[] = [];
  private notifications: Notify = {} as Notify;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    browser.storage.sync.get("servers").then(({ servers }) => {
      for (const settings of servers) {
        switch (settings.type) {
          case ServerType.Qbit:
            this.addServer(new QbitTorrentServer(settings));
        }
      }
      this.update();
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    browser.storage.sync.get("notify").then(({ notify }) => {
      this.notifications = notify as Notify;
    });
  }

  update() {
    setTimeout(() => {
      const servers = this.servers.filter(
        s => s.errorCode == TorrentServerError.NoError
      );
      if (servers.length > 0)
        Promise.all(servers.map(m => m.update())).finally(() => {
          this.update();
        });
      else
        setTimeout(() => {
          this.update();
        }, 50);
    }, 500);
  }

  addServer(server: TorrentServer) {
    server.on(TorrentServerEvents.Downloading, event => {
      if (this.notifications.downloading)
        browser.notifications.create("StateChanged", {
          type: "basic",
          iconUrl: "icons/48.png",
          title: "Torrent is downloading",
          message: event.data.name
        });
    });
    server.on(TorrentServerEvents.Downloaded, event => {
      if (this.notifications.downloaded)
        browser.notifications.create("StateChanged", {
          type: "basic",
          iconUrl: "icons/48.png",
          title: "Torrent finished downloading",
          message: event.data.name
        });
    });
    server.on(TorrentServerEvents.TorrentListChanged, () => {
      browser.runtime
        .sendMessage(TorrentServerEvents.TorrentListChanged)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    });
    this.servers.push(server);
  }

  getServers() {
    return this.servers;
  }

  getTorrents() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return [].concat(...this.servers.map(m => m.getTorrents()));
  }

  getCategories() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return [].concat(...this.servers.map(m => m.getCategories()));
  }
}
