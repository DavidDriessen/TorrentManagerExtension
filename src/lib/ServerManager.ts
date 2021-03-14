import TorrentServer, {
  ServerSettings,
  ServerType,
  TorrentServerError,
  TorrentServerEvents
} from "@/lib/abstract/TorrentServer";
import { QbitTorrentServer } from "@/lib/serverTypes/qbitTorrentServer";
import { Torrent } from "@/lib/abstract/Torrent";

export interface Notify {
  downloading: boolean;
  downloaded: boolean;
}

export class ServerManager {
  private servers: TorrentServer[] = [];
  private notifications: Notify = {} as Notify;

  constructor() {
    browser.storage.sync.get("servers").then(({ servers }) => {
      if (servers) {
        for (const settings of servers) {
          this.addServer(this.parseServer(settings));
        }
      }
      this.update();
    });
    browser.storage.sync.get("notify").then(({ notify }) => {
      this.notifications = notify as Notify;
    });
  }

  parseServer(settings: ServerSettings) {
    switch (settings.type) {
      case ServerType.Qbit:
        return new QbitTorrentServer(settings);
    }
  }

  async verifyServers(settings: ServerSettings[]) {
    const servers: TorrentServer[] = [];
    try {
      for (const setting of settings) {
        const server: TorrentServer = this.parseServer(setting);
        await server.login(setting.username, setting.password);
        servers.push(server);
      }
    } catch (e) {
      return e;
    }
    this.servers = [];
    for (const server of servers) {
      this.addServer(server);
      server.update();
    }
    return null;
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
    server.activateHandlers();
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
    server.on(TorrentServerEvents.TorrentsChanged, ({ data }) => {
      browser.runtime
        .sendMessage({
          event: TorrentServerEvents.TorrentsChanged,
          data: data.map((t: Torrent) => t.toObject())
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    });
    server.on(TorrentServerEvents.TorrentsAdded, ({ data }) => {
      browser.runtime
        .sendMessage({
          event: TorrentServerEvents.TorrentsAdded,
          data: data.map((t: Torrent) => t.toObject())
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    });
    server.on(
      TorrentServerEvents.TorrentRemoved,
      ({ data }: { data: Torrent }) => {
        browser.runtime
          .sendMessage({
            event: TorrentServerEvents.TorrentRemoved,
            data: data.toObject()
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
      }
    );
    server.on(
      TorrentServerEvents.StateChanged,
      ({ data }: { data: TorrentServer }) => {
        browser.runtime
          .sendMessage({
            event: TorrentServerEvents.StateChanged,
            data: { id: data.id, name: data.name, state: data.getState() }
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
      }
    );
    this.servers.push(server);
  }

  getServers() {
    return this.servers;
  }

  getTorrents(): Torrent[] {
    return ([] as Torrent[]).concat(...this.servers.map(m => m.getTorrents()));
  }

  getCategories() {
    return ([] as {}[]).concat(...this.servers.map(m => m.getCategories()));
  }

  getTrackers() {
    const trackers = {} as {
      [key: string]: { serverId: string; torrentHash: string }[];
    };
    for (const server of this.servers) {
      for (const [tracker, hashes] of Object.entries(server.trackers)) {
        if (trackers[tracker]) {
          trackers[tracker] = trackers[tracker].concat(
            ...hashes.map(h => {
              return { serverId: server.id, torrentHash: h };
            })
          );
        } else {
          trackers[tracker] = hashes.map(h => {
            return { serverId: server.id, torrentHash: h };
          });
        }
      }
    }
    return trackers;
  }
}
