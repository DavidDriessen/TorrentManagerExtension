<template>
  <v-container>
    <v-card>
      <v-tabs
        v-model="mainTab"
        background-color="primary"
        dark
        center-active
        grow
      >
        <v-tab>Extension options</v-tab>
        <v-tab v-for="(server, key) in servers" :key="key">
          {{ server.settings.name }}
        </v-tab>
        <v-tab :key="servers.length">Add server</v-tab>
      </v-tabs>
      <v-tabs-items :value="mainTab">
        <v-tab-item>
          <v-row>
            <v-col sm="12" md="6">
              <v-card color="primary" height="200" dark>
                <v-card-title>
                  Links
                  <v-spacer />
                  <v-btn
                    @click="linksEnabled = !linksEnabled"
                    :elevation="1"
                    rounded
                    text
                  >
                    {{ linksEnabled ? "disable" : "enable" }}
                  </v-btn>
                </v-card-title>
                <v-tabs background-color="primary" dark vertical>
                  <v-tab v-for="(link, key) in links" :key="key">
                    {{ link.name }}
                  </v-tab>
                  <v-btn @click="addLink" text height="60">
                    Add link
                  </v-btn>

                  <v-tab-item v-for="(link, key) in links" :key="key">
                    <v-card flat>
                      <v-card-text>
                        <v-text-field label="Name" v-model="link.name" />
                        <v-text-field label="Url" v-model="link.url" />
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          v-if="links.length > 1"
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
                        v-model="notify.downloading"
                      />
                    </v-col>
                    <v-col>
                      <v-checkbox
                        label="Finish downloadi"
                        v-model="notify.downloaded"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item v-for="(server, key) in servers" :key="key">
          <server-options :server="server" @delete="deleteServer" />
        </v-tab-item>
        <v-tab-item :key="servers.length">
          tfvgykhbujn
        </v-tab-item>
      </v-tabs-items>
      <v-card-actions>
        <v-spacer />
        <v-alert type="error" elevation="3" v-if="error">{{ error }}</v-alert>
        <v-btn color="primary" @click="save" :loading="loading">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import {
  ServerSettings,
  ServerType,
  TorrentLink
} from "@/lib/abstract/TorrentServer";
import { Notify } from "@/lib/ServerManager";
import ServerOptions from "@/main/components/ServerOptions.vue";
import { Server } from "@/main/store";

@Component({
  components: { ServerOptions }
})
export default class Options extends Vue {
  mainTab = 0;
  linksEnabled = true;
  servers: Server[] = [];
  links: TorrentLink[] = [];
  notify: Notify = {
    downloading: true,
    downloaded: true
  };
  loading = false;
  error = "";

  mounted() {
    browser.storage.sync.get().then(data => {
      if (data.notify) this.notify = data.notify;
      if (data.links && data.links.length > 0) this.links = data.links;
      else this.addLink();
      if (data.linksEnabled != undefined) this.linksEnabled = data.linksEnabled;
      if (data.servers) {
        this.servers = this.$store.getters.servers.map((s: Server) => {
          const ss = {
            settings: Object.assign({}, s.settings),
            state: s.state
          };
          try {
            ss.settings.host = new URL(ss.settings.host as string);
          } catch (e) {
            ss.settings.host = new URL("http://example.com");
          }
          return ss;
        });
      } else this.servers = [];
    });
  }

  @Watch("mainTab")
  addServer(index: number | undefined) {
    if (index == undefined || index > this.servers.length) {
      this.servers.push({
        settings: {
          name: "Server " + (this.servers.length + 1),
          type: ServerType.Qbit,
          host: new URL("http://example.com"),
          username: "",
          password: ""
        }
      });
    }
  }

  deleteServer(server: ServerSettings) {
    this.mainTab--;
    this.servers = this.servers.filter(s => s !== server);
  }

  addLink() {
    this.links.push({ name: "Link", url: "" });
  }

  deleteLink(link: TorrentLink) {
    this.links = this.links.filter(l => l !== link);
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
      linksEnabled: this.linksEnabled,
      links: this.links,
      notify: this.notify
    };
    data.servers = this.servers.map(s => {
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
