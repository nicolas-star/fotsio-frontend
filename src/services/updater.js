export async function checkAppVersion() {
	const versionUrl = "/version.json?t=" + Date.now();

	try {
		const response = await fetch(versionUrl, {
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			// version.json può non essere pubblicato in alcuni deploy: non è un errore di rete,
			// ma un caso in cui la verifica dell'aggiornamento viene saltata in modo sicuro.
			return;
		}

		const raw = await response.text();
		if (!raw || !raw.trim()) return;

		let remote;
		try {
			remote = JSON.parse(raw);
		} catch (error) {
			console.warn(
				"version.json non valido. Ignoro il controllo versione.",
				error,
			);
			return;
		}

		if (!remote?.version) return;

		const localVersion = localStorage.getItem("app_version");

		if (localVersion && remote.version !== localVersion) {
			console.log("Nuova versione rilevata. Aggiornamento in corso...");
			localStorage.setItem("app_version", remote.version);
			window.location.reload();
			return;
		}

		if (!localVersion) {
			localStorage.setItem("app_version", remote.version);
		}
	} catch (error) {
		// Non interrompere l'avvio dell'app: il controllo versione è opzionale.
		console.info("Controllo versione saltato:", error.message || error);
	}
}
