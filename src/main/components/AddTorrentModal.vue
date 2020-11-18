<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text>Add torrent</v-btn>
    </template>
    <v-card>
      <v-toolbar color="primary">
        <v-toolbar-title>
          <span class="headline">Add torrent</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" @submit.prevent="addTorrent()" lazy-validation>
          <v-row>
            <v-col>
              <v-select
                label="Server"
                :items="servers"
                v-model="server"
                item-text="name"
                :return-object="true"
                no-data-text="No servers configured"
                :rules="[v => !!v || 'No server selected']"
                required
              />
            </v-col>
            <v-col>
              <v-select
                label="Category"
                :items="categories"
                v-model="options.category"
                no-data-text="Select a server"
                clearable
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-checkbox label="Automatic" v-model="options.automatic" />
            </v-col>
            <v-col>
              <v-text-field
                :disabled="options.automatic"
                label="Save files to location"
                v-model="options.savePath"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field label="Rename torrent" v-model="options.name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
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
            </v-col>
          </v-row>
          <v-btn type="submit" hidden>Submit</v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-card-subtitle>
          {{ error }}
        </v-card-subtitle>
        <v-spacer />
        <v-btn color="success" @click="addTorrent()" :loading="loading">
          Add torrent
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TorrentServer, { AddTorrentOptions } from "@/lib/abstract/TorrentServer";

@Component
export default class AddTorrentModal extends Vue {
  dialog = false;

  loading = false;

  server: TorrentServer | null = null;
  options: AddTorrentOptions = { automatic: true };

  torrentsToAdd: string[] = [];
  nTorrentsToAdd = 1;

  error = "";

  get servers() {
    return this.$store.getters.servers;
  }

  get categories() {
    if (this.server) {
      return [
        ...new Set(
          this.$store.getters.categories
            .filter((c: { serverId: string }) => c.serverId == this.server?.id)
            .map((c: { name: string }) => c.name)
        )
      ];
    }
    return [];
  }

  addTorrent() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (this.$refs.form.validate()) {
      if (this.server) {
        this.loading = true;
        this.error = "";
        this.server
          .addTorrent(this.torrentsToAdd, this.options)
          .then(() => {
            this.dialog = false;
            this.loading = false;
            this.torrentsToAdd = [];
          })
          .catch(e => {
            if (e.response.status == 415) {
              this.error = "Torrent is not valid";
            }
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
