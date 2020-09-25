<template>
  <v-dialog width="800">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" dark v-on="on" text>Filter</v-btn>
    </template>
    <v-card class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Filter</h1>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-autocomplete
              v-model="filter.state"
              :items="states"
              label="State"
              placeholder="State"
              multiple
            />
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="filter.category"
              :items="categories"
              label="Category"
              placeholder="Category"
              multiple
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-autocomplete
              v-model="filter.tracker"
              :items="trackers"
              label="Trackers"
              placeholder="Trackers"
              multiple
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { TorrentState } from "@/lib/abstract/Torrent";

export interface TorrentFilterType {
  state: string[];
  tracker: string[];
  category: string[];
}

@Component
export default class TorrentFilter extends Vue {
  states = Object.values(TorrentState);
  filter: TorrentFilterType = {
    state: [],
    tracker: [],
    category: []
  };

  get trackers() {
    return this.$store.getters.trackers;
  }

  get categories() {
    return this.$store.getters.categories;
  }

  @Watch("filter", { deep: true })
  updateFilter() {
    this.$emit("filter", this.filter);
  }
}
</script>
