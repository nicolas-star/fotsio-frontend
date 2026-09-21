<script setup>
import { computed, onMounted } from "vue";
import { NConfigProvider } from "naive-ui";
import { useThemeStore } from "./store/theme";
import { checkAppVersion } from "./services/updater";
import TabBar from "./components/TabBar.vue";

const themeStore = useThemeStore();

// Overrides Naive UI ricalcolati automaticamente ogni volta che la palette
// nello store cambia (getter reattivo -> computed).
const naiveThemeOverrides = computed(() => themeStore.naiveThemeOverrides);

onMounted(() => {
	// Inizializza il tema (sceglie una palette random e la applica)
	themeStore.applyTheme();

	// Controlla aggiornamenti
	initUpdater();
});

async function initUpdater() {
	try {
		await checkAppVersion();
	} catch (error) {
		console.error("Versione check fallito:", error);
	}
}
</script>

<template>
	<n-config-provider
		:theme="themeStore.naiveBaseTheme"
		:theme-overrides="naiveThemeOverrides">
		<div id="app-root">
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>
			<TabBar />
		</div>
	</n-config-provider>
</template>

<style>
#app-root {
	width: 100%;
	min-height: 100vh;
	padding-bottom: calc(70px + var(--safe-area-bottom, 0px) + var(--space-sm));
	padding-top: 30px;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
