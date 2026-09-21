<!-- <template>
  <div class="page-container device-list-view">
    <header class="view-header slide-up">
      <router-link to="/" class="btn-back">←</router-link>
      <h1>Domotica</h1>
      <button class="btn-refresh" @click="fetchDatiHardware" :disabled="loading">
        <span :class="{ 'spinning': loading }">🔄</span>
      </button>
    </header>

    <div class="status-banner glass-effect slide-up" :class="mqttConnected ? 'connected' : 'disconnected'">
      <div class="status-content">
        <span class="status-dot"></span>
        <span class="status-text">{{ mqttConnected ? 'Sistema Online' : 'Sistema Offline' }}</span>
      </div>
      <span class="status-label">MQTT</span>
    </div>

    <div v-if="loading && !tapparelle.length" class="loading-state">
      <div v-for="i in 3" :key="i" class="skeleton-card"></div>
    </div>

    <div v-else class="devices-list slide-up">
      <h3 class="section-title">Tapparelle</h3>
      
      <div v-for="tapparella in tapparelle" :key="tapparella.deviceId" class="box-container glass-effect device-card">
        <div class="device-main">
          <div class="device-icon-wrapper" :class="{ 'active': tapparella.attivo }">
            <span class="device-icon">🪟</span>
          </div>
          <div class="device-info">
            <h4>{{ tapparella.nome || tapparella.deviceId }}</h4>
            <div class="device-status">
              <span class="status-indicator" :class="{ 'online': tapparella.attivo }"></span>
              {{ tapparella.attivo ? 'Disponibile' : 'Non raggiungibile' }}
            </div>
          </div>
        </div>
        
        <div class="device-controls">
          <button 
            @click="inviaComando(tapparella, 'open')" 
            :disabled="!tapparella.attivo || processing === tapparella.deviceId" 
            class="control-btn"
          >
            <span class="icon">⬆️</span>
            <span class="label">Apri</span>
          </button>
          
          <button 
            @click="inviaComando(tapparella, 'stop')" 
            :disabled="!tapparella.attivo || processing === tapparella.deviceId" 
            class="control-btn stop"
          >
            <span class="icon">⏹️</span>
          </button>
          
          <button 
            @click="inviaComando(tapparella, 'close')" 
            :disabled="!tapparella.attivo || processing === tapparella.deviceId" 
            class="control-btn"
          >
            <span class="icon">⬇️</span>
            <span class="label">Chiudi</span>
          </button>
        </div>

        <div v-if="processing === tapparella.deviceId" class="processing-overlay">
          <div class="mini-loader"></div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>
  </div>
</template>

<script>
import http from '../../api/http';

export default {
  name: 'DeviceList',
  data() {
    return {
      tapparelle: [],
      mqttConnected: false,
      loading: false,
      processing: null,
      error: null
    };
  },
  async mounted() {
    await this.fetchDatiHardware();
  },
  methods: {
    async fetchDatiHardware() {
      this.loading = true;
      try {
        const statusRes = await http.get('/api/hardware/status');
        this.mqttConnected = statusRes.status === 'connected';

        const devicesRes = await http.get('/api/hardware/devices');
        if (devicesRes.success) {
          this.tapparelle = devicesRes.devices;
        }
      } catch (err) {
        console.error('Fetch hardware error:', err);
        this.error = 'Errore caricamento domotica';
      } finally {
        this.loading = false;
      }
    },
    async inviaComando(tapparella, command) {
      if (!tapparella.attivo) return;
      
      this.processing = tapparella.deviceId;
      try {
        const res = await http.post('/api/hardware/cover', {
          deviceId: tapparella.deviceId,
          coverId: tapparella.coverId,
          command: command
        });

        if (!res.success) {
          this.showError(res.message || 'Comando fallito');
        }
      } catch (err) {
        this.showError('Errore comunicazione dispositivo');
      } finally {
        this.processing = null;
      }
    },
    showError(msg) {
      this.error = msg;
      setTimeout(() => this.error = null, 3000);
    }
  }
};
</script>

<style scoped>
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.btn-back {
  text-decoration: none;
  font-size: 24px;
  color: var(--color-text);
  background: var(--color-background-gray);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.view-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.btn-refresh {
  background: var(--color-background-gray);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  font-size: 18px;
  cursor: pointer;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 20px;
  margin-bottom: 30px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
}

.status-text {
  font-weight: 700;
  font-size: 15px;
}

.status-label {
  font-size: 12px;
  font-weight: 800;
  opacity: 0.5;
}

.connected .status-dot { background: var(--color-success); box-shadow: 0 0 10px var(--color-success); }
.connected .status-text { color: var(--color-success); }

.disconnected .status-dot { background: var(--color-danger); }
.disconnected .status-text { color: var(--color-danger); }

.section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-grey);
  margin-bottom: 16px;
  margin-left: 8px;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-card {
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.device-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--color-background-gray);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
}

.device-icon-wrapper.active {
  background: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
}

.device-info h4 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 700;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-grey);
  font-weight: 500;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--color-text-grey);
}

.status-indicator.online {
  background: var(--color-success);
}

.device-controls {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 12px;
}

.control-btn {
  background: var(--color-background-gray);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn .icon { font-size: 20px; }
.control-btn .label { font-size: 12px; font-weight: 700; color: var(--color-text); }

.control-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: var(--color-border);
}

.control-btn.stop {
  justify-content: center;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.processing-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.mini-loader {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-danger);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  z-index: 1000;
}
</style> -->
