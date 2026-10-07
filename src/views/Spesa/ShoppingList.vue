<template>
	<div>
		<Header
			title="Finanze"
			subtitle="Le spese ricorrenti della famiglia">
			<template #end>
				<n-button type="primary" aria-label="Nuova spesa" @click="showAddModal = true">
					<template #icon><n-icon><AddOutline /></n-icon></template>
				</n-button>
			</template>
		</Header>

		<PageContent>
		<n-space vertical size="large">
			<n-alert v-if="error" type="error" closable @close="error = ''">
				{{ error }}
			</n-alert>

			<n-skeleton v-if="loading && !expenses.length" height="130px" sharp />
			<template v-else>
				<n-card :bordered="false">
					<n-statistic label="Totale spese ricorrenti" :value="formatCurrency(totalAmount)" />
					<n-text depth="3">{{ expenses.length }} voci registrate</n-text>
				</n-card>

				<n-empty
					v-if="!expenses.length"
					description="Nessuna spesa ricorrente registrata" />

				<n-card
					v-for="expense in expenses"
					:key="expense.id"
					:bordered="false">
					<n-space justify="space-between" align="center" :wrap="false">
						<n-space align="center" :wrap="false">
							<n-avatar round color="var(--color-primary)">
								<n-icon><ReceiptOutline /></n-icon>
							</n-avatar>
							<div>
								<n-text strong>{{ expense.nome }}</n-text>
								<br />
								<n-text depth="3">{{ expense.descrizione || "Spesa ricorrente" }}</n-text>
							</div>
						</n-space>
						<n-text strong>{{ formatCurrency(expense.importo) }}</n-text>
					</n-space>
				</n-card>
			</template>
		</n-space>
		</PageContent>

		<BottomSheet
			v-model:show="showAddModal"
			title="Nuova spesa ricorrente"
			subtitle="Aggiungi una voce alle spese della famiglia"
			:height="'min(88dvh, 720px)'"
			:mask-closable="!saving"
			:closable="!saving"
			:content-padding="'var(--space-md) var(--space-md) var(--space-lg)'">
			<n-form :model="form" @submit.prevent="saveExpense">
				<n-form-item label="Nome" required>
					<n-input
						v-model:value="form.nome"
						placeholder="Es. Affitto, Internet"
						:disabled="saving" />
				</n-form-item>
				<n-form-item label="Importo" required>
					<n-input-number
						v-model:value="form.prezzo"
						:min="0"
						:precision="2"
						:show-button="false"
						:disabled="saving"
						block>
						<template #prefix>€</template>
					</n-input-number>
				</n-form-item>
				<n-form-item label="Note">
					<n-input
						v-model:value="form.descrizione"
						type="textarea"
						placeholder="Aggiungi un dettaglio"
						:disabled="saving" />
				</n-form-item>
				<n-space justify="end">
					<n-button :disabled="saving" @click="showAddModal = false">
						Annulla
					</n-button>
					<n-button
						type="primary"
						attr-type="submit"
						:loading="saving"
						:disabled="!form.nome.trim()">
						Salva spesa
					</n-button>
				</n-space>
			</n-form>
		</BottomSheet>

		<Snackbar
			:show="Boolean(snackbar.message)"
			:message="snackbar.message"
			:type="snackbar.type"
			@close="snackbar.message = ''" />
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
	NAlert,
	NAvatar,
	NButton,
	NCard,
	NEmpty,
	NForm,
	NFormItem,
	NIcon,
	NInput,
	NInputNumber,
	NSkeleton,
	NSpace,
	NStatistic,
	NText,
} from "naive-ui";
import { AddOutline, ReceiptOutline } from "@vicons/ionicons5";
import Header from "../../components/Header.vue";
import PageContent from "../../components/PageContent.vue";
import BottomSheet from "../../components/BottomSheet.vue";
import Snackbar from "../../components/Snackbar.vue";
import { createRecurringExpense, listRecurringExpenses } from "../../services/expenses";
import { useAuthStore } from "../../store/auth";

const authStore = useAuthStore();
const expenses = ref([]);
const loading = ref(false);
const saving = ref(false);
const showAddModal = ref(false);
const error = ref("");
const snackbar = ref({ message: "", type: "info" });
const form = ref(createEmptyExpense());
const totalAmount = computed(() =>
	expenses.value.reduce((sum, expense) => sum + Number(expense.importo || 0), 0),
);

function createEmptyExpense() {
	return {
		nome: "",
		prezzo: 0,
		descrizione: "",
		idValuta: 1,
		idRicorrenza: 1,
		circa: false,
		giornoPagamento: 1,
	};
}

function formatCurrency(value) {
	return new Intl.NumberFormat("it-IT", {
		style: "currency",
		currency: "EUR",
	}).format(Number(value || 0));
}

function showMessage(message, type) {
	snackbar.value = { message, type };
}

async function loadExpenses() {
	loading.value = true;
	error.value = "";
	try {
		expenses.value = await listRecurringExpenses(authStore.user);
	} catch (loadError) {
		error.value = loadError.message || "Errore caricamento finanze";
	} finally {
		loading.value = false;
	}
}

async function saveExpense() {
	if (saving.value || !form.value.nome.trim()) return;
	saving.value = true;
	error.value = "";
	try {
		await createRecurringExpense(authStore.user, {
			...form.value,
			nome: form.value.nome.trim(),
			prezzo: Number(form.value.prezzo || 0),
		});
		showAddModal.value = false;
		form.value = createEmptyExpense();
		showMessage("Spesa salvata", "success");
		await loadExpenses();
	} catch (saveError) {
		showMessage(saveError.message || "Errore salvataggio spesa", "error");
	} finally {
		saving.value = false;
	}
}

onMounted(loadExpenses);
</script>
