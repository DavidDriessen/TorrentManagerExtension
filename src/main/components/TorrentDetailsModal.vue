<template>
  <v-dialog v-model="dialog" width="1000">
    <v-card rounded shaped raised>
      <v-card-title>
        <span class="headline">{{ torrent.name }}</span>
      </v-card-title>
      <v-divider />
      <v-tabs slider-color="blue" v-model="tab" grow>
        <v-tab href="#tab-details">Details</v-tab>
        <v-tab href="#tab-trackers">Trackers</v-tab>
        <v-tab href="#tab-files">Files</v-tab>
      </v-tabs>
      <v-progress-linear
        :value="torrent.progress * 100"
        :indeterminate="torrent.progress === 0"
        color="light-blue"
        height="15"
        dark
      >
        Progress: {{ +(torrent.progress * 100).toFixed(4) }}%
      </v-progress-linear>
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-details">
          <v-card flat>
            <v-card-text v-if="!details">
              <v-progress-linear color="blue" height="30" indeterminate rounded>
                Loading
              </v-progress-linear>
            </v-card-text>
            <v-card-text v-if="details">
              <v-row>
                <v-col sm="3">
                  <v-text-field
                    label="Size"
                    :value="torrent.size | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="Ratio"
                    :value="torrent.ratio ? torrent.ratio.toFixed(3) : ''"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="Downloaded"
                    :value="torrent.downloaded | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="Uploaded"
                    :value="torrent.uploaded | prettyBytes"
                    readonly
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col sm="3">
                  <v-text-field
                    label="Added"
                    :value="torrent.added_on | FromNow"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="ETA"
                    :value="torrent.eta | ETA"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="Time active"
                    :value="timeActive"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="3">
                  <v-text-field
                    label="Last seen on"
                    :value="details.last_seen | moment('DD/MM/YY HH:mm')"
                    readonly
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col sm="6">
                  <v-text-field
                    label="Save Path"
                    :value="details.save_path"
                    readonly
                    outlined
                  />
                </v-col>
                <v-col sm="6">
                  <v-select
                    label="Category"
                    :value="torrent.category"
                    outlined
                    :items="categories"
                    @change="changeCategory"
                  />
                </v-col>
              </v-row>
              <v-row v-if="details.comment">
                <v-col cols="12">
                  <v-textarea
                    label="Comment"
                    :value="details.comment"
                    readonly
                    outlined
                    no-resize
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item value="tab-trackers">
          <v-card v-if="!trackers" flat>
            <v-card-text>
              <v-progress-linear indeterminate color="blue" height="30">
                Loading
              </v-progress-linear>
            </v-card-text>
          </v-card>
          <v-card v-if="trackers" flat>
            <v-data-table
              :headers="[
                { text: 'Url', value: 'url' },
                { text: 'Message', value: 'msg' },
                { text: 'Status', value: 'status' }
              ]"
              :items="trackers"
              :items-per-page="5"
              :hide-default-footer="trackers && trackers.length <= 5"
              :footer-props="{
                'items-per-page-options': [5]
              }"
            >
            </v-data-table>
          </v-card>
        </v-tab-item>
        <v-tab-item value="tab-files">
          <v-card v-if="!files" flat>
            <v-card-text>
              <v-progress-linear indeterminate color="blue" height="30">
                Loading
              </v-progress-linear>
            </v-card-text>
          </v-card>
          <v-card v-if="files" flat>
            <file-list :torrent="torrent" :files="files" />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
      <v-divider />
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
import FileList from "@/main/components/FileList.vue";

@Component({
  components: { FileList, DeleteTorrentModal }
})
export default class TorrentDetailsModal extends Vue {
  dialog = false;
  tab = null;
  loading = false;
  torrent = {} as Torrent;
  files: TorrentFile[] | null = null;
  details: TorrentDatails[] | null = null;
  trackers: TorrentTracker[] | null = null;

  get timeActive() {
    return moment()
      .add(this.torrent.time_active, "seconds")
      .fromNow(true);
  }

  get categories() {
    return [
      ...new Set(
        this.$store.getters.categories
          .filter(
            (c: { serverId: string }) => c.serverId == this.torrent.server.id
          )
          .map((c: { name: string }) => c.name)
      )
    ];
  }

  changeCategory(category: string) {
    this.$store.dispatch("setCategory", {
      torrent: this.torrent,
      category
    });
  }

  open(torrent: Torrent) {
    this.torrent = torrent;
    this.details = null;
    this.trackers = null;
    this.files = null;
    this.$store.dispatch("loadTorrent", torrent).then(torrent => {
      this.torrent = torrent;
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
