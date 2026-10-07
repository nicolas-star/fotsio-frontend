<template>
	<header class="app-header glass-surface">
		<!-- Colonna Sinistra -->
		<div class="header-col left">
			<slot name="start">
				<n-button
					v-if="showBack"
					quaternary
					aria-label="Indietro"
					@click="handleBack">
						<n-icon :size="20" aria-hidden="true">
							<ArrowBackOutline />
						</n-icon>
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
					circle
					type="error"
					aria-label="Esci"
					@click="handleLogout">
					<n-icon :size="20" aria-hidden="true">
						<LogOutOutline />
					</n-icon>
				</n-button>
			</slot>
		</div>
	</header>
</template>

<script setup>
import { NButton, NIcon } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { ArrowBackOutline, LogOutOutline } from "@vicons/ionicons5";

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
	grid-template-columns: 1fr auto 1fr;
	align-items: center;
	position: sticky;
	top: 0;
	z-index: 100;
	margin-top: calc(-1 * var(--safe-area-top, 0px));
	padding: calc(var(--space-sm) + var(--safe-area-top, 0px)) var(--space-md)
		var(--space-sm);
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	box-sizing: border-box;
	isolation: isolate;
	min-height: calc(56px + var(--safe-area-top, 0px));
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
