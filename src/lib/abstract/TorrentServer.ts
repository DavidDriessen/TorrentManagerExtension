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

export interface ServerPreferences {
  locale?: string;
  create_subfolder_enabled?: boolean;
  start_paused_enabled?: boolean;
  auto_delete_mode?: number;
  preallocate_all?: boolean;
  incomplete_files_ext?: boolean;
  auto_tmm_enabled?: boolean;
  torrent_changed_tmm_enabled?: boolean;
  save_path_changed_tmm_enabled?: boolean;
  category_changed_tmm_enabled?: boolean;
  save_path?: string;
  temp_path_enabled?: boolean;
  temp_path?: string;
  scan_dirs?: {};
  export_dir?: string;
  export_dir_fin?: string;
  mail_notification_enabled?: boolean;
  mail_notification_sender?: string;
  mail_notification_email?: string;
  mail_notification_smtp?: string;
  mail_notification_ssl_enabled?: boolean;
  mail_notification_auth_enabled?: boolean;
  mail_notification_username?: string;
  mail_notification_password?: string;
  autorun_enabled?: boolean;
  autorun_program?: string;
  queueing_enabled?: boolean;
  max_active_downloads?: number;
  max_active_torrents?: number;
  max_active_uploads?: number;
  dont_count_slow_torrents?: boolean;
  slow_torrent_dl_rate_threshold?: number;
  slow_torrent_ul_rate_threshold?: number;
  slow_torrent_inactive_timer?: number;
  max_ratio_enabled?: boolean;
  max_ratio?: number;
  max_ratio_act?: boolean;
  listen_port?: number;
  upnp?: boolean;
  random_port?: boolean;
  dl_limit?: number;
  up_limit?: number;
  max_connec?: number;
  max_connec_per_torrent?: number;
  max_uploads?: number;
  max_uploads_per_torrent?: number;
  stop_tracker_timeout?: number;
  enable_piece_extent_affinity?: boolean;
  bittorrent_protocol?: number;
  limit_utp_rate?: boolean;
  limit_tcp_overhead?: boolean;
  limit_lan_peers?: boolean;
  alt_dl_limit?: number;
  alt_up_limit?: number;
  scheduler_enabled?: boolean;
  schedule_from_hour?: number;
  schedule_from_min?: number;
  schedule_to_hour?: number;
  schedule_to_min?: number;
  scheduler_days?: number;
  dht?: boolean;
  pex?: boolean;
  lsd?: boolean;
  encryption?: number;
  anonymous_mode?: boolean;
  proxy_type?: number;
  proxy_ip?: string;
  proxy_port?: number;
  proxy_peer_connections?: boolean;
  proxy_auth_enabled?: boolean;
  proxy_username?: string;
  proxy_password?: string;
  proxy_torrents_only?: boolean;
  ip_filter_enabled?: boolean;
  ip_filter_path?: string;
  ip_filter_trackers?: boolean;
  web_ui_domain_list?: string;
  web_ui_address?: string;
  web_ui_port?: number;
  web_ui_upnp?: boolean;
  web_ui_username?: string;
  web_ui_password?: string;
  web_ui_csrf_protection_enabled?: boolean;
  web_ui_clickjacking_protection_enabled?: boolean;
  web_ui_secure_cookie_enabled?: boolean;
  web_ui_max_auth_fail_count?: number;
  web_ui_ban_duration?: number;
  web_ui_session_timeout?: number;
  web_ui_host_header_validation_enabled?: boolean;
  bypass_local_auth?: boolean;
  bypass_auth_subnet_whitelist_enabled?: boolean;
  bypass_auth_subnet_whitelist?: string;
  alternative_webui_enabled?: boolean;
  alternative_webui_path?: string;
  use_https?: boolean;
  ssl_key?: string;
  ssl_cert?: string;
  web_ui_https_key_path?: string;
  web_ui_https_cert_path?: string;
  dyndns_enabled?: boolean;
  dyndns_service?: number;
  dyndns_username?: string;
  dyndns_password?: string;
  dyndns_domain?: string;
  rss_refresh_interval?: number;
  rss_max_articles_per_feed?: number;
  rss_processing_enabled?: boolean;
  rss_auto_downloading_enabled?: boolean;
  rss_download_repack_proper_episodes?: boolean;
  rss_smart_episode_filters?: string;
  add_trackers_enabled?: boolean;
  add_trackers?: string;
  web_ui_use_custom_http_headers_enabled?: boolean;
  web_ui_custom_http_headers?: string;
  max_seeding_time_enabled?: boolean;
  max_seeding_time?: number;
  announce_ip?: string;
  announce_to_all_tiers?: boolean;
  announce_to_all_trackers?: boolean;
  async_io_threads?: number;
  banned_IPs?: string;
  checking_memory_use?: number;
  current_interface_address?: string;
  current_network_interface?: string;
  disk_cache?: number;
  disk_cache_ttl?: number;
  embedded_tracker_port?: number;
  enable_coalesce_read_write?: boolean;
  enable_embedded_tracker?: boolean;
  enable_multi_connections_from_same_ip?: boolean;
  enable_os_cache?: boolean;
  enable_upload_suggestions?: boolean;
  file_pool_size?: number;
  outgoing_ports_max?: number;
  outgoing_ports_min?: number;
  recheck_completed_torrents?: boolean;
  resolve_peer_countries?: boolean;
  save_resume_data_interval?: number;
  send_buffer_low_watermark?: number;
  send_buffer_watermark?: number;
  send_buffer_watermark_factor?: number;
  socket_backlog_size?: number;
  upload_choking_algorithm?: number;
  upload_slots_behavior?: number;
  upnp_lease_duration?: number;
  utp_tcp_mixed_mode?: number;
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
    this.connection = axios.create({ baseURL: settings.host as string });
    ConcurrencyManager(this.connection, 1000);
  }

  activateHandlers() {
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

  abstract getPreferences(): Promise<ServerPreferences>;

  abstract setPreferences(preferences: ServerPreferences): Promise<void>;

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

  abstract setCategory(hash: string[], category: string): Promise<void>;

  getState() {
    return this.state;
  }

  getTorrents() {
    return Object.values(this.torrents);
  }

  getCategories() {
    return Object.values(this.categories).map(c => {
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
