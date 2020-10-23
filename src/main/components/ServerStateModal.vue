<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text>Server States</v-btn>
    </template>
    <v-card color="primary" dark>
      <v-card-title>
        <span class="headline">Server States</span>
      </v-card-title>
      <v-tabs background-color="primary" dark vertical>
        <v-tab v-for="(server, key) in servers" :key="key">
          {{ server.name }}
        </v-tab>

        <v-tab-item v-for="(server, key) in servers" :key="key">
          <v-card flat>
            <v-card-text>
              <v-row>
                <v-col>
                  <b>User statistics:</b>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    label="All-time upload"
                    :value="server.state.alltime_ul | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    label="All-time download"
                    :value="server.state.alltime_dl | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    label="All-time share ratio"
                    :value="server.state.global_ratio"
                    readonly
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    label="Free space on disk"
                    :value="server.state.free_space_on_disk | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    label="Connected peers"
                    :value="server.state.total_peer_connections"
                    readonly
                    outlined
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ServerStateModal extends Vue {
  dialog = false;

  get servers() {
    return this.$store.getters.servers;
  }
}
</script>
