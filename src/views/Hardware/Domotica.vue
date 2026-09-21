<template>
	<div class="page-container domotica-view">
		<Header
			title="Domotica"
			subtitle="Controlla le tapparelle"
			back-to="/"
			show-back>
			<template #end>
				<n-button
					quaternary
					circle
					aria-label="Aggiorna stato"
					:loading="statusRefreshing"
					:disabled="statusRefreshing || !devices.length"
					@click="refreshCoverStatuses">
					<span class="refresh-icon" aria-hidden="true">↻</span>
				</n-button>
			</template>
		</Header>

		<n-space vertical size="large" class="domotica-content">
			<n-card :bordered="false" class="status-card">
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

			<div class="global-actions">
				<n-button
					type="primary"
					size="large"
					strong
					:loading="globalLoading === 'open'"
					:disabled="Boolean(globalLoading) || !activeDevices.length"
					@click="runAll('open')">
					<span class="action-symbol" aria-hidden="true">↑</span>
					Apri tutto
				</n-button>
				<n-button
					type="warning"
					size="large"
					strong
					:loading="globalLoading === 'close'"
					:disabled="Boolean(globalLoading) || !activeDevices.length"
					@click="runAll('close')">
					<span class="action-symbol" aria-hidden="true">↓</span>
					Chiudi tutto
				</n-button>
			</div>

			<n-alert v-if="error" type="error" :show-icon="false">{{
				error
			}}</n-alert>

			<n-space v-if="loading && !devices.length" vertical>
				<n-skeleton
					v-for="index in devices.length"
					:key="index"
					height="72px"
					sharp />
			</n-space>
			<n-empty
				v-else-if="!devices.length"
				description="Nessuna tapparella disponibile" />
			<n-space v-else vertical size="small" class="device-list">
				<n-card
					v-for="device in devices"
					:key="device.deviceId"
					:bordered="false"
					:class="['shutter-card', { inactive: !device.attivo }]"
					@click="openDeviceSheet(device)">
					<div class="shutter-card-content">
						<div>
							<strong>{{ device.nome || device.deviceId }}</strong>
						</div>
						<span class="collapse-arrow" aria-hidden="true">
							<n-icon  size="24" color="black">
								<ChevronUp v-if="sheetOpen" />
								<ChevronDown v-else />
							</n-icon>
						</span>
					</div>
				</n-card>
			</n-space>
		</n-space>

		<n-drawer
			v-model:show="sheetOpen"
			placement="bottom"
			:height="340"
			:mask-closable="true">
			<n-drawer-content closable>
				<template #header>
					<div class="sheet-title">
						<strong>{{ selectedDevice?.nome || "Tapparella" }}</strong>
						<span>{{
							selectedDevice ? stateLabel(selectedDevice.coverState) : ""
						}}</span>
					</div>
				</template>
				<div v-if="selectedDevice" class="sheet-actions">
					<n-button
						type="primary"
						size="large"
						:loading="isBusy(selectedDevice, 'open')"
						:disabled="!canCommand(selectedDevice)"
						@click="runCommand(selectedDevice, 'open')"
						>Alza</n-button
					>
					<n-button
						size="large"
						:loading="isBusy(selectedDevice, 'stop')"
						:disabled="!canCommand(selectedDevice)"
						@click="runCommand(selectedDevice, 'stop')"
						>Stop</n-button
					>
					<n-button
						type="warning"
						size="large"
						:loading="isBusy(selectedDevice, 'close')"
						:disabled="!canCommand(selectedDevice)"
						@click="runCommand(selectedDevice, 'close')"
						>Abbassa</n-button
					>
					<n-button
						size="large"
						:loading="isBusy(selectedDevice, 'slats')"
						:disabled="!canCommand(selectedDevice)"
						@click="runCommand(selectedDevice, 'open_slats')"
						>Fessure {{ selectedDevice.slatsPosition ?? 50 }}%</n-button
					>
					<n-button
						size="large"
						:loading="isBusy(selectedDevice, 'position')"
						:disabled="!canCommand(selectedDevice)"
						@click="setPosition(selectedDevice, 50)"
						>Apri al 50%</n-button
					>
				</div>
			</n-drawer-content>
		</n-drawer>

		<Snackbar
			:show="Boolean(snackbar.message)"
			:message="snackbar.message"
			:type="snackbar.type"
			@close="snackbar.message = ''" />
	</div>
</template>

<script>
import {
	NAlert,
	NButton,
	NCard,
	NDrawer,
	NDrawerContent,
	NEmpty,
	NSkeleton,
	NSpace,
	NTag,
	NIcon,
} from "naive-ui";
import { HomeOutline, ChevronDown, ChevronUp } from "@vicons/ionicons5";
import Header from "../../components/Header.vue";
import Snackbar from "../../components/Snackbar.vue";
import {
	getAllCoverStatuses,
	getHardwareDevices,
	getHardwareStatus,
	openCoverSlats,
	sendCoverCommand,
	setCoverPosition,
} from "../../services/hardware";

const STATE_LABELS = {
	unknown: "Sconosciuta",
	open: "Aperta",
	closed: "Chiusa",
	partial: "Parziale",
};
const STATUS_REFRESH_DELAY_MS = 30000;

export default {
	name: "Domotica",
	components: {
		Header,
		Snackbar,
		NAlert,
		NButton,
		NCard,
		NDrawer,
		NDrawerContent,
		NEmpty,
		NSkeleton,
		NSpace,
		NTag,
		NIcon,
		HomeOutline,
		ChevronUp,
		ChevronDown,
	},
	data() {
		return {
			devices: [],
			selectedDevice: null,
			sheetOpen: false,
			mqttConnected: false,
			loading: false,
			statusRefreshing: false,
			busyDevices: new Set(),
			statusRefreshTimers: new Set(),
			globalLoading: null,
			error: "",
			snackbar: { message: "", type: "info" },
		};
	},
	computed: {
		activeDevices() {
			return this.devices.filter((device) => device.attivo);
		},
	},
	async mounted() {
		await this.loadHardware();
		await this.refreshCoverStatuses();
	},
	beforeUnmount() {
		this.statusRefreshTimers.forEach((timer) => clearTimeout(timer));
		this.statusRefreshTimers.clear();
	},
	methods: {
		async loadHardware() {
			this.loading = true;
			this.error = "";
			try {
				const [status, response] = await Promise.all([
					getHardwareStatus(),
					getHardwareDevices(),
				]);
				this.mqttConnected = status?.status === "connected";
				if (!response?.success)
					throw new Error(response?.message || "Dispositivi non disponibili");
				this.devices = response.devices || [];
			} catch (err) {
				this.error = err.message || "Errore caricamento domotica";
				this.showSnackbar(this.error, "error");
			} finally {
				this.loading = false;
			}
		},
		async refreshCoverStatuses() {
			if (!this.devices.length || this.statusRefreshing) return;
			this.statusRefreshing = true;
			try {
				const response = await getAllCoverStatuses();
				if (!response?.success) return;
				const statusByKey = new Map(
					(response.covers || []).map((cover) => [
						`${cover.deviceId}:${cover.coverId ?? 0}`,
						cover,
					]),
				);
				this.devices.forEach((device) => {
					const status = statusByKey.get(
						`${device.deviceId}:${device.coverId ?? 0}`,
					);
					if (!status) return;
					if (Number.isFinite(status.currentPos) && status.currentPos >= 0)
						device.position = status.currentPos;
					device.coverState = this.normalizeCoverState(
						status.currentPos,
						status.state,
					);
				});
			} catch (err) {
				console.error("Errore aggiornamento stato tapparelle", err);
			} finally {
				this.statusRefreshing = false;
			}
		},
		normalizeCoverState(position, state) {
			if (Number.isFinite(position) && position >= 0 && position <= 100) {
				if (position === 100) return "open";
				if (position === 0) return "closed";
				return "partial";
			}
			return state === "open" || state === "closed" ? state : "unknown";
		},
		stateLabel(state) {
			return STATE_LABELS[state] || STATE_LABELS.unknown;
		},
		openDeviceSheet(device) {
			this.selectedDevice = device;
			this.sheetOpen = true;
		},
		isBusy(device, action) {
			return this.busyDevices.has(`${device.deviceId}:${action}`);
		},
		canCommand(device) {
			return (
				device.attivo &&
				!this.globalLoading &&
				![...this.busyDevices].some((key) =>
					key.startsWith(`${device.deviceId}:`),
				)
			);
		},
		markBusy(device, action, busy) {
			const key = `${device.deviceId}:${action}`;
			if (busy) this.busyDevices.add(key);
			else this.busyDevices.delete(key);
		},
		async runCommand(device, command) {
			if (!this.canCommand(device)) return;
			const action = command === "open_slats" ? "slats" : command;
			this.markBusy(device, action, true);
			try {
				const response =
					command === "open_slats"
						? await openCoverSlats(device)
						: await sendCoverCommand(device, command);
				if (!response?.success)
					throw new Error(response?.message || "Comando fallito");
				if (command === "open") device.position = 100;
				if (command === "close") device.position = 0;
				if (command === "open_slats")
					device.position = device.slatsPosition ?? 50;
				device.coverState = this.normalizeCoverState(device.position, null);
				this.scheduleStatusRefresh();
			} catch (err) {
				this.showSnackbar(
					`${device.nome || device.deviceId}: ${err.message || "Errore comunicazione dispositivo"}`,
					"error",
				);
			} finally {
				this.markBusy(device, action, false);
			}
		},
		async setPosition(device, position) {
			if (!this.canCommand(device)) return;
			this.markBusy(device, "position", true);
			try {
				const response = await setCoverPosition(device, position);
				if (!response?.success)
					throw new Error(response?.message || "Comando posizione fallito");
				device.position = position;
				device.coverState = this.normalizeCoverState(position, null);
				this.scheduleStatusRefresh();
			} catch (err) {
				this.showSnackbar(
					`${device.nome || device.deviceId}: ${err.message || "Errore comunicazione dispositivo"}`,
					"error",
				);
			} finally {
				this.markBusy(device, "position", false);
			}
		},
		async runAll(command) {
			if (this.globalLoading || !this.activeDevices.length) return;
			this.globalLoading = command;
			const devices = [...this.activeDevices];
			const results = await Promise.allSettled(
				devices.map((device) => sendCoverCommand(device, command)),
			);
			const failed = results.filter(
				(result) => result.status === "rejected" || !result.value?.success,
			);
			results.forEach((result, index) => {
				if (result.status === "fulfilled" && result.value?.success) {
					devices[index].position = command === "open" ? 100 : 0;
					devices[index].coverState = command === "open" ? "open" : "closed";
				}
			});
			if (!failed.length)
				this.showSnackbar(
					command === "open"
						? "Tutte le tapparelle sono aperte"
						: "Tutte le tapparelle sono chiuse",
					"success",
				);
			else if (failed.length === results.length)
				this.showSnackbar("Nessuna tapparella ha eseguito il comando", "error");
			else
				this.showSnackbar(
					`${results.length - failed.length} tapparelle aggiornate, ${failed.length} non riuscite`,
					"warning",
				);
			this.globalLoading = null;
			if (failed.length < results.length) this.scheduleStatusRefresh();
		},
		scheduleStatusRefresh() {
			const timer = setTimeout(async () => {
				this.statusRefreshTimers.delete(timer);
				await this.refreshCoverStatuses();
			}, STATUS_REFRESH_DELAY_MS);
			this.statusRefreshTimers.add(timer);
		},
		showSnackbar(message, type) {
			this.snackbar = { message, type };
		},
	},
};
</script>

<style scoped>
.domotica-view {
	padding: var(--space-md) var(--space-md) var(--space-xl);
}
.domotica-content {
	padding-top: var(--space-sm);
}
.status-card,
.shutter-card {
	background: var(--color-card);
}
.status-caption,
.sheet-title span {
	display: block;
	color: var(--color-text-muted);
	font-size: 0.85rem;
}
.global-actions {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--space-sm);
}
.global-actions :deep(.n-button) {
	min-height: 58px;
}
.action-symbol,
.refresh-icon {
	font-size: 1.25em;
	line-height: 1;
}
.shutter-card {
	cursor: pointer;
	transition:
		transform 0.18s ease,
		background-color 0.18s ease;
}
.shutter-card:active {
	transform: scale(0.985);
}
.shutter-card.inactive {
	opacity: 0.6;
}
.shutter-card-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 38px;
}
.collapse-arrow {
	color: var(--color-primary);
	font-size: 1.5rem;
}
.sheet-title strong {
	display: block;
	font-size: 1.1rem;
}
.sheet-actions {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--space-sm);
}
.sheet-actions :deep(.n-button) {
	min-height: 54px;
}
@media (max-width: 340px) {
	.global-actions,
	.sheet-actions {
		grid-template-columns: 1fr;
	}
}
</style>
