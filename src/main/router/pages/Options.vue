<template>
  <v-container>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Extension options</v-toolbar-title>
        <v-spacer />
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col md="5">
            <v-card height="200">
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
                      <v-select
                        label="Type"
                        v-model="server.type"
                        :items="types"
                      />
                      <v-text-field
                        label="Host"
                        v-model="server.host"
                        :rules="[validURL]"
                      />
                      <v-text-field
                        label="Username"
                        v-model="server.username"
                      />
                      <v-text-field
                        label="Password"
                        v-model="server.password"
                        type="password"
                      />
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
import { ServerSettings, ServerType } from "@/lib/abstract/TorrentServer";

interface Link {
  name: string;
  url: string;
}

@Component
export default class Options extends Vue {
  form: { servers: ServerSettings[]; links: Link[] } = {
    servers: [],
    links: []
  };
  types: ServerType[] = [];

  validURL(str: string) {
    const pattern = new RegExp(
      "^(https?:\\/\\/)" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return pattern.test(str) || "Invalid url";
  }

  mounted() {
    this.types = Object.values(ServerType);
    browser.storage.sync.get().then(data => {
      if (data.links && data.links.lenght > 0) this.form.links = data.links;
      else this.addLink();
      if (data.servers) this.form.servers = data.servers;
      else this.addServer();
    });
  }

  addServer() {
    this.form.servers.push({
      name: "Main",
      host: "",
      type: ServerType.Qbit,
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
  deleteLink(link: Link) {
    this.form.links = this.form.links.filter(l => l !== link);
  }

  save() {
    browser.storage.sync.set(this.form).then(() => {
      // Notify that we saved.
      alert("Settings saved");
      browser.runtime.reload();
    });
  }
}
</script>
