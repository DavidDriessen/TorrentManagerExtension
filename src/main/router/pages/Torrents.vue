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
      item-key="hash"
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
          <v-btn @click="loadTrackers" :loading="loading" text>
            Refresh Trackers
          </v-btn>
          <TorrentFilter @filter="updateFilter"></TorrentFilter>
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
} from "@/components/TorrentFilter.vue";
import TorrentDetailsModal from "@/components/TorrentDetailsModal.vue";

@Component({
  components: { TorrentDetailsModal, TorrentFilter },
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
    return this.$store.getters.torrents
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
                this.filter.tracker.some(f => tracker.url.indexOf(f) >= 0) ||
                this.filter.tracker.some(f => tracker.msg.indexOf(f) >= 0)
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

  loadDetails() {
    this.allProgress("loadDetails");
  }

  loadTrackers() {
    this.allProgress("loadTrackers");
  }

  allProgress(func: "loadTrackers" | "loadDetails") {
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
      for (const chunk of chunkArray(this.torrents, 10)) {
        this.buffer += (chunk.length * 100) / this.torrents.length;
        await Promise.all(
          chunk.map((t: Torrent) =>
            t[func]().then(() => {
              d++;
              this.progress = (d * 100) / this.torrents.length;
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
}
</script>
