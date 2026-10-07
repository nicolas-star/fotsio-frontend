<template>
	<n-space vertical size="large">
		<n-card :bordered="false">
			<n-space justify="space-between" align="center">
				<div>
					<strong>Sistema domotico</strong>
					<span class="status-caption">Stato connessione tapparelle</span>
				</div>
				<n-tag :type="mqttConnected ? 'success' : 'error'">
					{{ mqttConnected ? "Online" : "Offline" }}
				</n-tag>
			</n-space>
		</n-card>

		<n-space vertical size="small" class="global-actions">
			<n-button
				type="info"
				size="large"
				strong
				:loading="globalLoading === 'evening'"
				:disabled="Boolean(globalLoading) || hasBusyDevices || !activeDeviceCount"
				@click="$emit('run-evening')">
				<template #icon><n-icon><MoonOutline /></n-icon></template>
				Programma serale
			</n-button>
			<div class="global-pair">
				<n-button
					type="primary"
					size="large"
					strong
					:loading="globalLoading === 'open'"
					:disabled="Boolean(globalLoading) || hasBusyDevices || !activeDeviceCount"
					@click="$emit('run-all', 'open')">
					<template #icon><n-icon><ArrowUpOutline /></n-icon></template>
					Apri tutto
				</n-button>
				<n-button
					type="warning"
					size="large"
					strong
					:loading="globalLoading === 'close'"
					:disabled="Boolean(globalLoading) || hasBusyDevices || !activeDeviceCount"
					@click="$emit('run-all', 'close')">
					<template #icon><n-icon><ArrowDownOutline /></n-icon></template>
					Chiudi tutto
				</n-button>
			</div>
		</n-space>

		<n-alert v-if="error" type="error" :show-icon="false">{{ error }}</n-alert>
		<n-space v-if="loading && !devices.length" vertical>
			<n-skeleton v-for="index in 4" :key="index" height="72px" sharp />
		</n-space>
		<n-empty v-else-if="!devices.length" description="Nessuna tapparella disponibile" />
		<n-space v-else vertical size="small">
			<n-button
				v-for="device in devices"
				:key="device.deviceId"
				class="device-button"
				quaternary
				block
				:disabled="!device.attivo"
				@click="$emit('select-device', device)">
				<span>{{ device.nome || device.deviceId }}</span>
				<template #icon><n-icon><ChevronForwardOutline /></n-icon></template>
			</n-button>
		</n-space>
	</n-space>
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
	NTag,
} from "naive-ui";
import {
	ArrowDownOutline,
	ArrowUpOutline,
	ChevronForwardOutline,
	MoonOutline,
} from "@vicons/ionicons5";

export default {
	name: "HardwareControlPanel",
	components: {
		NAlert,
		NButton,
		NCard,
		NEmpty,
		NIcon,
		NSkeleton,
		NSpace,
		NTag,
		ArrowDownOutline,
		ArrowUpOutline,
		ChevronForwardOutline,
		MoonOutline,
	},
	props: {
		mqttConnected: { type: Boolean, default: false },
		globalLoading: { type: String, default: null },
		hasBusyDevices: { type: Boolean, default: false },
		activeDeviceCount: { type: Number, default: 0 },
		loading: { type: Boolean, default: false },
		devices: { type: Array, default: () => [] },
		error: { type: String, default: "" },
	},
	emits: ["run-evening", "run-all", "select-device"],
};
</script>

<style scoped>
.status-caption {
	display: block;
	color: var(--color-text-muted);
}

.global-pair {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--space-sm);
}

.global-pair :deep(.n-button),
.global-actions > :deep(.n-button) {
	min-height: 52px;
}

.device-button {
	min-height: 60px;
	justify-content: space-between;
	background: var(--color-card);
}

@media (max-width: 340px) {
	.global-pair {
		grid-template-columns: 1fr;
	}
}
</style>
