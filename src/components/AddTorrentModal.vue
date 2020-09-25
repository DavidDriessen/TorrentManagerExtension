<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text>Add torrent</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Add torrent</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="addTorrent()" lazy-validation>
          <v-select
            label="Server"
            :items="servers"
            v-model="server"
            item-text="name"
            :return-object="true"
            no-data-text="No servers configured"
            :rules="[v => v || 'No server selected']"
            required
          />
          <v-select
            label="Category"
            :items="categories"
            v-model="category"
            no-data-text="Select a server"
            required
          />
          <v-text-field
            v-for="(n, key) in nTorrentsToAdd"
            :key="key"
            :label="'Torrent ' + n"
            v-model="torrentsToAdd[key]"
            required
            :rules="[
              v => {
                if (!v) {
                  return 'Empty';
                } else if (v.match(/^(?:http|magnet:|bc:)/)) {
                  return true;
                } else {
                  return 'Link invalid';
                }
              }
            ]"
          />
          <v-btn type="submit" hidden>Submit</v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="success" @click="addTorrent()" :loading="loading"
          >addServer</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TorrentServer from "@/lib/abstract/TorrentServer";

@Component
export default class AddTorrentModal extends Vue {
  dialog = false;

  loading = false;

  server: TorrentServer | null = null;
  category = "";
  name = "";

  torrentsToAdd: string[] = [];
  nTorrentsToAdd = 1;

  get servers() {
    return this.$store.getters.servers;
  }

  get categories() {
    if (this.server) {
      return this.server.getCategories();
    }
    return [];
  }

  addTorrent() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (this.$refs.form.validate()) {
      this.loading = true;
      if (this.server) {
        this.server
          .addTorrent(this.torrentsToAdd, this.category, this.name)
          .then(() => {
            this.dialog = false;
            this.loading = false;
            this.torrentsToAdd = [];
          });
      }
    }
  }

  open(torrent: string) {
    this.torrentsToAdd.push(torrent);
    this.dialog = true;
  }
}
</script>
