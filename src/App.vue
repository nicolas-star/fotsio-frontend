<script>
import { NAlert, NButton, NConfigProvider } from "naive-ui";
import { useThemeStore } from "./store/theme";
import { checkAppVersion } from "./services/updater";
import { clearNetworkFailure, networkFailure } from "./services/network";
import TabBar from "./components/TabBar.vue";
import Snackbar from "./components/Snackbar.vue";

export default {
	name: "App",
	components: { NAlert, NButton, NConfigProvider, TabBar, Snackbar },
	data() {
		return { themeStore: useThemeStore() };
	},
	computed: {
		naiveThemeOverrides() {
			return this.themeStore.naiveThemeOverrides;
		},
		networkFailure() {
			return networkFailure.value;
		},
	},
	mounted() {
		this.themeStore.applyTheme();
		this.initUpdater();
	},
	methods: {
		async initUpdater() {
			try {
				await checkAppVersion();
			} catch (error) {
				console.error("Versione check fallito:", error);
			}
		},
		reloadApp() {
			clearNetworkFailure();
			window.location.reload();
		},
	},
};
</script>

<template>
	<n-config-provider
		:theme="themeStore.naiveBaseTheme"
		:theme-overrides="naiveThemeOverrides">
		<div id="app-root">
			<n-alert
				v-if="networkFailure"
				class="global-network-error"
				type="error"
				title="Connessione al server non riuscita"
				:show-icon="true">
				<div class="network-error-content">
					<span>Controlla la connessione e tocca il pulsante per ricaricare.</span>
					<n-button size="small" type="error" secondary @click="reloadApp">
						Ricarica
					</n-button>
				</div>
			</n-alert>
			<Snackbar />
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
	padding-bottom: calc(110px + var(--safe-area-bottom, 0px) + var(--space-xl));
	padding-top: var(--safe-area-top, 0px);
}

.global-network-error {
	position: fixed;
	top: calc(var(--safe-area-top, 0px) + var(--space-md));
	left: var(--space-md);
	right: var(--space-md);
	z-index: 1100;
}

.network-error-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-md);
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
