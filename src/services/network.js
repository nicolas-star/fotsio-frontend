import { ref } from "vue";

export const MAX_NETWORK_RETRIES = 3;
export const networkFailure = ref(null);

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

export function isRetryableAxiosError(error) {
  if (!error?.config || error.config._skipNetworkRetry) return false;
  if (!error.response) return true;
  return RETRYABLE_STATUS_CODES.has(error.response.status);
}

export function getRetryDelay(attempt) {
  return Math.min(500 * 2 ** attempt, 4000);
}

export function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function reportNetworkFailure(error) {
  networkFailure.value = {
    message:
      error?.message ||
      "Connessione al server non riuscita. Controlla la rete e riprova.",
    timestamp: Date.now(),
  };
}

export function clearNetworkFailure() {
  networkFailure.value = null;
}

export async function fetchWithRetry(input, init = {}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt += 1) {
    try {
      const response = await fetch(input, init);

      if (
        RETRYABLE_STATUS_CODES.has(response.status) &&
        attempt < MAX_NETWORK_RETRIES
      ) {
        await wait(getRetryDelay(attempt));
        continue;
      }

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        reportNetworkFailure(
          new Error(`Server non disponibile (${response.status})`),
        );
      } else {
        clearNetworkFailure();
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_NETWORK_RETRIES) {
        reportNetworkFailure(error);
        throw error;
      }
      await wait(getRetryDelay(attempt));
    }
  }

  throw lastError;
}
