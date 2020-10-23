<template>
  <v-container>
    <v-data-table
      v-model="selected"
      :headers="[
        { text: 'Name', value: 'name' },
        { text: 'Size', value: 'size', width: '100px', filterable: false },
        { text: 'Progress', value: 'progress', filterable: false },
        { text: 'AddedOn', value: 'added_on', filterable: false },
        { text: 'Ratio', value: 'ratio', filterable: false },
        { text: 'State', value: 'state', filterable: false }
      ]"
      :sort-by="['added_on']"
      :sort-desc="[true]"
      :multi-sort="true"
      :items="torrents"
      :items-per-page="50"
      :search="search"
      class="elevation-1"
      :custom-filter="searchFilter"
      :loading="loading"
      loading-text="Loading... Please wait"
      @click:row="select"
      show-select
      item-key="key"
    >
      <template v-slot:progress>
        <v-progress-linear
          v-model="progress"
          :buffer-value="buffer"
          :indeterminate="buffer === 0"
          :stream="true"
          height="15"
        >
          <strong>{{ Math.ceil(progress) }}%</strong>
        </v-progress-linear>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            prepend-icon="fa-search"
            label="Search"
            hide-details
            single-line
          />
          <v-spacer />
          <TorrentFilter @filter="updateFilter"></TorrentFilter>
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>fas fa-ellipsis-v</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="load('trackers')" text>
                <v-list-item-icon>
                  <v-icon>fas fa-truck-loading</v-icon>
                </v-list-item-icon>
                <v-list-item-title>
                  Load Trackers for selected torrents
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="action('pause')" text>
                <v-list-item-icon>
                  <v-icon>fas fa-pause</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Pause selected torrents</v-list-item-title>
              </v-list-item>
              <v-list-item @click="action('resume')" text>
                <v-list-item-icon>
                  <v-icon>fas fa-play</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Resume selected torrents</v-list-item-title>
              </v-list-item>
              <DeleteTorrentModal
                :torrents="selected"
                @deleted="selected = []"
              />
            </v-list>
          </v-menu>
        </v-toolbar>
      </template>
      <template v-slot:item.size="{ item }">
        {{ item.size | prettyBytes }}
      </template>
      <template v-slot:item.added_on="{ item }">
        {{ item.added_on | FromNow }}
      </template>
      <template v-slot:item.ratio="{ item }">
        {{ item.ratio.toFixed(3) }}
      </template>
      <template v-slot:item.progress="{ item }">
        <v-progress-circular
          :size="40"
          :value="item.progress * 100"
          :width="5"
          color="light-blue"
          >{{ +(item.progress * 100).toFixed(1) }}
        </v-progress-circular>
      </template>
      <template v-slot:item.state="{ item }">
        <TorrentState :state="item.state" />
      </template>
      <template v-slot:no-data>
        No torrents received. Check if the credentials are correct.
      </template>
    </v-data-table>
    <TorrentDetailsModal ref="torrentDetails" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Torrent, TorrentTracker } from "@/lib/abstract/Torrent";
import { AsyncFilterMixin } from "@tygr/vue-async-filter";
import TorrentFilter, {
  TorrentFilterType
} from "@/main/components/TorrentFilter.vue";
import TorrentDetailsModal from "@/main/components/TorrentDetailsModal.vue";
import TorrentState from "@/main/components/TorrentState.vue";
import DeleteTorrentModal from "@/main/components/DeleteTorrentModal.vue";

@Component({
  components: {
    DeleteTorrentModal,
    TorrentState,
    TorrentDetailsModal,
    TorrentFilter
  },
  mixins: [AsyncFilterMixin]
})
export default class Torrents extends Vue {
  search = "";
  loading = false;
  progress = 0;
  buffer = 0;
  selected = [];

  filter: TorrentFilterType = { state: [], tracker: [], category: [] };

  get torrents() {
    return this.$store.state.torrents
      .filter(
        (torrent: Torrent) =>
          this.filter.state.length === 0 ||
          this.filter.state.includes(torrent.state)
      )
      .filter(
        (torrent: Torrent) =>
          this.filter.category.length === 0 ||
          this.filter.category.includes(torrent.category)
      )
      .filter(
        (torrent: Torrent) =>
          this.filter.tracker.length == 0 ||
          (torrent.trackers &&
            torrent.trackers.some((tracker: TorrentTracker) => {
              return (
                this.filter.tracker.some(
                  (f: string) => tracker.url.indexOf(f) >= 0
                ) ||
                this.filter.tracker.some(
                  (f: string) => tracker.msg.indexOf(f) >= 0
                )
              );
            }))
      );
  }

  select(torrent: Torrent) {
    (this.$refs["torrentDetails"] as TorrentDetailsModal).open(torrent);
  }

  searchFilter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    search: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: Torrent
  ) {
    if (search) {
      const searchl: string = search.toLowerCase();
      if (value) {
        value = value.toLowerCase();
        if (value.indexOf(searchl) >= 0) {
          return true;
        }
      }
      return (
        item.trackers &&
        item.trackers.some((tracker: TorrentTracker) => {
          return (
            tracker.url.indexOf(searchl) >= 0 ||
            tracker.msg.indexOf(searchl) >= 0
          );
        })
      );
    }
    return true;
  }

  allProgress(func: () => Promise<void>, torrents: Torrent[]) {
    let d = 0;
    this.progress = 0;
    this.buffer = 0;
    this.loading = true;

    function chunkArray(array: Array<Torrent>, size: number) {
      const result = [];
      for (const value of array) {
        const lastArray = result[result.length - 1];
        if (!lastArray || lastArray.length == size) {
          result.push([value]);
        } else {
          lastArray.push(value);
        }
      }
      return result;
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      for (const chunk of chunkArray(torrents, 10)) {
        this.buffer += (chunk.length * 100) / torrents.length;
        await Promise.all(
          chunk.map((t: Torrent) =>
            func(t).then(() => {
              d++;
              this.progress = (d * 100) / torrents.length;
            })
          )
        );
      }
      resolve();
    }).then(() => {
      this.loading = false;
      this.progress = 0;
      this.buffer = 0;
    });
  }

  updateFilter(f: TorrentFilterType) {
    this.filter = f;
  }

  load(type: "trackers" | "details" | "files" | "webSeeds" | "all") {
    switch (type) {
      case "trackers":
        this.allProgress(
          t => this.$store.dispatch("loadTrackers", t),
          this.selected
        );
        break;
      case "details":
        this.allProgress(
          t => this.$store.dispatch("loadDetails", t),
          this.selected
        );
        break;
      case "all":
        this.allProgress(
          t => this.$store.dispatch("loadAll", t),
          this.selected
        );
        break;
    }
  }

  action(run: "pause" | "resume" | "recheck" | "reannounce" | "delete") {
    switch (run) {
      case "pause":
        this.$store.dispatch("pauseTorrents", this.selected);
        break;
      case "resume":
        this.$store.dispatch("resumeTorrents", this.selected);
        break;
    }
  }
}
</script>
