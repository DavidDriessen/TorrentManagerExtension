<template>
  <v-list>
    <template v-for="item in f">
      <file-list-item v-if="!item.files" :file="item" :key="item.id" />
      <v-list-group v-if="!!item.files" :key="item.id">
        <template v-slot:activator>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </template>
        <file-list :files="item.files" />
      </v-list-group>
    </template>
  </v-list>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TorrentFile, TorrentFileDirectory } from "@/lib/abstract/Torrent";
import FileListItem from "@/main/components/filetree/FileListItem.vue";

// eslint-disable-next-line @typescript-eslint/no-use-before-define
@Component({ components: { FileList, FileListItem } })
export default class FileList extends Vue {
  @Prop() files!: (TorrentFile | TorrentFileDirectory)[];

  get f() {
    return this.files;
  }
}
</script>
