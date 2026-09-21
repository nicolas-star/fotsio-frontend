<!-- <template>
  <header class="app-header">
    <n-page-header :title="title" :subtitle="subtitle">
      <template #title>
        <slot name="start">
          <n-button
            v-if="showBack"
            class="back-button"
            quaternary
            aria-label="Indietro"
            @click="handleBack"
          >
            ←
          </n-button>
        </slot>
        <span class="testo2">{{ title }}</span>
      </template>
      <template #extra>
        <slot name="end">
          <n-button
            v-if="showLogout"
            quaternary
            type="error"
            @click="handleLogout"
          >
            Esci
          </n-button>
        </slot>
      </template>
    </n-page-header>
  </header>
</template>

<script setup>
import { NButton, NPageHeader } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  backTo: { type: [String, Object], default: null },
  showBack: { type: Boolean, default: false },
  showLogout: { type: Boolean, default: false },
});
const emit = defineEmits(["back"]);

const router = useRouter();
const authStore = useAuthStore();

function handleBack() {
  if (props.backTo) {
    router.push(props.backTo);
    return;
  }

  emit("back");
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: var(--space-md);
  min-height: 64px;
  background: var(--color-bg);
}

.back-button {
  flex: 0 0 auto;
}
</style> -->
<template>
	<header class="app-header">
		<!-- Colonna Sinistra -->
		<div class="header-col left">
			<slot name="start">
				<n-button
					v-if="showBack"
					quaternary
					aria-label="Indietro"
					@click="handleBack">
					←
				</n-button>
			</slot>
		</div>

		<!-- Colonna Centrale -->
		<div class="header-col center">
			<span class="testo2">{{ title }}</span>
			<span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
		</div>

		<!-- Colonna Destra -->
		<div class="header-col right">
			<slot name="end">
				<n-button
					v-if="showLogout"
					quaternary
					type="error"
					@click="handleLogout">
					Esci
				</n-button>
			</slot>
		</div>
	</header>
</template>

<script setup>
import { NButton } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const props = defineProps({
	title: { type: String, required: true },
	subtitle: { type: String, default: "" },
	backTo: { type: [String, Object], default: null },
	showBack: { type: Boolean, default: false },
	showLogout: { type: Boolean, default: false },
});

const emit = defineEmits(["back"]);
const router = useRouter();
const authStore = useAuthStore();

function handleBack() {
	if (props.backTo) {
		router.push(props.backTo);
		return;
	}

	if (window.history.length > 1) {
		router.back();
	} else {
		router.push("/");
	}

	emit("back");
}

async function handleLogout() {
	await authStore.logout();
	router.push("/login");
}
</script>

<style scoped>
.app-header {
	display: grid;
	/* 3 colonne: Sinistra e Destra trasparenti di pari larghezza (1fr), Centro adattato (auto) */
	grid-template-columns: 1fr auto 1fr;
	align-items: center;
	position: sticky;
	top: 0;
	z-index: 10;
	padding: var(--space-sm) var(--space-md);
	background: var(--color-bg);
	width: 100%;
	box-sizing: border-box;
}

.header-col {
	display: flex;
	align-items: center;
}

.header-col.left {
	justify-content: flex-start;
}

.header-col.center {
	flex-direction: column;
	justify-content: center;
	text-align: center;
}

.header-col.right {
	justify-content: flex-end;
}

.subtitle {
	font-size: 0.8em;
	opacity: 0.7;
}
</style>
