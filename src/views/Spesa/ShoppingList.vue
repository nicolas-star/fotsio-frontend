<template>
  <div class="page-container shopping-list-view">
    <header class="view-header slide-up">
      <router-link to="/" class="btn-back">←</router-link>
      <h1>Finanze</h1>
      <button class="btn-add" @click="showAddModal = true">
        <span>+</span>
      </button>
    </header>

    <div v-if="loading && !spese.length" class="loading-state">
      <div class="skeleton-card small"></div>
      <div v-for="i in 4" :key="i" class="skeleton-card line"></div>
    </div>

    <div v-else class="content-wrapper slide-up">
      <div class="box-container glass-effect total-overview">
        <div class="overview-info">
          <span class="overview-label">Budget Mensile</span>
          <h2 class="overview-amount">€ {{ totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 }) }}</h2>
        </div>
        <div class="overview-chart">
          <!-- Placeholder for a mini sparkline or progress circle -->
          <div class="progress-circle"></div>
        </div>
      </div>

      <div class="list-section">
        <h3 class="section-title">Spese Ricorrenti</h3>
        
        <div v-if="spese.length === 0" class="empty-state box-container glass-effect">
          <p>Nessuna spesa registrata per questo mese.</p>
        </div>
        
        <div v-for="spesa in spese" :key="spesa.id" class="box-container glass-effect expense-item">
          <div class="expense-main">
            <div class="expense-icon-bg">
              <span>{{ getIcon(spesa.nome) }}</span>
            </div>
            <div class="expense-info">
              <span class="expense-name">{{ spesa.nome }}</span>
              <span class="expense-desc">{{ spesa.descrizione }}</span>
            </div>
          </div>
          <div class="expense-amount">
            € {{ (spesa.prezzo || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal per aggiunta -->
    <Transition name="fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content glass-effect slide-up">
          <div class="modal-header">
            <h3>Nuova Spesa</h3>
            <button class="btn-close" @click="showAddModal = false">✕</button>
          </div>
          
          <div class="modal-form">
            <div class="form-group">
              <label>Cosa</label>
              <input v-model="newSpesa.nome" type="text" placeholder="Es. Affitto, Netflix..." class="ios-input" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Importo</label>
                <div class="price-input-wrapper">
                  <span class="currency">€</span>
                  <input v-model.number="newSpesa.prezzo" type="number" step="0.01" class="ios-input price-input" />
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Note</label>
              <textarea v-model="newSpesa.descrizione" placeholder="Aggiungi dettagli..." class="ios-input textarea"></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="showAddModal = false">Annulla</button>
            <button class="btn-primary" @click="handleSaveSpesa" :disabled="!newSpesa.nome || loading">
              {{ loading ? 'Salvataggio...' : 'Salva Spesa' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="error" class="error-toast">{{ error }}</div>
  </div>
</template>

<script>
import http from '../../api/http';
import { useAuthStore } from '../../store/auth';
import { mapState } from 'pinia';

export default {
  name: 'ShoppingList',
  data() {
    return {
      spese: [],
      loading: false,
      showAddModal: false,
      newSpesa: {
        nome: '',
        prezzo: 0,
        descrizione: '',
        idValuta: 1,
        idRicorrenza: 1,
        circa: false,
        giornoPagamento: 1
      },
      error: null
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    totalAmount() {
      return this.spese.reduce((sum, s) => sum + (s.prezzo || 0), 0);
    }
  },
  async mounted() {
    await this.fetchSpese();
  },
  methods: {
    async fetchSpese() {
      this.loading = true;
      try {
        const payload = {
          idFamiglia: this.user?.idFamiglia,
          idUtente: this.user?.id,
        };
        const res = await http.post('/api/spesa/get_lista_spese_ricorrente', payload);
        this.spese = res || [];
      } catch (err) {
        this.error = 'Errore caricamento finanze';
      } finally {
        this.loading = false;
      }
    },
    async handleSaveSpesa() {
      if (!this.newSpesa.nome) return;
      this.loading = true;
      try {
        const payload = {
          ...this.newSpesa,
          idFamiglia: this.user?.idFamiglia,
          idUtenteCreatore: this.user?.id,
          dataScadenza: new Date().toISOString()
        };
        
        await http.post('/api/spesa/add_spesa_ricorrente', payload);
        
        this.showAddModal = false;
        this.newSpesa = { nome: '', prezzo: 0, descrizione: '', idValuta: 1, idRicorrenza: 1, circa: false, giornoPagamento: 1 };
        await this.fetchSpese();
      } catch (err) {
        this.showError('Errore salvataggio spesa');
      } finally {
        this.loading = false;
      }
    },
    getIcon(nome) {
      const n = (nome || '').toLowerCase();
      if (n.includes('affitto') || n.includes('casa')) return '🏠';
      if (n.includes('auto') || n.includes('benzina')) return '🚗';
      if (n.includes('tel') || n.includes('internet')) return '📱';
      if (n.includes('cibo') || n.includes('spesa')) return '🛒';
      if (n.includes('netflix') || n.includes('spotify')) return '📺';
      return '💸';
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

.btn-add {
  background: var(--color-primary);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: white;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.total-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px;
  background: linear-gradient(135deg, var(--glass-bg) 0%, var(--color-background-gray) 100%);
  margin-bottom: 30px;
}

.overview-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-grey);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.overview-amount {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--color-primary);
}

.progress-circle {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-background-gray);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

.section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-grey);
  margin-bottom: 16px;
  margin-left: 8px;
}

.list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
}

.expense-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expense-icon-bg {
  width: 48px;
  height: 48px;
  background: var(--color-background-gray);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.expense-info {
  display: flex;
  flex-direction: column;
}

.expense-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-text);
}

.expense-desc {
  font-size: 12px;
  color: var(--color-text-grey);
  margin-top: 2px;
}

.expense-amount {
  font-weight: 800;
  font-size: 16px;
  color: var(--color-text);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-grey);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background: var(--color-background);
  border-radius: 32px 32px 0 0;
  padding: 30px;
  padding-bottom: calc(30px + var(--safe-area-bottom));
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.btn-close {
  background: var(--color-background-gray);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-grey);
  margin-bottom: 8px;
  display: block;
  margin-left: 4px;
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency {
  position: absolute;
  left: 16px;
  font-weight: 700;
  color: var(--color-text-grey);
}

.price-input {
  padding-left: 36px !important;
  font-weight: 700;
  font-size: 20px !important;
}

.textarea {
  min-height: 100px;
  resize: none;
}

.modal-footer {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  margin-top: 30px;
}

/* Skeleton */
.skeleton-card {
  background: var(--color-background-gray);
  border-radius: 20px;
  animation: pulse 1.5s infinite;
}

.skeleton-card.line { height: 80px; margin-bottom: 12px; }
.skeleton-card.small { height: 100px; margin-bottom: 30px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
