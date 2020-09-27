<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" color="red" :loading="loading" text>
        Delete
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Delete torrent</span>
      </v-card-title>
      <v-card-text>
        Are you sure you want to delete torrent:<br />
        {{ torrent.name }} <br />
        from server:<br />
        {{ torrent.getServer().name }}<br />
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
  @Prop() torrent!: Torrent;
  dialog = false;
  loading = false;
  removeFiles = false;

  removeTorrent() {
    this.loading = true;
    this.torrent.delete(this.removeFiles).finally(() => {
      this.dialog = false;
      this.$emit("deleted");
    });
  }
}
</script>
