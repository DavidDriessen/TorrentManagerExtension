<template>
  <v-dialog width="800">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>fas fa-filter</v-icon>
      </v-btn>
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
            >
              <template v-slot:item="{ item }">
                <v-list-item-icon>
                  <TorrentState :state="item" />
                </v-list-item-icon>
                <v-list-item-title>
                  {{ item }}
                </v-list-item-title>
              </template>
            </v-autocomplete>
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
import TorrentStateComponent from "@/main/components/TorrentState.vue";
import { TorrentState } from "@/lib/abstract/Torrent";

export interface TorrentFilterType {
  state: string[];
  tracker: {
    tracker: string;
    torrents: { serverId: string; torrentHash: string }[];
  }[];
  category: string[];
}

@Component({
  components: { TorrentState: TorrentStateComponent }
})
export default class TorrentFilter extends Vue {
  states = Object.values(TorrentState);
  filter: TorrentFilterType = {
    state: [],
    tracker: [],
    category: []
  };

  get trackers() {
    if (!this.$store.getters.trackers) return [];
    return Object.entries(this.$store.getters.trackers).map(([key, value]) => {
      return { text: key, value: { tracker: key, torrents: value } };
    });
  }

  get categories() {
    return [
      ...new Set(
        this.$store.getters.categories.map((c: { name: string }) => c.name)
      )
    ];
  }

  @Watch("filter", { deep: true })
  updateFilter() {
    this.$emit("filter", this.filter);
  }
}
</script>
