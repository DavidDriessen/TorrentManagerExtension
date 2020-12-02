<template>
  <v-list-group>
    <template v-slot:activator>
      <v-list-item-title>{{ item.name }}</v-list-item-title>
    </template>
    <template v-for="item in d">
      <file-list-item v-if="!item.files" :file="item" :key="item.id" />
      <file-list-sub v-if="!!item.files" :dir="item" :key="item.id" />
    </template>
  </v-list-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TorrentFileDirectory } from "@/lib/abstract/Torrent";
import FileListItem from "@/main/components/filetree/FileListItem.vue";

// eslint-disable-next-line @typescript-eslint/no-use-before-define
@Component({ components: { FileListItem, FileListSub } })
export default class FileListSub extends Vue {
  @Prop() dir!: TorrentFileDirectory;

  get d() {
    return this.dir;
  }
}
</script>
