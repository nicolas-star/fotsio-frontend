<template>
  <div class="home-view">
    <Header title="Dashboard" subtitle="Riepilogo della tua casa" show-logout />

    <PageContent>
      <n-space vertical size="large">
        <div class="home-intro">
          <span class="testo4">{{ todayLabel }}</span>
          <p class="testo2">Ciao, {{ user?.nome || "Utente" }}</p>
        </div>

        <n-alert v-if="error" type="error" :show-icon="false">
          {{ error }}
        </n-alert>

        <n-space v-if="loading" vertical size="large">
          <n-skeleton height="220px" sharp />
          <n-skeleton height="90px" sharp />
          <n-skeleton height="150px" sharp />
        </n-space>

        <template v-else>
          <n-card class="summary-card" :bordered="false">
            <span class="testo4">USCITE DEL MESE</span>
            <p class="testo1 summary-total">{{ formatCurrency(totalExpenses) }}</p>
            <div class="metric-grid">
              <div class="metric-item">
                <span class="testo4">Spese ricorrenti</span>
                <strong class="testo3">{{ formatCurrency(totalRecurring) }}</strong>
              </div>
              <div class="metric-item">
                <span class="testo4">Altre spese</span>
                <strong class="testo3">{{ formatCurrency(totalOther) }}</strong>
              </div>
            </div>
          </n-card>

          <div class="quick-actions">
            <n-button type="primary" size="large" block @click="$router.push('/domotica')">
              <template #icon><n-icon><HardwareChipOutline /></n-icon></template>
              Domotica
            </n-button>
            <n-button size="large" block @click="$router.push('/spesa')">
              <template #icon><n-icon><WalletOutline /></n-icon></template>
              Finanze
            </n-button>
          </div>

          <n-card :bordered="false">
            <div class="section-heading">
              <div>
                <span class="testo4">{{ todayLabel }}</span>
                <p class="testo3 section-title">Agenda</p>
              </div>
              <n-icon size="22" color="var(--color-primary)" aria-hidden="true">
                <CalendarOutline />
              </n-icon>
            </div>
            <n-empty description="Nessun evento in programma" />
          </n-card>
        </template>
      </n-space>
    </PageContent>
  </div>
</template>

<script>
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NIcon,
  NSkeleton,
  NSpace,
} from "naive-ui";
import Header from "../components/Header.vue";
import PageContent from "../components/PageContent.vue";
import { CalendarOutline, HardwareChipOutline, WalletOutline } from "@vicons/ionicons5";
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
    PageContent,
    NAlert,
    NButton,
    NCard,
    NEmpty,
    NIcon,
    NSkeleton,
    NSpace,
    CalendarOutline,
    HardwareChipOutline,
    WalletOutline,
  },
  data() {
    return {
      dashboardData: null,
      speseRicorrenti: [],
      loading: true,
      error: null,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["user", "isAuthenticated"]),
    todayLabel() {
      return new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date());
    },
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
  },
};
</script>

<style scoped>
  .home-intro p,
  .summary-total,
  .section-title {
    margin: var(--space-xs) 0 0;
}

  .summary-total {
    margin-top: var(--space-sm);
}

  .metric-grid,
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-md);
  }

  .metric-grid {
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .metric-item,
  .section-heading {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .metric-item strong {
    font-weight: 700;
  }

  .quick-actions :deep(.n-button) {
    min-height: 56px;
  }

  .section-heading {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}
</style>
