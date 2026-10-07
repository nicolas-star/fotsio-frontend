<template>
	<div>
		<Header
			title="Domotica"
			subtitle="Controlla le tapparelle">
			<template #end>
				<n-button
					quaternary
					circle
					aria-label="Aggiorna stato"
					:loading="statusRefreshing"
					:disabled="statusRefreshing || !devices.length"
					@click="refreshCoverStatuses">
					<template #icon><n-icon><RefreshOutline /></n-icon></template>
				</n-button>
			</template>
		</Header>

		<PageContent>
			<HardwareControlPanel
			:mqtt-connected="mqttConnected"
			:global-loading="globalLoading"
			:active-device-count="activeDevices.length"
			:has-busy-devices="busyDevices.size > 0"
			:loading="loading"
			:devices="devices"
			:error="error"
			@run-evening="runEvening"
			@run-all="runAll"
				@select-device="openDeviceSheet" />
		</PageContent>

		<CoverControlDrawer
			v-model:show="sheetOpen"
			:device="selectedDevice"
			height="min(78dvh, 640px)"
			:state-label="selectedDevice ? stateLabel(selectedDevice) : ''"
			:slats-percentage="selectedDevice ? slatsPercentage(selectedDevice) : 50"
			:busy-actions="selectedBusyActions"
			:can-command="selectedDevice ? canCommand(selectedDevice) : false"
			@command="runCommand(selectedDevice, $event)"
			@set-position="setPosition(selectedDevice, $event)" />

	</div>
</template>

<script>
import { NButton, NIcon } from "naive-ui";
import { RefreshOutline } from "@vicons/ionicons5";
import Header from "../../components/Header.vue";
import PageContent from "../../components/PageContent.vue";
import HardwareControlPanel from "../../components/hardware/HardwareControlPanel.vue";
import CoverControlDrawer from "../../components/hardware/CoverControlDrawer.vue";
import { notifyError, notifySuccess, notifyWarning } from "../../services/notifications";
import {
	getAllCoverStatuses,
	getHardwareDevices,
	getHardwareStatus,
	getSlatsPercentage,
	openCoverSlats,
	runEveningProgram,
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
		PageContent,
		HardwareControlPanel,
		CoverControlDrawer,
		NButton,
		NIcon,
		RefreshOutline,
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
		};
	},
	computed: {
		activeDevices() {
			return this.devices.filter((device) => device.attivo);
		},
		selectedBusyActions() {
			if (!this.selectedDevice) return {};
			return {
				open: this.isBusy(this.selectedDevice, "open"),
				stop: this.isBusy(this.selectedDevice, "stop"),
				close: this.isBusy(this.selectedDevice, "close"),
				slats: this.isBusy(this.selectedDevice, "slats"),
				position: this.isBusy(this.selectedDevice, "position"),
			};
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
			const [statusResult, devicesResult] = await Promise.allSettled([
				getHardwareStatus(),
				getHardwareDevices(),
			]);
			if (statusResult.status === "fulfilled") {
				this.mqttConnected = statusResult.value?.status === "connected";
			} else {
				this.mqttConnected = false;
			}
			if (devicesResult.status === "fulfilled" && devicesResult.value?.success) {
				this.devices = devicesResult.value.devices || [];
			} else {
				const message =
					devicesResult.status === "rejected"
						? devicesResult.reason?.message
						: devicesResult.value?.message;
				this.error = message || "Errore caricamento domotica";
				notifyError(this.error);
			}
			if (statusResult.status === "rejected") {
				notifyWarning("Stato di connessione non disponibile");
			}
			this.loading = false;
		},
		async refreshCoverStatuses() {
			if (!this.devices.length || this.statusRefreshing) return;
			this.statusRefreshing = true;
			try {
				const response = await getAllCoverStatuses();
				if (!response?.success) {
					throw new Error(response?.message || "Stati tapparelle non disponibili");
				}
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
					if (Number.isFinite(status.currentPos) && status.currentPos >= 0) {
						device.position = status.currentPos;
					}
					device.coverState = this.normalizeCoverState(
						status.currentPos,
						status.state,
					);
				});
			} catch (err) {
				notifyError(err.message || "Errore aggiornamento stato tapparelle");
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
		stateLabel(device) {
			const state = device?.coverState;
			const label = STATE_LABELS[state] || STATE_LABELS.unknown;
			if (state !== "partial" || !Number.isFinite(device?.position)) {
				return label;
			}
			return `${label} (${device.position}%)`;
		},
		slatsPercentage(device) {
			return getSlatsPercentage(device);
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
			if (!device || !this.canCommand(device)) return;
			const action = command === "open_slats" ? "slats" : command;
			this.markBusy(device, action, true);
			try {
				const response =
					command === "open_slats"
						? await openCoverSlats(device)
						: await sendCoverCommand(device, command);
				if (!response?.success) {
					throw new Error(response?.message || "Comando fallito");
				}
				if (command === "open") device.position = 100;
				if (command === "close") device.position = 0;
				if (command === "open_slats") {
					device.position = getSlatsPercentage(device);
					device.slatsOpen = true;
				} else if (command === "open" || command === "close") {
					device.slatsOpen = false;
				}
				device.coverState = this.normalizeCoverState(device.position, null);
				this.scheduleStatusRefresh();
			} catch (err) {
				notifyError(
					`${device.nome || device.deviceId}: ${err.message || "Errore comunicazione dispositivo"}`,
				);
			} finally {
				this.markBusy(device, action, false);
			}
		},
		async setPosition(device, position) {
			if (!device || !this.canCommand(device)) return;
			this.markBusy(device, "position", true);
			try {
				const response = await setCoverPosition(device, position);
				if (!response?.success) {
					throw new Error(response?.message || "Comando posizione fallito");
				}
				device.position = position;
				device.slatsOpen = false;
				device.coverState = this.normalizeCoverState(position, null);
				this.scheduleStatusRefresh();
			} catch (err) {
				notifyError(
					`${device.nome || device.deviceId}: ${err.message || "Errore comunicazione dispositivo"}`,
				);
			} finally {
				this.markBusy(device, "position", false);
			}
		},
		async runAll(command) {
			if (this.globalLoading || this.busyDevices.size || !this.activeDevices.length) return;
			this.globalLoading = command;
			const devices = [...this.activeDevices];
			try {
				const results = await Promise.allSettled(
					devices.map((device) => sendCoverCommand(device, command)),
				);
				const failed = results.filter(
					(result) => result.status === "rejected" || !result.value?.success,
				);
				results.forEach((result, index) => {
					if (result.status !== "fulfilled" || !result.value?.success) return;
					devices[index].position = command === "open" ? 100 : 0;
					devices[index].slatsOpen = false;
					devices[index].coverState = command === "open" ? "open" : "closed";
				});
				this.showGlobalResult(
					results.length,
					failed.length,
					command === "open" ? "Tutte le tapparelle sono aperte" : "Tutte le tapparelle sono chiuse",
					"Nessuna tapparella ha eseguito il comando",
					"tapparelle",
				);
				if (failed.length < results.length) this.scheduleStatusRefresh();
			} finally {
				this.globalLoading = null;
			}
		},
		async runEvening() {
			if (this.globalLoading || this.busyDevices.size || !this.devices.length) return;
			this.globalLoading = "evening";
			try {
				const results = await runEveningProgram(this.devices);
				const failed = results.filter(
					(result) =>
						result.status === "rejected" || !result.value?.success,
				);
				results.forEach((result) => {
					if (result.status !== "fulfilled" || !result.value?.success) return;
					const { device, config } = result.value;
					if (config.eveningAction === "slats") {
						device.position = getSlatsPercentage(device);
						device.slatsOpen = true;
					} else if (config.eveningAction === "half") {
						device.position = 50;
						device.slatsOpen = false;
					} else {
						device.position = 0;
						device.slatsOpen = false;
					}
					device.coverState = this.normalizeCoverState(device.position, null);
				});
				this.showGlobalResult(
					results.length,
					failed.length,
					"Programma serale completato",
					"Il programma serale non è riuscito su alcuna tapparella",
					"tapparelle",
				);
				if (failed.length < results.length) this.scheduleStatusRefresh();
			} finally {
				this.globalLoading = null;
			}
		},
		showGlobalResult(total, failed, successMessage, failureMessage, subject) {
			if (!failed) {
				notifySuccess(successMessage);
			} else if (failed === total) {
				notifyError(failureMessage);
			} else {
				notifyWarning(
					`${total - failed} ${subject} aggiornate, ${failed} non riuscite`,
				);
			}
		},
		scheduleStatusRefresh() {
			const timer = setTimeout(async () => {
				this.statusRefreshTimers.delete(timer);
				await this.refreshCoverStatuses();
			}, STATUS_REFRESH_DELAY_MS);
			this.statusRefreshTimers.add(timer);
		},
	},
};
</script>
