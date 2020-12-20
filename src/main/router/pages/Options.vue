<template>
  <v-container>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Extension options</v-toolbar-title>
        <v-spacer />
        <v-alert type="error" elevation="3" v-if="error">{{ error }}</v-alert>
        <v-btn color="primary" @click="save" :loading="loading">Save</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col sm="12" md="6">
            <v-card color="primary" height="200" dark>
              <v-card-title>
                Links
                <v-spacer />
                <v-btn
                  @click="form.linksEnabled = !form.linksEnabled"
                  :elevation="1"
                  rounded
                  text
                >
                  {{ form.linksEnabled ? "disable" : "enable" }}
                </v-btn>
              </v-card-title>
              <v-tabs background-color="primary" dark vertical>
                <v-tab v-for="(link, key) in form.links" :key="key">
                  {{ link.name }}
                </v-tab>
                <v-btn @click="addLink" text height="60">
                  Add link
                </v-btn>

                <v-tab-item v-for="(link, key) in form.links" :key="key">
                  <v-card flat>
                    <v-card-text>
                      <v-text-field label="Name" v-model="link.name" />
                      <v-text-field label="Url" v-model="link.url" />
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        v-if="form.links.length > 1"
                        color="error"
                        @click="deleteLink(link)"
                      >
                        Delete link
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-col>
          <v-col>
            <v-card height="200">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>
                  Notifications
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-checkbox
                      label="Downloading"
                      v-model="form.notify.downloading"
                    />
                  </v-col>
                  <v-col>
                    <v-checkbox
                      label="Finish downloadi"
                      v-model="form.notify.downloaded"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="start">
          <v-col sm="12" md="8">
            <v-card color="primary" dark>
              <v-card-title>Servers</v-card-title>
              <v-tabs background-color="primary" dark vertical>
                <v-tab v-for="(server, key) in form.servers" :key="key">
                  {{ server.name }}
                </v-tab>
                <v-btn @click="addServer" text height="60">
                  Add server
                </v-btn>

                <v-tab-item v-for="(server, key) in form.servers" :key="key">
                  <v-card flat>
                    <v-card-text>
                      <v-text-field label="Name" v-model="server.name" />
                      <v-row>
                        <v-col>
                          <v-select
                            label="Type"
                            v-model="server.type"
                            :items="types"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col sm="4" cols="5" lg="3">
                          <v-select
                            label="Protocol"
                            v-model="server.host.protocol"
                            :items="[
                              { text: 'HTTP', value: 'http:' },
                              { text: 'HTTPS', value: 'https:' }
                            ]"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            label="Hostname"
                            v-model="server.host.hostname"
                          />
                        </v-col>
                        <v-col cols="3" lg="2">
                          <v-text-field
                            label="Port"
                            v-model="server.host.port"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            label="Path"
                            v-model="server.host.pathname"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            label="Username"
                            v-model="server.username"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            label="Password"
                            v-model="server.password"
                            type="password"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        v-if="form.servers.length > 1"
                        color="error"
                        @click="deleteServer(server)"
                      >
                        Delete server
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  ServerSettings,
  ServerType,
  TorrentLink
} from "@/lib/abstract/TorrentServer";
import { Notify } from "@/lib/ServerManager";

@Component
export default class Options extends Vue {
  form: {
    linksEnabled: boolean;
    servers: ServerSettings[];
    links: TorrentLink[];
    notify: Notify;
  } = {
    servers: [],
    linksEnabled: true,
    links: [],
    notify: {
      downloading: true,
      downloaded: true
    }
  };
  types: ServerType[] = [];
  loading = false;
  error = "";

  mounted() {
    this.types = Object.values(ServerType);
    browser.storage.sync.get().then(data => {
      if (data.notify) this.form.notify = data.notify;
      if (data.links && data.links.length > 0) this.form.links = data.links;
      else this.addLink();
      if (data.linksEnabled != undefined)
        this.form.linksEnabled = data.linksEnabled;
      if (data.servers)
        this.form.servers = data.servers.map((s: ServerSettings) => {
          try {
            s.host = new URL(s.host as string);
          } catch (e) {
            s.host = new URL("http://example.com");
          }
          return s;
        });
      else this.addServer();
    });
  }

  addServer() {
    this.form.servers.push({
      name: "Main",
      type: ServerType.Qbit,
      host: new URL("http://example.com"),
      username: "",
      password: ""
    });
  }

  deleteServer(server: ServerSettings) {
    this.form.servers = this.form.servers.filter(s => s !== server);
  }

  addLink() {
    this.form.links.push({ name: "Link", url: "" });
  }

  deleteLink(link: TorrentLink) {
    this.form.links = this.form.links.filter(l => l !== link);
  }

  save() {
    this.loading = true;
    this.error = "";
    const data: {
      servers: ServerSettings[];
      linksEnabled: boolean;
      links: TorrentLink[];
      notify: Notify;
    } = {
      servers: [],
      linksEnabled: this.form.linksEnabled,
      links: this.form.links,
      notify: this.form.notify
    };
    data.servers = this.form.servers.map(s => {
      return {
        name: s.name,
        type: s.type,
        host: (s.host as URL).toString(),
        username: s.username,
        password: s.password
      };
    });
    browser.runtime
      .sendMessage({ action: "saveSettings", data })
      .then(error => {
        this.loading = false;
        if (error) {
          this.error = error;
        } else {
          this.$store.dispatch("getServers");
          this.$store.dispatch("getCategories");
          this.$store.dispatch("getTrackers");
          this.$store.dispatch("getTorrents");
          this.$router.push({ name: "Torrents" });
        }
      });
  }
}
</script>
