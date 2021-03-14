<template>
  <v-tabs>
    <v-tab>Connection</v-tab>
    <v-tab :disabled="!server.state">Speed</v-tab>
    <v-tab>Delete</v-tab>
    <v-tab-item>
      <v-card-text>
        <v-text-field label="Name" v-model="server.settings.name" />
        <v-row>
          <v-col>
            <v-select
              label="Type"
              v-model="server.settings.type"
              :items="types"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" sm="3" lg="2">
            <v-select
              label="Protocol"
              v-model="server.settings.host.protocol"
              :items="[
                { text: 'HTTP', value: 'http:' },
                { text: 'HTTPS', value: 'https:' }
              ]"
            />
          </v-col>
          <v-col cols="6" sm="4" lg="4">
            <v-text-field
              label="Hostname"
              v-model="server.settings.host.host"
            />
          </v-col>
          <v-col cols="6" sm="2" lg="2">
            <v-text-field label="Port" v-model="server.settings.host.port" />
          </v-col>
          <v-col cols="6" sm="3" lg="4">
            <v-text-field
              label="Path"
              v-model="server.settings.host.pathname"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field label="Username" v-model="server.settings.username" />
          </v-col>
          <v-col>
            <v-text-field
              label="Password"
              v-model="server.settings.password"
              type="password"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-tab-item>
    <v-tab-item>
      <v-card-text>
        <v-row v-if="preferences">
          <v-col>
            <v-text-field
              v-model="preferences.upLimit"
              label="Upload limit"
              type="number"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="preferences.dlLimit"
              label="Download limit"
              type="number"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-tab-item>
    <v-tab-item>
      <v-card>
        <v-card-title>You sure?</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="$emit('delete', server)">
            Delete server
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-tab-item>
    <v-tab-item />
  </v-tabs>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Server } from "@/main/store";
import { ServerType } from "@/lib/abstract/TorrentServer";

@Component
export default class ServerOptions extends Vue {
  @Prop() server!: Server;
  types: ServerType[] = [];
  preferences: {
    upLimit: number;
    dlLimit: number;
  } = {
    upLimit: 0,
    dlLimit: 0
  };

  mounted() {
    this.types = Object.values(ServerType);
    if (this.server.state) {
      this.preferences.upLimit = this.server.state.up_rate_limit;
      this.preferences.dlLimit = this.server.state.dl_rate_limit;
    }
  }
}
</script>
