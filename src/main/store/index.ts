import Vue from "vue";
import Vuex from "vuex";
import { Torrent, TorrentTracker } from "@/lib/abstract/Torrent";
import { ServerState, TorrentServerEvents } from "@/lib/abstract/TorrentServer";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    servers: [] as { id: string; name: string; state: ServerState }[],
    categories: [] as { name: string; savePath: string }[],
    torrents: [] as Torrent[],
    trackers: [] as string[]
  },
  mutations: {
    setTorrents(state, torrents) {
      state.torrents = torrents;
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    setServers(state, servers) {
      state.servers = servers;
    },
    updateTorrent(state, torrent) {
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
    updateTrackerList(state, trackers) {
      if (trackers) {
        trackers = trackers
          .map((t: TorrentTracker) => t.url)
          .filter((t: string) => {
            return !t.startsWith("*");
          })
          .map((url: string) => {
            let hostname;
            //find & remove protocol (http, ftp, etc.) and get hostname

            if (url.indexOf("//") > -1) {
              hostname = url.split("/")[2];
            } else {
              hostname = url.split("/")[0];
            }
            //find & remove port number
            hostname = hostname.split(":")[0];
            //find & remove "?"
            hostname = hostname.split("?")[0];
            return hostname;
          });
        // Unique
        for (let i = 0; i < trackers.length; ++i) {
          if (state.trackers.indexOf(trackers[i]) === -1)
            state.trackers.push(trackers[i]);
        }
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
          for (const torrent of torrents) {
            commit("updateTrackerList", torrent.trackers);
          }
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
            commit("updateTorrent", torrent);
            commit("updateTrackerList", torrent.trackers);
          }
          return torrent;
        });
    },
    loadTrackers({ commit }, torrent) {
      return browser.runtime
        .sendMessage({ action: "loadTrackers", torrent })
        .then((torrent: Torrent) => {
          if (torrent) {
            commit("updateTorrent", torrent);
            commit("updateTrackerList", torrent.trackers);
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

store.dispatch("getTorrents");
store.dispatch("getCategories");
store.dispatch("getServers");

browser.runtime.onMessage.addListener(message => {
  switch (message.event) {
    case TorrentServerEvents.TorrentAdded:
    case TorrentServerEvents.TorrentChanged:
      store.commit("updateTorrent", message.data);
      break;
    case TorrentServerEvents.TorrentRemoved:
      store.commit("removeTorrent", message.data);
      break;
    case TorrentServerEvents.StateChanged:
      store.commit("updateServer", message.data);
      break;
  }
});
