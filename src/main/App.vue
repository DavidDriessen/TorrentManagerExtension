<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="../../public/icons/128.png"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title>QbitTorrent client</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>
      <AddTorrentModal ref="addTorrent" />
      <ServerStateModal />
      <v-btn to="/" text>Torrents</v-btn>
      <v-btn to="/options" text>Options</v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" small fab @click="darkMode" icon>
            <v-icon :color="!$vuetify.theme.dark ? 'black' : 'white'">
              fas fa-adjust
            </v-icon>
          </v-btn>
        </template>
        <span v-if="!$vuetify.theme.dark">Dark Mode On</span>
        <span v-else>Dark Mode Off</span>
      </v-tooltip>
    </v-app-bar>

    <v-main>
      <router-view />
      <Login />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AsyncFilterMixin } from "@tygr/vue-async-filter";
import Login from "@/main/components/Login.vue";
import AddTorrentModal from "@/main/components/AddTorrentModal.vue";
import ServerStateModal from "@/main/components/ServerStateModal.vue";

@Component({
  components: { ServerStateModal, AddTorrentModal, Login },
  mixins: [AsyncFilterMixin]
})
export default class App extends Vue {
  mounted() {
    if (this.$route.params.newTorrent) {
      ((this.$refs.addTorrent as unknown) as { open(url: string): void }).open(
        this.$route.params.newTorrent
      );
    }
  }

  darkMode() {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    browser.storage.sync.set({
      preference: { darkMode: this.$vuetify.theme.dark }
    });
  }
}
</script>
