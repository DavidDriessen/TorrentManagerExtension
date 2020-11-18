import TorrentServer, {
  AddTorrentOptions,
  TorrentServerEvents,
  Versions
} from "@/lib/abstract/TorrentServer";
import { Torrent, TorrentFile, TorrentState } from "@/lib/abstract/Torrent";

export class QbitTorrentServer extends TorrentServer {
  private rid = 0;

  login(username: string, password: string) {
    return this.connection
      .get("/api/v2/auth/login", {
        params: { username, password }
      })
      .then(response => {
        if (response.data == "Fails.") {
          response.status = 401;
          return Promise.reject({ response });
        }
        return response;
      })
      .catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              return Promise.reject("Invalid user credentials.");
            case 403:
              return Promise.reject("IP banned.");
          }
        }
        return Promise.reject("Invalid host name or port.");
      });
  }

  logout() {
    return this.connection.get("/api/v2/auth/logout");
  }

  update() {
    return this.connection
      .get("/api/v2/sync/maindata", { params: { rid: this.rid } })
      .then(response => {
        this.rid = response.data.rid;
        if (response.data.full_update) {
          this.torrents = {};
          this.categories = {};
          this.trackers = {};
        }
        if (response.data.torrents) {
          const updated = [];
          const added = [];
          for (const hash of Object.keys(response.data.torrents)) {
            if (this.torrents[hash]) {
              if (
                this.torrents[hash].state != response.data.torrents[hash].state
              ) {
                if (
                  response.data.torrents[hash].state ===
                  TorrentState.downloading
                ) {
                  this.fire(
                    TorrentServerEvents.Downloading,
                    this.torrents[hash]
                  );
                }
              }
              if (
                this.torrents[hash].progress < 100 &&
                response.data.torrents[hash].progress == 100
              ) {
                this.fire(TorrentServerEvents.Downloaded, this.torrents[hash]);
              }
              this.torrents[hash].updateData(response.data.torrents[hash]);
              updated.push(this.torrents[hash]);
            } else {
              this.torrents[hash] = new Torrent(
                this,
                hash,
                response.data.torrents[hash]
              );
              added.push(this.torrents[hash]);
            }
          }
          if (updated) {
            this.fire(TorrentServerEvents.TorrentsChanged, updated);
          }
          if (added) {
            this.fire(TorrentServerEvents.TorrentsAdded, added);
          }
        }
        if (response.data.torrents_removed)
          for (let i = 0; i < response.data.torrents_removed.length; i++) {
            this.fire(
              TorrentServerEvents.TorrentRemoved,
              this.torrents[response.data.torrents_removed[i]]
            );
            delete this.torrents[response.data.torrents_removed[i]];
          }
        if (response.data.categories)
          for (const name of Object.keys(response.data.categories)) {
            this.categories[name] = response.data.categories[name];
          }
        if (response.data.categories_removed)
          for (let i = 0; i < response.data.categories_removed.length; i++) {
            delete this.categories[response.data.categories_removed[i]];
          }
        if (response.data.trackers)
          for (const name of Object.keys(response.data.trackers)) {
            this.trackers[name] = response.data.trackers[name];
          }
        if (response.data.trackers_removed)
          for (let i = 0; i < response.data.trackers_removed.length; i++) {
            delete this.trackers[response.data.trackers_removed[i]];
          }
        if (response.data.server_state) {
          for (const param of Object.keys(response.data.server_state)) {
            this.state[param] = response.data.server_state[param];
          }
          this.fire(TorrentServerEvents.StateChanged, this);
        }
      });
  }

  addTorrent(torrents: string | string[], options: AddTorrentOptions) {
    return new Promise((resolve, reject) => {
      if (typeof torrents == "string") torrents = [torrents];
      if (
        torrents.every((torrent: string) =>
          torrent.match(/^(?:http|magnet:|bc:)/)
        )
      ) {
        const data = new FormData();
        data.append("urls", torrents.join("\n"));
        if (options.category) data.append("category", options.category);
        if (options.name) data.append("rename", options.name);
        data.append("autoTMM", (!!options.automatic).toString());
        if (!options.automatic && options.savePath)
          data.append("savepath ", options.savePath);
        this.connection
          .post("/api/v2/torrents/add", data)
          .then(resolve)
          .catch(reject);
      } else reject();
    });
  }

  deleteTorrents(hash: string[], deleteFiles = false) {
    return this.connection.get("/api/v2/torrents/delete", {
      headers: {
        accept: "text/javascript, text/html, application/xml, text/xml, */*",
        "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      params: {
        hashes: hash.join("|"),
        deleteFiles: deleteFiles
      }
    });
  }

  pauseTorrents(hash: string[]) {
    return this.connection.get("/api/v2/torrents/pause", {
      headers: {
        accept: "text/javascript, text/html, application/xml, text/xml, */*",
        "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      params: {
        hashes: hash.join("|")
      }
    });
  }

  resumeTorrents(hash: string[]) {
    return this.connection.get("/api/v2/torrents/resume", {
      headers: {
        accept: "text/javascript, text/html, application/xml, text/xml, */*",
        "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      params: {
        hashes: hash.join("|")
      }
    });
  }

  setFilePriority(
    hash: string,
    ids: number[],
    priority: number
  ): Promise<void> {
    return this.connection.get("/api/v2/torrents/filePrio", {
      headers: {
        accept: "text/javascript, text/html, application/xml, text/xml, */*",
        "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      params: {
        hash: hash,
        id: ids.join("|"),
        priority
      }
    });
  }

  setCategory(hash: string[], category: string): Promise<void> {
    return this.connection.get("/api/v2/torrents/setCategory", {
      headers: {
        accept: "text/javascript, text/html, application/xml, text/xml, */*",
        "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      params: {
        hashes: hash.join("|"),
        category
      }
    });
  }

  getTrackers(hash: string) {
    return this.connection
      .get("/api/v2/torrents/trackers", {
        params: { hash: hash }
      })
      .then(response => response.data);
  }

  getDetails(hash: string) {
    return this.connection
      .get("/api/v2/torrents/properties", {
        params: { hash: hash }
      })
      .then(response => response.data);
  }

  getFiles(hash: string) {
    return this.connection
      .get("/api/v2/torrents/files", {
        params: { hash: hash }
      })
      .then(response =>
        response.data.map((f: TorrentFile, k: number) => {
          f.id = k;
          const name = f.name.split("/");
          f.name = name[name.length - 1];
          if (name.length > 1) {
            name.splice(name.length - 1);
            f.group = name.join("/");
          } else {
            f.group = "/";
          }
          return f;
        })
      );
  }

  getWebSeeds(hash: string) {
    return this.connection
      .get("/api/v2/torrents/webseeds", {
        params: { hash: hash }
      })
      .then(response => response.data);
  }

  getVersion() {
    return Promise.all([
      this.connection.get("/api/v2/app/version"),
      this.connection.get("/api/v2/app/webapiVersion"),
      this.connection.get("/api/v2/app/buildInfo")
    ]).then(data => {
      return {
        application: data[0].data,
        webapi: data[1].data,
        qt: data[2].data.qt,
        libtorrent: data[2].data.libtorrent,
        boost: data[2].data.boost,
        openssl: data[2].data.openssl,
        bitness: data[2].data.bitness
      } as Versions;
    });
  }
}
