<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="../../public/icons/128.png"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title>QbitTorrent client</v-toolbar-title>
      </div>

      <v-spacer />
      <v-btn @click="open" text>Open</v-btn>
    </v-app-bar>
    <v-main>
      <v-data-table
        :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Size', value: 'size', width: '100px', filterable: false },
          { text: 'Progress', value: 'progress', filterable: false },
          { text: 'ETA', value: 'eta', width: '100px', filterable: false }
        ]"
        :items="torrents"
        :items-per-page="8"
        :footer-props="{
          'items-per-page-options': [8]
        }"
        :hide-default-footer="torrents.length <= 8"
      >
        <template v-slot:progress>
          <v-progress-linear :indeterminate="true" />
        </template>
        <template v-slot:item.size="{ item }">
          {{ item.size | prettyBytes }}
        </template>
        <template v-slot:item.eta="{ item }">
          {{ item.eta | ETA }}
        </template>
        <template v-slot:item.progress="{ item }">
          <v-progress-circular
            :size="40"
            :value="item.progress * 100"
            :width="5"
            color="light-blue"
            >{{ +(item.progress * 100).toFixed(1) }}
          </v-progress-circular>
        </template>
        <template v-slot:no-data>
          No downloading torrents
        </template>
      </v-data-table>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Torrent, TorrentState } from "@/lib/abstract/Torrent";

@Component
export default class QBitTorrentPopup extends Vue {
  get torrents() {
    return this.$store.state.torrents.filter((torrent: Torrent) => {
      switch (torrent.state) {
        case TorrentState.metaDL:
        case TorrentState.checkingDL:
        case TorrentState.downloading:
        case TorrentState.stalledDL:
        case TorrentState.pausedDL:
        case TorrentState.queuedDL:
        case TorrentState.Error:
          return true;
        default:
          return false;
      }
    });
  }

  get link() {
    return "chrome-extension://" + browser.runtime.id + "/index.html#/";
  }

  open() {
    browser.tabs.create({ url: this.link });
  }
}
</script>

<style>
html,
body {
  width: 800px;
  max-height: 400px;
}
</style>
