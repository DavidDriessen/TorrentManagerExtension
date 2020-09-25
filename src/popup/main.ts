import Vue from "vue";
import App from "./App.vue";
import store from "../main/store";
import VueMoment from "vue-moment";
import VueResource from "vue-resource";
import vuetify from "../plugins/vuetify";
import prettyBytes from "../plugins/prettyBytes";
import moment from "moment";

// usage: {{ file.size | prettyBytes }}
Vue.filter("prettyBytes", prettyBytes);
Vue.use(VueResource);
Vue.config.productionTip = false;
Vue.use(VueMoment, "en");

Vue.filter("FromNow", (time: number) => {
  return moment.unix(time).fromNow();
});
Vue.filter("ETA", (time: number) => {
  return moment.unix(0).from(moment.unix(time));
});

const app = new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");

browser.storage.sync.get("preference").then(({ preference }) => {
  app.$vuetify.theme.dark = preference?.darkMode;
});
