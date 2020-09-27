// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Vue from "vue";
import VueRouter from "vue-router";
import Torrents from "./pages/Torrents.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Torrents",
    component: Torrents
  },
  {
    path: "/add/:newTorrent",
    name: "AddTorrents",
    component: Torrents
  },
  {
    path: "/options",
    name: "Options",
    component: () => import("./pages/Options.vue")
  }
];

const router = new VueRouter({
  // mode: "history",
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  base: process.env.BASE_URL,
  routes
});

export default router;
