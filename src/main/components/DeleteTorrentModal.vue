<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-if="torrent" v-on="on" color="red" :loading="loading" text>
        Delete
      </v-btn>
      <v-list-item v-if="torrents" v-on="on" text>
        <v-list-item-icon>
          <v-icon>fas fa-trash</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Delete selected torrents</v-list-item-title>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Delete torrent</span>
      </v-card-title>
      <v-card-text v-if="torrent">
        Are you sure you want to delete torrent:<br />
        {{ torrent.name }} <br />
        from server:<br />
        {{ torrent.server.name }}<br />
        <v-checkbox label="Remove files" v-model="removeFiles" />
      </v-card-text>
      <v-card-text v-if="torrents">
        Are you sure you want to delete the following torrents:<br />
        <v-chip v-for="torrent in torrents" :key="torrent.hash">
          {{ torrent.name }}
        </v-chip>
        <br />
        <v-checkbox label="Remove files" v-model="removeFiles" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="success" @click="dialog = false" :loading="loading">
          No, return
        </v-btn>
        <v-btn color="red" @click="removeTorrent" :loading="loading" dark>
          Yes, delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Torrent } from "@/lib/abstract/Torrent";

@Component
export default class DeleteTorrentModal extends Vue {
  @Prop() torrent?: Torrent;
  @Prop() torrents?: Torrent[];
  dialog = false;
  loading = false;
  removeFiles = false;

  removeTorrent() {
    this.loading = true;
    if (this.torrent) {
      this.$store
        .dispatch("deleteTorrents", {
          torrents: [this.torrent],
          removeFiles: this.removeFiles
        })
        .then(() => {
          this.dialog = false;
          this.loading = false;
          this.$emit("deleted");
        });
    }
    if (this.torrents) {
      this.$store
        .dispatch("deleteTorrents", {
          torrents: this.torrents,
          removeFiles: this.removeFiles
        })
        .then(() => {
          this.dialog = false;
          this.loading = false;
          this.$emit("deleted");
        });
    }
  }
}
</script>
