import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

function getManager() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return browser.extension.getBackgroundPage().serverManager;
}

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters: {
    servers() {
      return getManager().getServers();
    },
    torrents() {
      return getManager().getTorrents();
    },
    categories() {
      return getManager().getCategories();
    },
    trackers() {
      const arrToConvert = getManager().getTorrents();
      let newArr: string[] = [];

      for (let i = 0; i < arrToConvert.length; i++) {
        if (arrToConvert[i].trackers) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          newArr = newArr.concat(arrToConvert[i].trackers.map(tt => tt.url));
        }
      }
      newArr = newArr.filter(s => {
        return !s.startsWith("*");
      });
      // Unique
      for (let i = 0; i < newArr.length; ++i) {
        for (let j = i + 1; j < newArr.length; ++j) {
          if (newArr[i] === newArr[j]) newArr.splice(j--, 1);
        }
      }
      newArr = newArr.map(url => {
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

      return newArr;
    }
  },
  modules: {}
});
