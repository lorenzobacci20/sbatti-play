"use strict";
const byId = (id) => document.getElementById(id);
let unity;
function fail(detail) {
  byId("unity-loading-bar").hidden = true;
  byId("unity-canvas").hidden = true;
  byId("load-error").hidden = false;
  byId("error-detail").textContent = detail;
  byId("fullscreen").disabled = true;
}
byId("play").addEventListener("click", async () => {
  byId("play").disabled = true;
  byId("cover").hidden = true;
  byId("unity-loading-bar").hidden = false;
  try {
    let runtimeFailed = false;
    if (!document.createElement("canvas").getContext("webgl2")) throw new Error("WebGL 2 non disponibile. Prova Chrome desktop aggiornato con accelerazione grafica attiva.");
    const response = await fetch("release.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Impossibile leggere la versione. Controlla la connessione e riprova.");
    const release = await response.json();
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = release.loader;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Download del motore non riuscito. Controlla la connessione e riprova."));
      document.body.appendChild(script);
    });
    const canvas = byId("unity-canvas");
    canvas.hidden = false;
    unity = await createUnityInstance(canvas, {
      ...release.unity,
      showBanner(message, type) {
        if (type === "error") {
          runtimeFailed = true;
          console.error(message);
          fail("Il motore ha segnalato un errore. Ricarica la pagina; se persiste, indica versione e browser nella segnalazione.");
        } else console.warn(message);
      },
    }, (progress) => {
      byId("progress").value = progress;
      byId("status").textContent = `Caricamento · ${Math.round(progress * 100)}%`;
    });
    if (runtimeFailed) throw new Error("Il motore ha segnalato un errore. Ricarica la pagina; se persiste, invia una segnalazione.");
    byId("unity-loading-bar").hidden = true;
    byId("player-hint").textContent = "Clic nel gioco per iniziare · Esc libera il mouse";
    byId("fullscreen").disabled = false;
    document.documentElement.dataset.gameReady = "true";
    canvas.focus();
  } catch (error) {
    fail(error instanceof TypeError ? "Download non riuscito. Controlla la connessione e riprova; se persiste, segnala il problema indicando browser e versione." : error instanceof Error ? error.message : "Avvio non riuscito. Prova a ricaricare la pagina in Chrome desktop.");
  }
});
byId("retry").addEventListener("click", () => location.reload());
byId("fullscreen").addEventListener("click", () => unity?.SetFullscreen(1));
byId("copy-feedback").addEventListener("click", async () => {
  const text = "SBATTI 0.1.0-alpha.1\nBrowser e sistema operativo: \nTipo: bug / idea\nCosa ho fatto (passaggi): \nCosa mi aspettavo: \nCosa è successo: \nSi ripete? sempre / a volte / una volta\nImpatto: blocco / grave / minore\nScreenshot facoltativo, senza dati privati.\n";
  try {
    await navigator.clipboard.writeText(text);
    byId("copy-status").textContent = "Scheda copiata. Incollala nel messaggio privato a chi ti ha invitato.";
  } catch {
    byId("feedback-text").hidden = false;
    byId("feedback-text").value = text;
    byId("feedback-text").select();
    byId("copy-status").textContent = "Copia la scheda qui sotto e inviala in privato.";
  }
});
