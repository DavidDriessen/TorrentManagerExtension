import Vue from "vue";
import Vuex from "vuex";
import { Torrent } from "@/lib/abstract/Torrent";
import { ServerState, TorrentServerEvents } from "@/lib/abstract/TorrentServer";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    servers: [] as { id: string; name: string; state: ServerState }[],
    categories: [] as { name: string; savePath: string }[],
    torrents: [] as Torrent[],
    trackers: {} as {
      [key: string]: { serverId: string; torrentHash: string }[];
    }
  },
  mutations: {
    setTorrents(state, torrents) {
      state.torrents = torrents;
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    setTrackers(state, trackers) {
      state.trackers = trackers;
    },
    setServers(state, servers) {
      state.servers = servers;
    },
    updateTorrents(state, torrents) {
      for (const torrent of torrents) {
        const index = state.torrents.findIndex(
          t => t.server.id == torrent.server.id && t.hash == torrent.hash
        );
        if (index >= 0) {
          for (const param of Object.keys(torrent)) {
            Vue.set(state.torrents[index], param, torrent[param]);
          }
        } else {
          state.torrents.push(torrent);
        }
      }
    },
    updateTrackers(state, trackers) {
      for (const param of Object.keys(trackers)) {
        Vue.set(state.trackers, param, trackers[param]);
      }
    },
    updateServer(state, server) {
      const index = state.servers.findIndex(s => s.id == server.id);
      if (index >= 0) {
        for (const param of Object.keys(server.state)) {
          Vue.set(state.servers[index].state, param, server.state[param]);
        }
      } else {
        state.servers.push(server);
      }
    },
    removeTorrent(state, torrent) {
      const index = state.torrents.findIndex(
        t => t.server.id == torrent.server.id && t.hash == torrent.hash
      );
      if (index >= 0) {
        state.torrents.splice(index, 1);
      }
    }
  },
  actions: {
    getTorrents({ commit }) {
      return browser.runtime
        .sendMessage({ action: "getTorrents" })
        .then((torrents: Torrent[]) => {
          commit("setTorrents", torrents);
        });
    },
    getTrackers({ commit }) {
      return browser.runtime
        .sendMessage({ action: "getTrackers" })
        .then((trackers: { [key: string]: string[] }) => {
          commit("setTrackers", trackers);
        });
    },
    getServers({ commit }) {
      return browser.runtime
        .sendMessage({ action: "getServers" })
        .then((servers: { id: string; name: string; state: ServerState }[]) => {
          commit("setServers", servers);
        });
    },
    getCategories({ commit }) {
      return browser.runtime
        .sendMessage({ action: "getCategories" })
        .then(categories => {
          commit("setCategories", categories);
        });
    },
    loadTorrent({ commit }, torrent) {
      return browser.runtime
        .sendMessage({ action: "loadTorrent", torrent })
        .then((torrent: Torrent) => {
          if (torrent) {
            commit("updateTorrents", [torrent]);
          }
          return torrent;
        });
    },
    loadTrackers({ commit }, torrent) {
      return browser.runtime
        .sendMessage({ action: "loadTrackers", torrent })
        .then((torrent: Torrent) => {
          if (torrent) {
            commit("updateTorrents", [torrent]);
          }
          return torrent;
        });
    },
    deleteTorrents(_context, data) {
      return browser.runtime.sendMessage({ action: "deleteTorrents", data });
    },
    pauseTorrents(_context, torrents) {
      return browser.runtime.sendMessage({ action: "pauseTorrents", torrents });
    },
    resumeTorrents(_context, torrents) {
      return browser.runtime.sendMessage({
        action: "resumeTorrents",
        torrents
      });
    },
    setFilePriority(_context, data) {
      return browser.runtime.sendMessage({ action: "setFilePriority", data });
    }
  },
  getters: {
    servers(state) {
      return state.servers;
    },
    categories(state) {
      return state.categories;
    },
    trackers(state) {
      return state.trackers;
    }
  },
  modules: {}
});

export default store;

store.dispatch("getServers");
store.dispatch("getCategories");
store.dispatch("getTrackers");
store.dispatch("getTorrents");

browser.runtime.onMessage.addListener(message => {
  switch (message.event) {
    case TorrentServerEvents.TorrentsAdded:
    case TorrentServerEvents.TorrentsChanged:
      store.commit("updateTorrents", message.data);
      break;
    case TorrentServerEvents.TorrentRemoved:
      store.commit("removeTorrent", message.data);
      break;
    case TorrentServerEvents.StateChanged:
      store.commit("updateServer", message.data);
      break;
  }
});
