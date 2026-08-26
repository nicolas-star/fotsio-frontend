export async function checkAppVersion() {
    try {
        // Aggiungiamo un timestamp per evitare la cache del file version.json stesso
        const response = await fetch('/version.json?t=' + Date.now(), {
            cache: 'no-store'
        });
        
        if (!response.ok) return;

        const remote = await response.json();
        const localVersion = localStorage.getItem('app_version');

        if (localVersion && remote.version !== localVersion) {
            console.log('Nuova versione rilevata. Aggiornamento in corso...');
            
            // Aggiorna versione locale
            localStorage.setItem('app_version', remote.version);
            
            // Pulisce cache se necessario (opzionale, dipende dalle esigenze)
            // localStorage.clear(); // Attenzione: cancella anche i token!
            
            // Forza il ricaricamento ignorando la cache del browser
            window.location.reload(true);
        } else if (!localVersion) {
            // Prima installazione/avvio
            localStorage.setItem('app_version', remote.version);
        }
    } catch (error) {
        console.warn('Impossibile verificare la versione dell\'app:', error);
    }
}
