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
                  <label>All-time upload</label>
                  <v-spacer />
                  {{ server.getState().alltime_ul | prettyBytes }}
                </v-col>
                <v-col>
                  <label>All-time download</label>
                  <v-spacer />
                  {{ server.getState().alltime_dl | prettyBytes }}
                </v-col>
                <v-col>
                  <label>All-time share ratio</label>
                  <v-spacer />
                  {{ server.getState().global_ratio }}
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <label>Free space on disk</label>
                  <v-spacer />
                  {{ server.getState().free_space_on_disk | prettyBytes }}
                </v-col>
                <v-col>
                  <label>Connected peers</label>
                  <v-spacer />
                  {{ server.getState().total_peer_connections }}
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
