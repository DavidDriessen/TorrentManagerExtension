<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text>Add torrent</v-btn>
    </template>
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          <span class="headline">Add torrent</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" @submit.prevent="addTorrents()" lazy-validation>
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
            <v-text-field
              label="Torrent"
              required
              v-model="torrentToAdd"
              :rules="torrentFieldRulles"
              :error-messages="torrentFieldError"
            />
            <v-btn @click="addTorrent(torrentToAdd)" tile>
              <v-icon left>fas fa-plus</v-icon>
              Check
            </v-btn>
          </v-row>
          <v-row>
            <v-col>
              <v-list>
                <v-list-item v-for="(t, ti) in torrentsToAdd" :key="ti">
                  <v-list-item-title v-if="t.info">
                    {{ t.info.name }}
                  </v-list-item-title>
                  <v-list-item-content v-if="!t.info">
                    {{ t.url }}
                  </v-list-item-content>
                  <v-spacer />
                  <v-dialog v-if="t.info && t.info.files" width="800">
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" icon>
                        <v-icon>fas fa-file</v-icon>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title>
                        {{ t.info.name }}
                      </v-card-title>
                      <v-data-table
                        :items="t.info.files"
                        :headers="[
                          { text: 'File', value: 'name' },
                          { text: 'Size', value: 'length' }
                        ]"
                      >
                        <template v-slot:item.length="{ item }">
                          {{ item.length | prettyBytes }}
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-dialog>
                  <v-btn
                    @click="torrentsToAdd.splice(ti, 1)"
                    :loading="!t.info"
                    color="red"
                    icon
                  >
                    <v-icon>fas fa-times</v-icon>
                  </v-btn>
                </v-list-item>
              </v-list>
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
        <v-btn color="success" @click="addTorrents()" :loading="loading">
          Add torrent
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TorrentServer, { AddTorrentOptions } from "@/lib/abstract/TorrentServer";
import ParseTorrent, { Instance } from "parse-torrent";

@Component
export default class AddTorrentModal extends Vue {
  dialog = false;
  loading = false;

  server: TorrentServer | null = null;
  options: AddTorrentOptions = { automatic: true };

  torrentToAdd = "";
  torrentsToAdd: { url: string; info?: Instance }[] = [];

  error = "";
  torrentFieldError = "";
  torrentFieldRulles = [
    () => this.torrentsToAdd.length > 0 || "Please add/check a torrent"
  ];

  mounted() {
    browser.runtime.onMessage.addListener(request => {
      switch (request.uiAction) {
        case "AddLink":
          this.dialog = true;
          this.addTorrent(request.link);
      }
    });
  }

  get servers() {
    return this.$store.getters.servers;
  }

  get categories() {
    if (this.server) {
      return [
        "",
        ...new Set(
          this.$store.getters.categories
            .filter((c: { serverId: string }) => c.serverId == this.server?.id)
            .map((c: { name: string }) => c.name)
        )
      ];
    }
    return [];
  }

  addTorrent(url: string) {
    this.torrentFieldError = "";
    if (this.torrentToAdd == url) {
      if (url.match(/^(?:http|magnet:|bc:)/)) {
        this.torrentToAdd = "";
      } else {
        this.torrentFieldError = "Link invalid";
        return;
      }
    }
    if (this.torrentsToAdd.some(t => t.url == url)) return;
    const torrentLink: { url: string; info?: Instance } = { url };
    ParseTorrent.remote(url, (err: Error, info?: Instance) => {
      Vue.set(torrentLink, "info", info);
    });
    this.torrentsToAdd.push(torrentLink);
  }

  addTorrents() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (this.$refs.form.validate()) {
      if (this.server) {
        this.loading = true;
        this.error = "";
        this.$store
          .dispatch("addTorrent", {
            server: this.server,
            torrents: this.torrentsToAdd.map(t => t.url),
            options: this.options
          })
          .then(() => {
            this.dialog = false;
            this.loading = false;
            this.torrentsToAdd = [];
          })
          .catch(e => {
            console.log(e);
            if (e.response.status == 415) {
              this.error = "Torrent is not valid";
            }
          });
      }
    }
  }

  open(url: string) {
    this.addTorrent(url);
    this.dialog = true;
  }
}
</script>
