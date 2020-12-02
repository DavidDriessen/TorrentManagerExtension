<template>
  <v-list-item dense>
    <v-list-item-content>
      <v-progress-linear
        :height="50"
        :value="file.progress * 100"
        color="#3ac0fd6e"
        :rounded="5"
      >
        <v-list-item-title>
          <v-text-field
            color="dark"
            :value="file.name"
            flat
            dense
            filled
            rounded
            readonly
            style="top: 20px"
          />
          {{ file.size | prettyBytes }}
        </v-list-item-title>
      </v-progress-linear>
    </v-list-item-content>
    <v-list-item-action>
      <v-select
        color="dark"
        v-if="file.priority !== undefined"
        :items="[
          { value: 0, text: 'Don\'t download' },
          { value: 1, text: 'Normal' },
          { value: 6, text: 'High' },
          { value: 7, text: 'Max' }
        ]"
        :value="file.priority > 0 && file.priority < 6 ? 1 : file.priority"
        @change="setFilePriority(file, $event)"
        style="top: 13px"
        rounded
        flat
        dense
        filled
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TorrentFile } from "@/lib/abstract/Torrent";

@Component
export default class FileListItem extends Vue {
  @Prop() file!: TorrentFile;
}
</script>
