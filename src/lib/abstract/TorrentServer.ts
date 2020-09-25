import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ConcurrencyManager } from "@/lib/ConcurrencyManager";
import { EventEmitter } from "@billjs/event-emitter";
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

export interface ServerSettings {
  name: string;
  type: ServerType;
  host: string;
  username: string;
  password: string;
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
  Downloaded = "Downloaded"
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
  readonly name: string;
  protected connection: AxiosInstance;
  protected torrents: { [key: string]: Torrent } = {};
  protected categories: {
    [key: string]: { name: string; savePath: string };
  } = {};
  public errorCode: TorrentServerError = TorrentServerError.NoError;

  constructor(settings: ServerSettings) {
    super();
    this.name = settings.name;
    this.connection = axios.create({ baseURL: settings.host });
    ConcurrencyManager(this.connection, 1000);
    this.connection.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        this.fire("error", { server: this, error });
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
                  return this.login(settings.username, settings.password).then(
                    () => {
                      this.errorCode = TorrentServerError.NoError;
                      return this.connection.request(error.config);
                    }
                  );
                }
            }
          }
          if (this.errorCode != TorrentServerError.ServerError) {
            this.errorCode = TorrentServerError.ServerError;
            this.fire(TorrentServerEvents.ServerError, this);
            if (!error.response) {
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
    category: string,
    name: string | undefined
  ): Promise<unknown>;

  abstract deleteTorrent(hash: string, deleteFiles: boolean): Promise<unknown>;

  getTorrents() {
    return Object.values(this.torrents);
  }

  getCategories() {
    return Object.keys(this.categories);
  }

  abstract getTrackers(hash: string): Promise<Array<TorrentTracker>>;

  abstract getDetails(hash: string): Promise<Array<TorrentDatails>>;

  abstract getFiles(hash: string): Promise<Array<TorrentFile>>;

  abstract getWebSeeds(hash: string): Promise<Array<TorrentWebSeed>>;

  abstract getVersion(): Promise<Versions>;
}

export default TorrentServer;
