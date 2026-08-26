<template>
  <div class="page-container auth-view">
    <n-card class="auth-card" :bordered="false">
      <div class="auth-header">
        <div class="logo-container">
          <div class="logo-circle">F</div>
        </div>
        <h1 class="testo1">Benvenuto</h1>
        <p class="testo3--muted">Accedi per gestire la tua casa</p>
      </div>

      <n-form class="auth-form" @submit.prevent="handleLogin">
        <n-form-item label="Username">
          <n-input
            v-model="form.user"
            placeholder="Il tuo nome utente"
            autocomplete="username"
          />
        </n-form-item>

        <n-form-item label="Password">
          <n-input
            v-model="form.password"
            type="password"
            placeholder="Inserisci la password"
            autocomplete="current-password"
            show-password-on="click"
          />
        </n-form-item>

        <n-button
          type="primary"
          attr-type="submit"
          block
          size="large"
          class="auth-btn"
          :loading="loading"
          :disabled="loading"
        >
          Accedi
        </n-button>
      </n-form>

      <div class="auth-footer">
        <p class="testo3--muted">
          Non hai un account?
          <router-link to="/register">Registrati ora</router-link>
        </p>
      </div>
    </n-card>

    <Snackbar
      :show="Boolean(error)"
      :message="error || ''"
      type="error"
      @close="error = null"
    />
  </div>
</template>

<script>
import { NButton, NCard, NForm, NFormItem, NInput } from "naive-ui";
import Snackbar from "../../components/Snackbar.vue";
import { useAuthStore } from "../../store/auth";
import { mapState, mapActions } from "pinia";

export default {
  name: "Login",
  components: { NButton, NCard, NForm, NFormItem, NInput, Snackbar },
  data() {
    return {
      form: { user: "", password: "" },
      error: null,
    };
  },
  computed: {
    ...mapState(useAuthStore, [
      "loading",
      "isAuthenticated",
      "isBypassEnabled",
    ]),
  },
  methods: {
    ...mapActions(useAuthStore, ["login"]),
    async handleLogin() {
      if (!this.isBypassEnabled && (!this.form.user || !this.form.password)) {
        this.error = "Inserisci credenziali complete";
        return;
      }

      this.error = null;
      try {
        await this.login(this.form.user, this.form.password);
        if (this.isAuthenticated) {
          this.$router.push("/");
        }
      } catch (err) {
        console.error("Login error:", err);
        const detail = err.response?.data?.detail || "Credenziali non valide";
        this.error = detail;
      }
    },
  },
};
</script>

<style scoped>
.auth-view {
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
  background: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  text-align: center;
}

.auth-header {
  margin-bottom: var(--space-xl);
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-circle {
  width: 70px;
  height: 70px;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-card);
  font-size: 28px;
  font-weight: 900;
  transform: rotate(-10deg);
}

.auth-header p {
  margin: var(--space-sm) 0 0;
}

.auth-form {
  text-align: left;
}

.auth-btn {
  margin-top: var(--space-sm);
}

.auth-footer {
  margin-top: var(--space-lg);
}

.auth-footer p {
  margin: 0;
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
</style>
