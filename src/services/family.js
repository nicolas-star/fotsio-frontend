import http from "../api/http";
import { BYPASS_AUTH } from "../config";
import { getFakeAddFamiglia } from "../data/fakeAddFamiglia";
import { getFakeAddUtenteFamiglia } from "../data/fakeAddUtenteFamiglia";

export async function joinFamily(authStore, codiceFamiglia) {
  const payload = {
    codiceFamiglia,
    idUtente: authStore.user?.id,
  };

  if (BYPASS_AUTH) {
    authStore.hasFamily = true;
    return getFakeAddUtenteFamiglia();
  }

  return http.post("/api/auth/AddUtenteFamiglia", payload);
}

export async function createFamily(authStore, nome, descrizione) {
  const payload = {
    nome,
    descrizione,
    idUtente: authStore.user?.id,
  };

  if (BYPASS_AUTH) {
    authStore.hasFamily = true;
    return getFakeAddFamiglia();
  }

  return http.post("/api/auth/AddFamiglia", payload);
}
