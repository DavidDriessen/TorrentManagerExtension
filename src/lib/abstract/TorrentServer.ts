import axios, {AxiosInstance, AxiosResponse} from "axios";
import {ConcurrencyManager} from "@/lib/ConcurrencyManager";
import {EventEmitter} from "@billjs/event-emitter";
import {
  Torrent,
  TorrentDatails,
  TorrentFile,
  TorrentTracker,
  TorrentWebSeed
} from "@/lib/abstract/Torrent";

export enum ServerType {
  Qbit = "Qbit"
}

export interface AddTorrentOptions {
  category?: string;
  name?: string;
  automatic?: boolean;
  savePath?: string;
}

export interface TorrentLink {
  name: string;
  url: string;
}

export interface ServerSettings {
  name: string;
  type: ServerType;
  host: URL | string;
  username: string;
  password: string;
}

export interface ServerState {
  [key: string]: string | number | boolean;

  alltime_dl: number;
  alltime_ul: number;
  average_time_queue: number;
  connection_status: string;
  dht_nodes: number;
  dl_info_data: number;
  dl_info_speed: number;
  dl_rate_limit: number;
  free_space_on_disk: number;
  global_ratio: string;
  queued_io_jobs: number;
  queueing: boolean;
  read_cache_hits: string;
  read_cache_overload: string;
  refresh_interval: number;
  total_buffers_size: number;
  total_peer_connections: number;
  total_queued_size: number;
  total_wasted_session: number;
  up_info_data: number;
  up_info_speed: number;
  up_rate_limit: number;
  use_alt_speed_limits: boolean;
  write_cache_overload: string;
}

export enum TorrentServerError {
  NoError,
  AuthError,
  ServerError
}

export enum TorrentServerEvents {
  AuthError = "AuthError",
  ServerError = "ServerError",
  Downloading = "Downloading",
  Downloaded = "Downloaded",
  TorrentsAdded = "TorrentsAdded",
  TorrentRemoved = "TorrentRemoved",
  TorrentsChanged = "TorrentsChanged",
  StateChanged = "StateChanged"
}

export interface Versions {
  application: string;
  webapi: string;
  qt: string;
  libtorrent: string;
  boost: string;
  openssl: string;
  bitness: number;
}

export abstract class TorrentServer extends EventEmitter {
  readonly id: string;
  readonly name: string;
  private settings: ServerSettings;
  protected connection: AxiosInstance;
  protected state: ServerState = {} as ServerState;
  protected torrents: { [key: string]: Torrent } = {};
  protected categories: {
    [key: string]: { serverId?: string; name: string; savePath: string };
  } = {};
  public trackers: {
    [key: string]: string[];
  } = {};
  public errorCode: TorrentServerError = TorrentServerError.NoError;

  constructor(settings: ServerSettings) {
    super();
    this.id =
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 9);
    this.name = settings.name;
    this.settings = settings;
    this.connection = axios.create({baseURL: settings.host as string});
    ConcurrencyManager(this.connection, 1000);
  }

  activateHandlers() {
    this.connection.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        this.fire("error", {server: this, error});
        if (error.config) {
          if (error.response) {
            switch (error.response.status) {
              case 401:
              case 403:
                if (this.errorCode == TorrentServerError.AuthError) {
                  browser.notifications.create("AuthError", {
                    type: "basic",
                    iconUrl: "icons/48.png",
                    title: "Auth error",
                    message: "Wrong credentials for server '" + this.name + "'."
                  });
                } else {
                  this.errorCode = TorrentServerError.AuthError;
                  return this.login(
                    this.settings.username,
                    this.settings.password
                  ).then(() => {
                    this.errorCode = TorrentServerError.NoError;
                    return this.connection.request(error.config);
                  });
                }
            }
          }
          if (this.errorCode != TorrentServerError.ServerError) {
            this.errorCode = TorrentServerError.ServerError;
            this.fire(TorrentServerEvents.ServerError, this);
            if (error.message == "Network Error") {
              browser.notifications.create("AuthError", {
                type: "basic",
                iconUrl: "icons/48.png",
                title: "SSL ERROR",
                message: "Server: '" + this.name + "'."
              });
              return new Promise(resolve => {
                setTimeout(resolve, 10 * 60 * 1000);
              }).then(() => {
                return this.connection.request(error.config);
              });
            } else if (!error.response) {
              browser.notifications.create("AuthError", {
                type: "basic",
                iconUrl: "icons/48.png",
                title: "Unable to connect to server",
                message: "Server: '" + this.name + "'."
              });
            }
          }
          return new Promise(resolve => {
            setTimeout(resolve, 5000);
          }).then(() => {
            return this.connection.request(error.config);
          });
        }
      }
    );
  }

  abstract login(username: string, password: string): Promise<AxiosResponse>;

  abstract logout(): Promise<AxiosResponse>;

  abstract update(): Promise<void>;

  abstract addTorrent(
    torrents: string | string[],
    options: AddTorrentOptions
  ): Promise<unknown>;

  abstract deleteTorrents(
    hash: string[],
    deleteFiles: boolean
  ): Promise<unknown>;

  abstract pauseTorrents(hash: string[]): Promise<unknown>;

  abstract resumeTorrents(hash: string[]): Promise<unknown>;

  abstract setFilePriority(
    hash: string,
    ids: number[],
    priority: number
  ): Promise<void>;

  getState() {
    return this.state;
  }

  getTorrents() {
    return Object.values(this.torrents);
  }

  getCategories() {
    return Object.values(this.categories).map((c) => {
      c.serverId = this.id;
      return c;
    });
  }

  abstract getTrackers(hash: string): Promise<Array<TorrentTracker>>;

  abstract getDetails(hash: string): Promise<Array<TorrentDatails>>;

  abstract getFiles(hash: string): Promise<Array<TorrentFile>>;

  abstract getWebSeeds(hash: string): Promise<Array<TorrentWebSeed>>;

  abstract getVersion(): Promise<Versions>;

  toObject() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

export default TorrentServer;
