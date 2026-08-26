<template>
  <div class="page-container join-family-view">
    <Header
      :title="
        activeSection
          ? activeSection === 'join'
            ? 'Unisciti alla famiglia'
            : 'Crea famiglia'
          : 'La tua famiglia'
      "
      :show-back="Boolean(activeSection)"
      show-logout
      @back="activeSection = null"
    />

    <n-card v-if="!activeSection" :bordered="false">
      <n-result
        status="info"
        title="Benvenuto"
        description="Scegli come iniziare a usare Fotsio."
      />
      <n-space vertical>
        <n-button
          type="primary"
          block
          size="large"
          @click="activeSection = 'join'"
        >
          Unisciti a una famiglia
        </n-button>
        <n-button block size="large" @click="activeSection = 'create'">
          Crea nuova famiglia
        </n-button>
      </n-space>
    </n-card>

    <n-card v-else :bordered="false">
      <Snackbar
        :show="Boolean(error)"
        :message="error || ''"
        type="error"
        @close="error = null"
      />

      <n-form v-if="activeSection === 'join'" @submit.prevent="handleJoin">
        <p class="testo3 testo3--muted">Inserisci il codice della famiglia.</p>
        <n-form-item label="Codice famiglia">
          <n-input
            v-model:value="codiceFamiglia"
            placeholder="Codice famiglia"
          />
        </n-form-item>
        <n-button
          type="primary"
          attr-type="submit"
          block
          :loading="loading"
          :disabled="loading"
        >
          Unisciti alla famiglia
        </n-button>
      </n-form>

      <n-form v-else @submit.prevent="handleCreate">
        <p class="testo3 testo3--muted">
          Inserisci i dati richiesti per iniziare.
        </p>
        <n-form-item label="Nome famiglia">
          <n-input v-model:value="nomeFamiglia" placeholder="Nome famiglia" />
        </n-form-item>
        <n-form-item label="Descrizione">
          <n-input
            v-model:value="descrizioneFamiglia"
            type="textarea"
            placeholder="Descrizione (opzionale)"
          />
        </n-form-item>
        <n-button
          type="primary"
          attr-type="submit"
          block
          :loading="loading"
          :disabled="loading"
        >
          Crea famiglia
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script>
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NResult,
  NSpace,
} from "naive-ui";
import Header from "../../components/Header.vue";
import Snackbar from "../../components/Snackbar.vue";
import { joinFamily, createFamily } from "../../services/family";
import { useAuthStore } from "../../store/auth";

export default {
  name: "JoinFamily",
  components: {
    Header,
    NButton,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NResult,
    NSpace,
    Snackbar,
  },
  data() {
    return {
      activeSection: null,
      codiceFamiglia: "",
      nomeFamiglia: "",
      descrizioneFamiglia: "",
      loading: false,
      error: null,
    };
  },
  methods: {
    async handleJoin() {
      if (!this.codiceFamiglia) {
        this.error = "Codice famiglia obbligatorio";
        return;
      }

      await this.submitFamilyAction(
        () => joinFamily(useAuthStore(), this.codiceFamiglia),
        "Codice famiglia non trovato",
      );
    },
    async handleCreate() {
      if (!this.nomeFamiglia) {
        this.error = "Nome famiglia obbligatorio";
        return;
      }

      await this.submitFamilyAction(
        () =>
          createFamily(
            useAuthStore(),
            this.nomeFamiglia,
            this.descrizioneFamiglia,
          ),
        "Impossibile creare la famiglia",
      );
    },
    async submitFamilyAction(action, fallbackMessage) {
      this.loading = true;
      this.error = null;
      try {
        const response = await action();
        if (!response?.result) {
          this.error = fallbackMessage;
          return;
        }
        this.$router.push("/");
      } catch (err) {
        console.error("Family action error:", err);
        this.error = "Operazione non riuscita";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.join-family-view {
  padding: var(--space-md);
}

.feedback {
  margin-bottom: var(--space-md);
}
</style>
