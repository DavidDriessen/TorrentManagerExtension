/* eslint-disable @typescript-eslint/camelcase */
import TorrentServer from "@/lib/abstract/TorrentServer";

export enum TorrentState {
  Error = "error",
  pausedUP = "pausedUP",
  pausedDL = "pausedDL",
  queuedUP = "queuedUP",
  queuedDL = "queuedDL",
  uploading = "uploading",
  stalledUP = "stalledUP",
  checkingUP = "checkingUP",
  checkingDL = "checkingDL",
  downloading = "downloading",
  stalledDL = "stalledDL",
  metaDL = "metaDL"
}

export interface TorrentData {
  name: string;
  added_on: number;
  amount_left: number;
  auto_tmm: boolean;
  category: string;
  completed: number;
  completion_on: number;
  dl_limit: number;
  dlspeed: number;
  downloaded: number;
  downloaded_session: number;
  eta: number;
  f_l_piece_prio: boolean;
  force_start: boolean;
  hash: string;
  last_activity: number;
  magnet_uri: string;
  max_ratio: number;
  max_seeding_time: number;
  num_complete: number;
  num_incomplete: number;
  num_leechs: number;
  num_seeds: number;
  priority: number;
  progress: number;
  ratio: number;
  ratio_limit: number;
  save_path: string;
  seeding_time_limit: number;
  seen_complete: number;
  seq_dl: boolean;
  size: number;
  state: TorrentState;
  super_seeding: boolean;
  tags: string;
  time_active: number;
  total_size: number;
  tracker: string;
  up_limit: number;
  uploaded: number;
  uploaded_session: number;
  upspeed: number;
}

export interface TorrentDatails {
  addition_date: number;
  comment: string;
  completion_date: number;
  created_by: string;
  creation_date: number;
  dl_limit: number;
  dl_speed: number;
  dl_speed_avg: number;
  eta: number;
  last_seen: number;
  nb_connections: number;
  nb_connections_limit: number;
  peers: number;
  peers_total: number;
  piece_size: number;
  pieces_have: number;
  pieces_num: number;
  reannounce: number;
  save_path: string;
  seeding_time: number;
  seeds: number;
  seeds_total: number;
  share_ratio: number;
  time_elapsed: number;
  total_downloaded: number;
  total_downloaded_session: number;
  total_size: number;
  total_uploaded: number;
  total_uploaded_session: number;
  total_wasted: number;
  up_limit: number;
  up_speed: number;
  up_speed_avg: number;
}

export interface TorrentTracker {
  msg: string;
  num_downloaded: number;
  num_leeches: number;
  num_peers: number;
  num_seeds: number;
  status: number;
  tier: string;
  url: string;
}

export interface TorrentFileDirectory {
  name: string;
  progress: number;
  size: number;
  files: TorrentFile[];
}

export interface TorrentFile {
  id: number;
  availability: number;
  is_seed: boolean;
  name: string;
  fullPath: string;
  piece_range: Array<number>;
  priority: number;
  progress: number;
  size: number;
}

export interface TorrentWebSeed {
  name: string;
}

export class Torrent implements TorrentData {
  public server: TorrentServer;
  public hash: string;
  public name!: string;
  public added_on!: number;
  public amount_left!: number;
  public auto_tmm!: boolean;
  public category!: string;
  public completed!: number;
  public completion_on!: number;
  public dl_limit!: number;
  public dlspeed!: number;
  public downloaded!: number;
  public downloaded_session!: number;
  public eta!: number;
  public f_l_piece_prio!: boolean;
  public force_start!: boolean;
  public last_activity!: number;
  public magnet_uri!: string;
  public max_ratio!: number;
  public max_seeding_time!: number;
  public num_complete!: number;
  public num_incomplete!: number;
  public num_leechs!: number;
  public num_seeds!: number;
  public priority!: number;
  public progress!: number;
  public ratio!: number;
  public ratio_limit!: number;
  public save_path!: string;
  public seeding_time_limit!: number;
  public seen_complete!: number;
  public seq_dl!: boolean;
  public size!: number;
  public state!: TorrentState;
  public super_seeding!: boolean;
  public tags!: string;
  public time_active!: number;
  public total_size!: number;
  public tracker!: string;
  public up_limit!: number;
  public uploaded!: number;
  public uploaded_session!: number;
  public upspeed!: number;

  files: Array<TorrentFile | TorrentFileDirectory> | undefined;
  details: Array<TorrentDatails> | undefined;
  trackers: Array<TorrentTracker> | undefined;
  webSeeds: Array<TorrentWebSeed> | undefined;

  constructor(server: TorrentServer, hash: string, torrentData: TorrentData) {
    this.server = server;
    this.hash = hash;
    this.updateData(torrentData);
  }

  get key() {
    return this.server.name + "-" + this.hash;
  }

  updateData(torrentData: TorrentData) {
    for (const param of Object.keys(torrentData)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this[param] = torrentData[param];
    }
  }

  delete(deleteFiles = false) {
    return this.server.deleteTorrents([this.hash], deleteFiles);
  }

  setFilePriority(fileIds: number[], priority: number) {
    return this.server.setFilePriority(this.hash, fileIds, priority);
  }

  setCategory(category: string) {
    return this.server.setCategory([this.hash], category);
  }

  loadTrackers() {
    return this.server.getTrackers(this.hash).then(data => {
      this.trackers = data;
    });
  }

  loadDetails() {
    return this.server.getDetails(this.hash).then(data => {
      this.details = data;
    });
  }

  loadFiles() {
    return this.server.getFiles(this.hash).then(data => {
      this.files = data;
    });
  }

  loadWebSeeds() {
    return this.server.getWebSeeds(this.hash).then(data => {
      this.webSeeds = data;
    });
  }

  loadAll() {
    return Promise.all([
      this.loadTrackers(),
      this.loadDetails(),
      this.loadFiles(),
      this.loadWebSeeds()
    ]);
  }

  toObject() {
    return {
      server: this.server.toObject(),
      key: this.key,
      hash: this.hash,
      name: this.name,
      added_on: this.added_on,
      amount_left: this.amount_left,
      auto_tmm: this.auto_tmm,
      category: this.category,
      completed: this.completed,
      completion_on: this.completion_on,
      dl_limit: this.dl_limit,
      dlspeed: this.dlspeed,
      downloaded: this.downloaded,
      downloaded_session: this.downloaded_session,
      eta: this.eta,
      f_l_piece_prio: this.f_l_piece_prio,
      force_start: this.force_start,
      last_activity: this.last_activity,
      magnet_uri: this.magnet_uri,
      max_ratio: this.max_ratio,
      max_seeding_time: this.max_seeding_time,
      num_complete: this.num_complete,
      num_incomplete: this.num_incomplete,
      num_leechs: this.num_leechs,
      num_seeds: this.num_seeds,
      priority: this.priority,
      progress: this.progress,
      ratio: this.ratio,
      ratio_limit: this.ratio_limit,
      save_path: this.save_path,
      seeding_time_limit: this.seeding_time_limit,
      seen_complete: this.seen_complete,
      seq_dl: this.seq_dl,
      size: this.size,
      state: this.state,
      super_seeding: this.super_seeding,
      tags: this.tags,
      time_active: this.time_active,
      total_size: this.total_size,
      tracker: this.tracker,
      up_limit: this.up_limit,
      uploaded: this.uploaded,
      uploaded_session: this.uploaded_session,
      upspeed: this.upspeed,
      files: this.files,
      details: this.details,
      trackers: this.trackers,
      webSeeds: this.webSeeds
    };
  }
}
