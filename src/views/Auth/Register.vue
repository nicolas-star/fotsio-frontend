<template>
  <div class="page-container auth-view">
    <Header title="Registrati" back-to="/login" show-back />
    <n-card :bordered="false">
      <p class="testo3 testo3--muted">Crea il tuo account Fotsio</p>
      <Snackbar
        :show="Boolean(error)"
        :message="error || ''"
        type="error"
        @close="error = null"
      />
      <n-form @submit.prevent="handleRegister">
        <n-form-item label="Username">
          <n-input
            v-model:value="form.username"
            placeholder="Scegli un nome utente"
            autocomplete="username"
          />
        </n-form-item>
        <n-form-item label="Email">
          <n-input
            v-model:value="form.email"
            type="email"
            placeholder="esempio@email.com"
            autocomplete="email"
          />
        </n-form-item>
        <n-form-item label="Password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="Inserisci la password"
            autocomplete="new-password"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="Conferma password">
          <n-input
            v-model:value="form.confirmPassword"
            type="password"
            placeholder="Ripeti la password"
            autocomplete="new-password"
            show-password-on="click"
          />
        </n-form-item>
        <n-button
          type="primary"
          attr-type="submit"
          block
          :loading="loading"
          :disabled="loading"
        >
          Crea account
        </n-button>
      </n-form>
      <p class="testo3 testo3--muted footer">
        Hai gia' un account? <router-link to="/login">Accedi</router-link>
      </p>
    </n-card>
  </div>
</template>

<script>
import { NButton, NCard, NForm, NFormItem, NInput } from "naive-ui";
import Header from "../../components/Header.vue";
import Snackbar from "../../components/Snackbar.vue";
import { useAuthStore } from "../../store/auth";
import { mapActions, mapState } from "pinia";

export default {
  name: "Register",
  components: { Header, NButton, NCard, NForm, NFormItem, NInput, Snackbar },
  data() {
    return {
      form: { username: "", email: "", password: "", confirmPassword: "" },
      error: null,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["loading", "isBypassEnabled"]),
  },
  methods: {
    ...mapActions(useAuthStore, ["signup"]),
    async handleRegister() {
      if (
        !this.isBypassEnabled &&
        (!this.form.username || !this.form.email || !this.form.password)
      ) {
        this.error = "Compila tutti i campi obbligatori";
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.error = "Le password non coincidono";
        return;
      }
      this.error = null;
      try {
        await this.signup(
          this.form.username,
          this.form.password,
          this.form.email,
        );
        this.$router.push("/");
      } catch (err) {
        console.error("Registration error:", err);
        this.error =
          err.response?.data?.detail || "Errore durante la registrazione";
      }
    },
  },
};
</script>

<style scoped>
.auth-view {
  padding: var(--space-md);
}

.footer {
  margin: var(--space-lg) 0 0;
  text-align: center;
}

.footer a {
  color: var(--color-primary);
}
</style>
