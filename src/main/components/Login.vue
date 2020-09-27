<template>
  <v-dialog v-model="dialog" persistent width="400">
    <!--    <template v-slot:activator="{ on }">-->
    <!--      <v-btn color="primary" dark v-on="on">Login</v-btn>-->
    <!--    </template>-->
    <v-card class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display-1">Login</h1>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="login(loginForm.username, loginForm.password)">
          <v-text-field
            label="Username"
            prepend-icon="mdi-account"
            v-model="loginForm.username"
          />
          <v-text-field
            label="Password"
            prepend-icon="mdi-lock"
            append-icon="mdi-eye-off"
            type="password"
            v-model="loginForm.password"
          />
          <v-btn type="submit" hidden>Submit</v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="success"
          @click="login(loginForm.username, loginForm.password)"
          :loading="loading"
          >Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Login extends Vue {
  dialog = false;
  loading = false;
  handleLastRequest: (() => void) | null = null;
  loginForm = { username: "", password: "" };

  open() {
    this.dialog = true;
  }

  login(username: string, password: string) {
    this.loading = true;
    this.$store
      .dispatch("login", { username, password })
      .then(() => {
        this.dialog = false;
        this.loading = false;
        if (this.handleLastRequest) {
          this.handleLastRequest();
          this.handleLastRequest = null;
        }
      })
      .catch(() => {
        this.loading = false;
      });
  }
}
</script>
