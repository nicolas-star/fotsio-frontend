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
					<span
						>Controlla la connessione e tocca il pulsante per ricaricare.</span
					>
					<n-button size="small" type="error" secondary @click="reloadApp">
						Ricarica
					</n-button>
				</div>
			</n-alert>
			<Snackbar />
			<div class="app-scroll-content">
				<router-view v-slot="{ Component }">
					<transition name="fade" mode="out-in">
						<component :is="Component" />
					</transition>
				</router-view>
			</div>
			<TabBar />
		</div>
	</n-config-provider>
</template>

<style>
:root {
	--tab-bar-content-height: 49px;
	--tab-bar-total-height: calc(
		var(--tab-bar-content-height) + var(--safe-area-bottom, 0px)
	);
}

html,
body,
#app {
	height: 100%;
	background-color: var(--color-bg);
}

#app {
	overflow: hidden;
}

#app-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100vh;
	height: 100dvh;
	min-height: 0;
	overflow: hidden;
	background-color: var(--color-bg);
	padding-inline: var(--safe-area-left) var(--safe-area-right);
	padding-top: var(--safe-area-top);
}

.app-scroll-content {
	flex: 1;
	min-height: 0;
	overflow-x: hidden;
	overflow-y: auto;
	overscroll-behavior-y: contain;
	-webkit-overflow-scrolling: touch;
	background-color: var(--color-bg);
}

.app-scroll-content > * {
	min-height: 100%;
	padding-bottom: calc(var(--tab-bar-total-height) + var(--space-xl));
}

.global-network-error {
	position: fixed;
	top: calc(var(--safe-area-top) + var(--space-md));
	left: max(var(--safe-area-left), var(--space-md));
	right: max(var(--safe-area-right), var(--space-md));
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
