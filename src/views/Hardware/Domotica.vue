<template>
  <div class="page-container domotica-view">
    <Header
      title="Domotica"
      subtitle="Controlla le tapparelle"
      back-to="/"
      show-back
    />
    <n-space vertical size="large">
      <n-card :bordered="false"
        ><n-space justify="space-between" align="center"
          ><span>{{
            mqttConnected ? "Sistema online" : "Sistema offline"
          }}</span
          ><n-tag :type="mqttConnected ? 'success' : 'error'"
            >MQTT</n-tag
          ></n-space
        ></n-card
      >
      <n-space
        ><n-button
          type="primary"
          :loading="globalLoading === 'open'"
          :disabled="Boolean(globalLoading) || !activeDevices.length"
          @click="runAll('open')"
          >Apri tutto</n-button
        ><n-button
          :loading="globalLoading === 'close'"
          :disabled="Boolean(globalLoading) || !activeDevices.length"
          @click="runAll('close')"
          >Chiudi tutto</n-button
        ></n-space
      >
      <n-alert v-if="error" type="error" :show-icon="false">{{
        error
      }}</n-alert>
      <n-space v-if="loading && !devices.length" vertical
        ><n-skeleton v-for="index in 4" :key="index" height="260px" sharp
      /></n-space>
      <n-empty
        v-else-if="!devices.length"
        description="Nessuna tapparella disponibile"
      />
      <n-grid v-else :cols="1" :y-gap="16">
        <n-gi v-for="device in devices" :key="device.deviceId">
          <n-card :title="device.nome || device.deviceId" :bordered="false">
            <template #header-extra
              ><n-tag
                :type="device.attivo ? 'success' : 'error'"
                size="small"
                >{{
                  device.attivo ? "Disponibile" : "Non raggiungibile"
                }}</n-tag
              ></template
            >
            <n-space vertical>
              <n-space justify="space-between"
                ><span>Posizione</span
                ><strong>{{ device.position ?? 0 }}%</strong></n-space
              >
              <n-progress
                type="line"
                :percentage="device.position ?? 0"
                :show-indicator="false"
              />
              <n-slider
                :value="device.position ?? 0"
                :step="5"
                :disabled="isBusy(device) || !device.attivo"
                @update:value="setPosition(device, $event)"
              />
              <n-space
                ><n-button
                  type="primary"
                  :loading="isBusy(device)"
                  :disabled="!canCommand(device)"
                  @click="runCommand(device, 'open')"
                  >Alza</n-button
                ><n-button
                  :loading="isBusy(device)"
                  :disabled="!canCommand(device)"
                  @click="runCommand(device, 'stop')"
                  >Stop</n-button
                ><n-button
                  :loading="isBusy(device)"
                  :disabled="!canCommand(device)"
                  @click="runCommand(device, 'close')"
                  >Abbassa</n-button
                ></n-space
              >
              <n-space
                ><n-button
                  :loading="isBusy(device)"
                  :disabled="!canCommand(device)"
                  @click="setPosition(device, 50)"
                  ><span>Apri al 50%</span></n-button
                ><n-button
                  :loading="isBusy(device)"
                  :disabled="!canCommand(device)"
                  @click="runCommand(device, 'open_slats')"
                  >Fessure aperte</n-button
                ></n-space
              >
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
    <Snackbar
      :show="Boolean(snackbar.message)"
      :message="snackbar.message"
      :type="snackbar.type"
      @close="snackbar.message = ''"
    />
  </div>
</template>

<script>
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NGi,
  NGrid,
  NProgress,
  NSlider,
  NSkeleton,
  NSpace,
  NTag,
} from "naive-ui";
import Header from "../../components/Header.vue";
import Snackbar from "../../components/Snackbar.vue";
import {
  getHardwareDevices,
  getHardwareStatus,
  sendCoverCommand,
} from "../../services/hardware";

export default {
  name: "Domotica",
  components: {
    Header,
    Snackbar,
    NAlert,
    NButton,
    NCard,
    NEmpty,
    NGi,
    NGrid,
    NProgress,
    NSlider,
    NSkeleton,
    NSpace,
    NTag,
  },
  data() {
    return {
      devices: [],
      mqttConnected: false,
      loading: false,
      busyDevices: new Set(),
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
    canCommand(device) {
      return device.attivo && !this.globalLoading && !this.isBusy(device);
    },
    isBusy(device) {
      return [...this.busyDevices].some((key) =>
        key.startsWith(`${device.deviceId}:`),
      );
    },
    markBusy(device, command, busy) {
      const key = `${device.deviceId}:${command}`;
      if (busy) this.busyDevices.add(key);
      else this.busyDevices.delete(key);
    },
    async runCommand(device, command) {
      if (!this.canCommand(device)) return;
      this.markBusy(device, command, true);
      try {
        const response = await sendCoverCommand(device, command);
        if (!response?.success)
          throw new Error(response?.message || "Comando fallito");
        if (command === "open") device.position = 100;
        if (command === "close") device.position = 0;
        if (command === "open_slats") device.slatsOpen = true;
      } catch (err) {
        this.showSnackbar(
          `${device.nome || device.deviceId}: ${err.message || "Errore comunicazione dispositivo"}`,
          "error",
        );
      } finally {
        this.markBusy(device, command, false);
      }
    },
    async setPosition(device, position) {
      if (!this.canCommand(device)) return;
      this.markBusy(device, "position", true);
      try {
        const response = await sendCoverCommand(device, "position", {
          position,
        });
        if (!response?.success)
          throw new Error(response?.message || "Comando posizione fallito");
        device.position = position;
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
        if (result.status === "fulfilled" && result.value?.success)
          devices[index].position = command === "open" ? 100 : 0;
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
    },
    showSnackbar(message, type) {
      this.snackbar = { message, type };
    },
  },
};
</script>

<style scoped>
.domotica-view {
  padding: var(--space-md);
}
</style>
