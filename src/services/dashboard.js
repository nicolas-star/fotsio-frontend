import http from "../api/http";
import { BYPASS_AUTH } from "../config";
import { getFakeDashboard } from "../data/fakeDashboard";
import { getFakeRecurringExpenses } from "../data/fakeRecurringExpenses";

export async function fetchDashboard(authStore) {
  if (BYPASS_AUTH) return getFakeDashboard();

  return http.post("/api/user/dashboard", {
    familyId: authStore.user?.idFamiglia,
    userId: authStore.user?.id,
  });
}

export async function fetchRecurringExpenses(authStore) {
  if (BYPASS_AUTH) return getFakeRecurringExpenses();

  return http.post("/api/spesa/get_lista_spese_ricorrente", {
    idFamiglia: authStore.user?.idFamiglia,
    idUtente: authStore.user?.id,
  });
}

export function sumRecurringExpenses(expenses) {
  return expenses.reduce(
    (total, item) => total + Number(item.importo || item.amount || 0),
    0,
  );
}
