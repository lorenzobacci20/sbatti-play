"use strict";
const byId = (id) => document.getElementById(id);
let unity;
const touchControls = installTouchControls();
function fail(detail) {
  touchControls?.disable();
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
    byId("fullscreen").disabled = false;
    document.documentElement.dataset.gameReady = "true";
    canvas.focus({ preventScroll: Boolean(touchControls?.connected) });
    updatePlayerHint();
  } catch (error) {
    fail(error instanceof TypeError ? "Download non riuscito. Controlla la connessione e riprova; se persiste, segnala il problema indicando browser e versione." : error instanceof Error ? error.message : "Avvio non riuscito. Prova a ricaricare la pagina in Chrome desktop.");
  }
});
byId("retry").addEventListener("click", () => location.reload());
byId("fullscreen").addEventListener("click", () => unity?.SetFullscreen(1));
byId("copy-feedback").addEventListener("click", async () => {
  const text = "SBATTI 0.4.2-alpha.1\nBrowser e sistema operativo: \nTipo: bug / idea\nCosa ho fatto (passaggi): \nCosa mi aspettavo: \nCosa è successo: \nSi ripete? sempre / a volte / una volta\nImpatto: blocco / grave / minore\nScreenshot facoltativo, senza dati privati.\n";
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

function updatePlayerHint() {
  const touch = Boolean(touchControls?.connected);
  byId("player-hint").textContent = touch
    ? "Stick per muoverti · Trascina a destra per la visuale"
    : "Clic nel gioco per iniziare · Esc libera il mouse";
  byId("fullscreen").hidden = touch;
  if (touch) byId("player").scrollIntoView({ block: "start" });
}

function installTouchControls() {
  if (!matchMedia("(pointer: coarse)").matches &&
      !(navigator.maxTouchPoints && matchMedia("(any-pointer: coarse)").matches)) return null;

  const player = byId("player");
  const layer = document.createElement("div");
  layer.id = "touch-controls";
  layer.hidden = true;
  layer.innerHTML = `
    <div class="touch-look" aria-hidden="true"></div>
    <div class="touch-stick" aria-hidden="true"><span></span></div>
    <button class="touch-pause" type="button">Pausa</button>
    <div class="touch-actions">
      <button class="touch-interact" type="button">Interagisci</button>
      <button class="touch-jump" type="button">Salta</button>
    </div>
    <div class="touch-pedals">
      <button class="touch-brake" type="button">Freno</button>
      <button class="touch-gas" type="button">Gas</button>
    </div>`;
  player.append(layer);

  const stick = layer.querySelector(".touch-stick");
  const knob = stick.firstElementChild;
  const look = layer.querySelector(".touch-look");
  const interact = layer.querySelector(".touch-interact");
  const jump = layer.querySelector(".touch-jump");
  const pedals = layer.querySelector(".touch-pedals");
  const axes = new Float32Array(6); // Move X/Y, look X/Y, gas, brake.
  const releases = [];
  let pending = 0;
  let mode = -1;

  function hold(element, move, release) {
    let pointer;
    function clear() {
      const previous = pointer;
      pointer = undefined;
      release();
      if (previous !== undefined && element.hasPointerCapture(previous)) {
        element.releasePointerCapture(previous);
      }
    }

    element.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" || pointer !== undefined) return;
      event.preventDefault();
      pointer = event.pointerId;
      element.setPointerCapture(pointer);
      move(event, true);
    });
    element.addEventListener("pointermove", (event) => {
      if (event.pointerId === pointer) move(event, false);
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
      element.addEventListener(name, (event) => {
        if (event.pointerId === pointer) clear();
      });
    }
    releases.push(clear);
  }

  hold(stick, (event) => {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * .36;
    const x = (event.clientX - rect.left - rect.width / 2) / radius;
    const y = (event.clientY - rect.top - rect.height / 2) / radius;
    const magnitude = Math.hypot(x, y);
    const scale = Math.max(1, magnitude);
    const strength = magnitude < .15 ? 0 : Math.min(1, (magnitude - .15) / .85);
    axes[0] = strength ? x / magnitude * strength : 0;
    axes[1] = strength ? -y / magnitude * strength : 0;
    knob.style.transform = `translate(${x / scale * radius}px, ${y / scale * radius}px)`;
  }, () => {
    axes[0] = axes[1] = 0;
    knob.style.transform = "";
  });

  let lastX, lastY;
  hold(look, (event, started) => {
    if (!started) {
      axes[2] += (event.clientX - lastX) * 1.8;
      axes[3] += (lastY - event.clientY) * 1.8;
    }
    lastX = event.clientX;
    lastY = event.clientY;
  }, () => {});

  for (const [label, axis] of [["gas", 4], ["brake", 5]]) {
    const button = layer.querySelector(".touch-" + label);
    hold(button, () => {
      axes[axis] = 1;
      button.classList.add("held");
    }, () => {
      axes[axis] = 0;
      button.classList.remove("held");
    });
  }
  for (const [button, flag] of [[interact, 1], [layer.querySelector(".touch-pause"), 2], [jump, 4]]) {
    button.addEventListener("click", () => { pending |= flag; });
  }

  function reset() {
    for (const release of releases) release();
    axes.fill(0);
    pending = 0;
  }

  window.addEventListener("blur", reset);
  window.addEventListener("pagehide", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });

  const bridge = {
    connected: false,
    read(next, heap, offset) {
      if (!bridge.connected) {
        bridge.connected = true;
        player.classList.add("touch-ready");
        if (document.documentElement.dataset.gameReady === "true") updatePlayerHint();
      }
      if (mode !== next) {
        reset();
        mode = next;
        layer.hidden = mode === 0;
        stick.hidden = mode === 3;
        look.hidden = mode === 3;
        jump.hidden = mode !== 1;
        pedals.hidden = mode !== 2;
        interact.textContent = mode === 3 ? "Avanti" : "Interagisci";
      }
      heap.set(axes, offset);
      axes[2] = axes[3] = 0;
      const flags = pending;
      pending = 0;
      return flags | 8;
    },
    disable() {
      reset();
      layer.hidden = true;
      player.classList.remove("touch-ready");
      delete window.sbattiTouch;
    },
  };

  window.sbattiTouch = bridge;
  return bridge;
}
