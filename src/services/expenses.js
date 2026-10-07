import http from "../api/http";
import { BYPASS_AUTH } from "../config";
import {
	addFakeRecurringExpense,
	getFakeRecurringExpenses,
} from "../data/fakeRecurringExpenses";

function normalizeExpense(expense = {}) {
	const amount = Number(expense.prezzo ?? expense.importo ?? expense.amount ?? 0);
	return {
		...expense,
		nome: expense.nome ?? expense.name ?? expense.descrizione ?? "Spesa",
		descrizione: expense.dettaglio ?? expense.descrizione ?? "",
		importo: amount,
	};
}

export async function listRecurringExpenses(user) {
	if (BYPASS_AUTH) return getFakeRecurringExpenses().map(normalizeExpense);

	const response = await http.post("/api/spesa/get_lista_spese_ricorrente", {
		idFamiglia: user?.idFamiglia,
		idUtente: user?.id,
	});
	return (Array.isArray(response) ? response : []).map(normalizeExpense);
}

export async function createRecurringExpense(user, expense) {
	const payload = {
		...expense,
		idFamiglia: user?.idFamiglia,
		idUtenteCreatore: user?.id,
		dataScadenza: new Date().toISOString(),
	};

	if (BYPASS_AUTH) {
		return {
			success: true,
			data: normalizeExpense(addFakeRecurringExpense(payload)),
		};
	}

	const response = await http.post(
		"/api/spesa/add_spesa_ricorrente",
		payload,
	);
	if (response?.success === false || response?.result === false) {
		throw new Error(response.message || "Salvataggio spesa non riuscito");
	}
	return {
		success: true,
		data: normalizeExpense(response?.spesa ?? response?.data ?? payload),
	};
}
