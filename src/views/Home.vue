<template>
  <div class="page-container home-view">
    <Header :title="`Ciao, ${user?.nome || 'Utente'}`">
      <template #end>
        <router-link to="/profile" aria-label="Apri profilo">
          <n-avatar round :size="40" color="var(--color-primary)">
            {{ getInitials(user?.nome) }}
          </n-avatar>
        </router-link>
      </template>
    </Header>

    <n-alert v-if="error" type="error" :show-icon="false" class="feedback">
      {{ error }}
    </n-alert>

    <n-space v-if="loading" vertical size="large">
      <n-skeleton height="160px" sharp />
      <n-skeleton height="100px" sharp />
      <n-skeleton text :repeat="4" />
    </n-space>

    <n-space v-else vertical size="large">
      <n-card title="Totale spese mensili" :bordered="false">
        <p class="testo1">{{ formatCurrency(totalExpenses) }}</p>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <p class="testo4">Ricorrenti</p>
            <p class="testo2">{{ formatCurrency(totalRecurring) }}</p>
          </n-gi>
          <n-gi>
            <p class="testo2">{{ formatCurrency(totalOther) }}</p>
          </n-gi>
        </n-grid>
      </n-card>

      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-button block @click="$router.push('/domotica')">Domotica</n-button>
        </n-gi>
        <n-gi>
          <n-button block @click="$router.push('/spesa')">Finanze</n-button>
        </n-gi>
      </n-grid>

      <n-card title="Agenda di oggi" :bordered="false">
        <n-list v-if="todayEvents.length" bordered>
          <n-list-item v-for="event in todayEvents" :key="event.id">
            <n-thing :title="event.title" :description="event.time" />
          </n-list-item>
        </n-list>
        <n-empty v-else description="Nessun evento in programma" />
      </n-card>
    </n-space>
  </div>
</template>

<script>
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NEmpty,
  NGi,
  NGrid,
  NList,
  NListItem,
  NSkeleton,
  NSpace,
  NThing,
} from "naive-ui";
import Header from "../components/Header.vue";
import {
  fetchDashboard,
  fetchRecurringExpenses,
  sumRecurringExpenses,
} from "../services/dashboard";
import { useAuthStore } from "../store/auth";
import { mapState } from "pinia";

export default {
  name: "Home",
  components: {
    Header,
    NAlert,
    NAvatar,
    NButton,
    NCard,
    NEmpty,
    NGi,
    NGrid,
    NList,
    NListItem,
    NSkeleton,
    NSpace,
    NThing,
  },
  data() {
    return {
      dashboardData: null,
      speseRicorrenti: [],
      loading: true,
      error: null,
      todayEvents: [
        { id: 1, title: "Pranzo con cliente", time: "12:30" },
        { id: 2, title: "Spesa supermercato", time: "18:00" },
        { id: 3, title: "Palestra", time: "19:30" },
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ["user", "isAuthenticated"]),
    totalRecurring() {
      return Number(
        this.dashboardData?.totalRecurring ??
          sumRecurringExpenses(this.speseRicorrenti),
      );
    },
    totalOther() {
      return Number(this.dashboardData?.totalOther ?? 0);
    },
    totalExpenses() {
      return Number(
        this.dashboardData?.totalExpenses ??
          this.totalRecurring + this.totalOther,
      );
    },
  },
  async mounted() {
    if (this.isAuthenticated) await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const [dashboard, recurringExpenses] = await Promise.all([
          fetchDashboard(authStore),
          fetchRecurringExpenses(authStore),
        ]);
        this.dashboardData = dashboard;
        this.speseRicorrenti = recurringExpenses || [];
      } catch (err) {
        console.error("Home data fetch error:", err);
        this.error = "Impossibile caricare il riepilogo";
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(value);
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
.home-view {
  padding: var(--space-md);
}

.feedback {
  margin: 0 var(--space-md) var(--space-md);
}

.testo1,
.testo2,
.testo4 {
  margin-top: 0;
}
</style>
