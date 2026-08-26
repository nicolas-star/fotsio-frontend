<template>
  <div class="page-container profile-view">
    <Header title="Profilo" back-to="/" show-back show-logout />

    <n-card v-if="loading" :bordered="false">
      <n-skeleton text :repeat="3" />
    </n-card>

    <n-space v-else vertical size="large">
      <n-card :bordered="false">
        <n-space align="center">
          <n-avatar round :size="64" color="var(--color-primary)">
            {{ getInitials(user?.nome) }}
          </n-avatar>
          <div>
            <p class="testo2">{{ user?.nome || "Utente" }}</p>
            <p class="testo3 testo3--muted">
              {{ user?.email || "Nessuna email" }}
            </p>
            <n-tag type="primary" size="small">{{
              user?.codice || "DEMO"
            }}</n-tag>
          </div>
        </n-space>
      </n-card>

      <n-card title="La tua famiglia" :bordered="false">
        <n-descriptions label-placement="left" :column="1">
          <n-descriptions-item label="Stato">
            <n-tag v-if="hasFamily" type="success">Membro attivo</n-tag>
            <n-button
              v-else
              text
              type="primary"
              @click="$router.push('/join-family')"
            >
              Unisciti
            </n-button>
          </n-descriptions-item>
          <n-descriptions-item label="ID famiglia">
            {{ user?.idFamiglia || "N/D" }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <n-card title="Preferenze app" :bordered="false">
        <n-space vertical>
          <div class="setting-row">
            <div>
              <p class="testo3">Tema scuro</p>
              <p class="testo4">{{ isDark ? "Attivo" : "Disattivo" }}</p>
            </div>
            <n-switch :value="isDark" @update:value="toggleMode" />
          </div>

          <n-select
            :value="palettePreference"
            :options="paletteOptions"
            placeholder="Seleziona palette"
            @update:value="setPalettePreference"
          />
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<script>
import {
  NAvatar,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NSelect,
  NSkeleton,
  NSpace,
  NSwitch,
  NTag,
} from "naive-ui";
import Header from "../components/Header.vue";
import { palettes } from "../theme/palettes";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import { mapState } from "pinia";

export default {
  name: "Profile",
  components: {
    Header,
    NAvatar,
    NButton,
    NCard,
    NDescriptions,
    NDescriptionsItem,
    NSelect,
    NSkeleton,
    NSpace,
    NSwitch,
    NTag,
  },
  computed: {
    ...mapState(useAuthStore, ["user", "hasFamily", "loading"]),
    ...mapState(useThemeStore, [
      "mode",
      "palette",
      "palettePreference",
      "isDark",
    ]),
    paletteOptions() {
      return [
        { label: "CAMBIA SEMPRE", value: "always-random" },
        ...palettes[this.mode].map((item) => ({
          label: item.name,
          value: item.name,
        })),
      ];
    },
  },
  methods: {
    toggleMode() {
      useThemeStore().toggleMode();
    },
    setPalettePreference(preference) {
      useThemeStore().setPalettePreference(preference);
    },
    getInitials(name) {
      if (!name) return "U";
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },
  },
};
</script>

<style scoped>
.profile-view {
  padding: var(--space-md);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.setting-row p {
  margin: 0;
}
</style>
