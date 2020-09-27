<template>
  <v-dialog v-model="dialog" width="800">
    <v-card rounded shaped raised>
      <v-card-title>
        <span class="headline">{{ torrent.name }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col sm="4"> Size: {{ torrent.size | prettyBytes }}</v-col>
          <v-col sm="4">
            Ratio: {{ torrent.ratio ? torrent.ratio.toFixed(3) : "" }}
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="4"> Added: {{ torrent.added_on | FromNow }}</v-col>
          <v-col sm="4"> ETA: {{ torrent.eta | ETA }}</v-col>
          <v-col sm="4">
            Time active:
            {{ timeActive }}
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="4">
            Downloaded:
            {{ torrent.downloaded | prettyBytes }}
          </v-col>
          <v-col sm="4">Uploaded: {{ torrent.uploaded | prettyBytes }}</v-col>
        </v-row>
        <v-row>
          <v-col sm="12">
            Progress: {{ +(torrent.progress * 100).toFixed(4) }}%
            <v-progress-linear
              :value="torrent.progress * 100"
              :indeterminate="torrent.progress === 0"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-subtitle>
        <v-tabs centered slider-color="blue" v-model="tab">
          <v-tab href="#tab-details">Details</v-tab>
          <v-tab href="#tab-trackers">Trackers</v-tab>
          <v-tab href="#tab-files">Files</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item value="tab-details">
            <v-card flat>
              <v-card-text v-if="!details">
                Loading
                <v-progress-linear
                  indeterminate
                  color="blue"
                ></v-progress-linear>
              </v-card-text>
              <v-card-text v-if="details">
                <v-row>
                  <v-col cols="4">
                    Last seen on:
                    {{ details.last_seen | moment("DD/MM/YY HH:mm") }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    Comment: <br />
                    {{ details.comment }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab-trackers">
            <v-card flat>
              <v-card-text v-if="!trackers">
                Loading
                <v-progress-linear
                  indeterminate
                  color="blue"
                ></v-progress-linear>
              </v-card-text>
              <v-card-text v-if="trackers">
                <v-data-table
                  :headers="[
                    { text: 'Url', value: 'url' },
                    { text: 'Message', value: 'msg' },
                    { text: 'Status', value: 'status' }
                  ]"
                  :items="trackers"
                  :items-per-page="5"
                >
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab-files">
            <v-card flat>
              <v-card-text v-if="!files">
                Loading
                <v-progress-linear
                  indeterminate
                  color="blue"
                ></v-progress-linear>
              </v-card-text>
              <v-card-text v-if="files">
                <v-data-table
                  :headers="[
                    { text: 'Name', value: 'name' },
                    { text: 'Size', value: 'size', width: '150px' },
                    { text: 'Progress', value: 'progress' }
                  ]"
                  :items="files"
                  :items-per-page="5"
                >
                  <template v-slot:item.size="{ item }"
                    >{{ item.size | prettyBytes }}
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
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card-subtitle>
      <v-card-actions>
        <v-spacer />
        <delete-torrent-modal :torrent="torrent" @deleted="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  Torrent,
  TorrentDatails,
  TorrentFile,
  TorrentTracker
} from "@/lib/abstract/Torrent";
import DeleteTorrentModal from "@/main/components/DeleteTorrentModal.vue";
import moment from "moment";
@Component({
  components: { DeleteTorrentModal }
})
export default class TorrentDetailsModal extends Vue {
  dialog = false;
  tab = null;
  loading = false;
  torrent = {} as Torrent;
  files: Array<TorrentFile> | null = null;
  details: TorrentDatails | null = null;
  trackers: Array<TorrentTracker> | null = null;

  get timeActive() {
    return moment()
      .add(this.torrent.time_active, "seconds")
      .fromNow(true);
  }

  open(torrent: Torrent) {
    this.torrent = torrent;
    this.details = null;
    this.trackers = null;
    this.files = null;
    this.torrent.loadAll().then(() => {
      this.trackers = this.torrent.trackers || null;
      this.files = this.torrent.files || null;
      this.details = this.torrent.details || null;
    });
    this.dialog = true;
  }

  close() {
    this.dialog = false;
  }
}
</script>
