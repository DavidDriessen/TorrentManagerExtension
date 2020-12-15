<template>
  <v-treeview
    :items="f"
    item-children="files"
    item-text="name"
    item-key="name"
    open-on-click
  >
    <template v-slot:label="{ leaf, item }">
      <template v-if="!leaf">
        {{ item.name }}
        <v-progress-linear
          v-if="torrent"
          height="10"
          :value="item.progress * 100"
          dark
        >
          <small> {{ Math.floor(item.progress * 100) }}% </small>
        </v-progress-linear>
      </template>
      <template v-if="leaf">
        {{ item.name }}
        <v-progress-linear
          v-if="torrent"
          height="10"
          :value="item.progress * 100"
          dark
        >
          <small> {{ Math.floor(item.progress * 100) }}% </small>
        </v-progress-linear>
      </template>
    </template>
    <template v-slot:append="{ leaf, item }">
      <v-row
        :style="
          'width: ' + (torrent && leaf ? 250 : 90) + 'px;text-align: right'
        "
      >
        <v-col v-if="torrent && leaf" cols="7" style="padding: 0;">
          <v-menu>
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-icon small>fas fa-caret-down</v-icon>
                {{ prioToText(item.priority) }}
              </div>
            </template>
            <v-list>
              <v-list-item
                v-for="i in [
                  { value: 0, text: 'Don\'t download' },
                  { value: 1, text: 'Normal' },
                  { value: 6, text: 'High' },
                  { value: 7, text: 'Max' }
                ]"
                :key="i.value"
                @click="setFilePriority(item, i.value)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ i.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <v-col :cols="torrent && leaf ? 5 : 12" style="padding: 0 20px 0 0;">
          {{ (item.size || item.length) | prettyBytes }}
        </v-col>
      </v-row>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  Torrent,
  TorrentFile,
  TorrentFileDirectory
} from "@/lib/abstract/Torrent";

@Component
export default class FileList extends Vue {
  @Prop() torrent?: Torrent;
  @Prop() files!: (TorrentFile | TorrentFileDirectory)[];

  get f() {
    return this.files;
  }

  prioToText(prio: number) {
    if (prio <= 0) return "Don't download";
    if (prio <= 4) return "Normal";
    if (prio <= 6) return "High";
    return "Max";
  }

  setFilePriority(file: TorrentFile, priority: number) {
    file.priority = priority;
    this.$store.dispatch("setFilePriority", {
      torrent: this.torrent,
      files: [file],
      priority
    });
  }
}
</script>
