<template>
  <v-icon :color="color"> fas fa-{{ icon }} </v-icon>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TorrentState } from "@/lib/abstract/Torrent";

@Component
export default class TorrentStateVue extends Vue {
  @Prop() state!: TorrentState;

  get icon() {
    switch (this.state) {
      case TorrentState.pausedDL:
      case TorrentState.pausedUP:
        return "pause";
      case TorrentState.metaDL:
      case TorrentState.checkingDL:
      case TorrentState.checkingUP:
        return "cog";
      case TorrentState.queuedDL:
      case TorrentState.stalledDL:
      case TorrentState.downloading:
        return "download";
      case TorrentState.queuedUP:
      case TorrentState.stalledUP:
      case TorrentState.uploading:
        return "upload";
      case TorrentState.Error:
        return "exclamation-triangle";
      default:
        return "";
    }
  }
  get color() {
    switch (this.state) {
      case TorrentState.Error:
      case TorrentState.stalledDL:
      case TorrentState.stalledUP:
        return "red";
      case TorrentState.metaDL:
      case TorrentState.checkingDL:
      case TorrentState.checkingUP:
        return "orange";
      case TorrentState.uploading:
      case TorrentState.downloading:
        return "blue";
      default:
        return "";
    }
  }
}
</script>
