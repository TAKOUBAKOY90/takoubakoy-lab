
/* ========================================
   TAKOUBAKOY LAB — System Diagnostic
   Module : Diagnostic environnement
   Version : 1.6.0
======================================== */

(() => {
  "use strict";

  const initSystemDiagnostic = () => {
    const getInfo = window.TAKOUBAKOY?.getBrowserInfo;

    if (typeof getInfo !== "function") return;

    const HISTORY_KEY = "takoubakoy_speed_history";
    const MAX_HISTORY = 3;

    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    };

    const getBrowserName = (userAgent) => {
      if (/Edg\//.test(userAgent)) return "Microsoft Edge";
      if (/Firefox\//.test(userAgent)) return "Mozilla Firefox";
      if (/Chrome\//.test(userAgent)) return "Google Chrome";
      if (/Safari\//.test(userAgent)) return "Apple Safari";
      return "Navigateur non identifié";
    };

    const updateDiagnostic = () => {
      const info = getInfo();

      setValue("diag-user-agent", getBrowserName(info.userAgent));
      setValue("diag-platform", info.platform);
      setValue("diag-language", info.language);
      setValue("diag-cores", info.cores);

      setValue(
        "diag-memory",
        typeof info.memory === "number"
          ? `${info.memory} Go (estimation)`
          : info.memory
      );

      setValue(
        "diag-resolution",
        `${info.screen.width} × ${info.screen.height} pixels`
      );

      setValue("diag-pixel-ratio", `${info.screen.pixelRatio}x`);
      setValue("diag-online", info.online ? "Connecté" : "Hors ligne");

      const network = info.network;

      setValue("diag-network-type", network?.type || "Non disponible");
      setValue("diag-network-profile", network?.effectiveType || "Non disponible");

      setValue(
        "diag-network-downlink",
        typeof network?.downlink === "number"
          ? `${network.downlink} Mbit/s (estimation)`
          : "Non disponible"
      );

      setValue(
        "diag-network-rtt",
        typeof network?.rtt === "number"
          ? `${network.rtt} ms (estimation)`
          : "Non disponible"
      );

      setValue(
        "diag-network-save-data",
        typeof network?.saveData === "boolean"
          ? network.saveData ? "Activée" : "Désactivée"
          : "Non disponible"
      );

      const graphics = info.graphics;

      setValue(
        "diag-webgl",
        graphics?.available
          ? `Disponible (${graphics.version})`
          : "Non disponible"
      );

      setValue("diag-gpu-vendor", graphics?.vendor || "Non disponible");
      setValue("diag-gpu-renderer", graphics?.renderer || "Non disponible");

      setValue(
        "diag-last-update",
        `Dernière actualisation : ${new Date().toLocaleString("fr-FR")}`
      );

      document.documentElement.classList.add("system-diagnostic-ready");
    };

    // Évaluation indicative du débit.
    const getSpeedQuality = (speed) => {
      if (speed < 5) {
        return "Connexion limitée";
      }

      if (speed < 25) {
        return "Connexion modérée";
      }

      return "Connexion rapide";
    };

    // Lecture sécurisée de l'historique local.
    const readSpeedHistory = () => {
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        const history = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(history)) return [];

        return history
          .filter(item =>
            Number.isFinite(item.speed) &&
            Number.isFinite(item.bytes) &&
            typeof item.date === "string"
          )
          .slice(0, MAX_HISTORY);
      } catch (error) {
        return [];
      }
    };

    // Affichage de l'historique.
    const renderSpeedHistory = () => {
      const list = document.getElementById("diag-speed-history");
      if (!list) return;

      const history = readSpeedHistory();
      list.replaceChildren();

      if (history.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Aucun test enregistré.";
        list.appendChild(item);
        return;
      }

      history.forEach(test => {
        const item = document.createElement("li");
        const date = new Date(test.date);

        item.textContent =
          `${date.toLocaleString("fr-FR")} — ` +
          `${test.speed.toFixed(2)} Mbit/s — ` +
          `${(test.bytes / 1000000).toFixed(3)} Mo`;

        list.appendChild(item);
      });
    };

    // Enregistrement d'un résultat.
    const saveSpeedHistory = (speed, bytes) => {
      try {
        const history = readSpeedHistory();

        history.unshift({
          speed,
          bytes,
          date: new Date().toISOString()
        });

        localStorage.setItem(
          HISTORY_KEY,
          JSON.stringify(history.slice(0, MAX_HISTORY))
        );

        renderSpeedHistory();
      } catch (error) {
        const status = document.getElementById("diag-speed-status");

        if (status) {
          status.textContent +=
            " L'historique n'a pas pu être sauvegardé dans ce navigateur.";
        }
      }
    };

    // Test de latence HTTP.
    const runHttpLatencyTest = async () => {
      const resultElement = document.getElementById("diag-http-latency");
      const statusElement = document.getElementById("diag-http-status");
      const testButton = document.getElementById("diag-http-test");

      if (!resultElement || !statusElement || !testButton) return;

      if (!navigator.onLine) {
        resultElement.textContent = "Indisponible";
        statusElement.textContent = "Aucune connexion Internet détectée.";
        return;
      }

      testButton.disabled = true;
      resultElement.textContent = "Mesure en cours...";
      statusElement.textContent = "Exécution de trois requêtes HTTP.";

      const samples = [];
      const target = new URL("../assets/images/favicon.svg", document.baseURI);

      try {
        for (let i = 0; i < 3; i += 1) {
          target.searchParams.set("diagnostic", `${Date.now()}-${i}`);

          const start = performance.now();

          const response = await fetch(target.href, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin"
          });

          if (!response.ok) {
            throw new Error(`Réponse HTTP ${response.status}`);
          }

          await response.body?.cancel();
          samples.push(performance.now() - start);
        }

        const average =
          samples.reduce((total, value) => total + value, 0) /
          samples.length;

        resultElement.textContent = `${Math.round(average)} ms`;
        statusElement.textContent =
          "Moyenne de trois requêtes HTTP vers le serveur TAKOUBAKOY LAB.";
      } catch (error) {
        resultElement.textContent = "Échec du test";
        statusElement.textContent =
          "Impossible de mesurer la latence HTTP. Vérifiez la connexion et réessayez.";
      } finally {
        testButton.disabled = false;
      }
    };

    // Test de débit avec limite de téléchargement.
    const runSpeedTest = async () => {
      const consent = document.getElementById("diag-speed-consent");
      const button = document.getElementById("diag-speed-test");
      const result = document.getElementById("diag-speed-result");
      const status = document.getElementById("diag-speed-status");
      const quality = document.getElementById("diag-speed-quality");

      if (!consent || !button || !result || !status) return;

      if (!consent.checked) {
        status.textContent = "Autorisation nécessaire avant le test.";
        return;
      }

      if (!navigator.onLine) {
        result.textContent = "Indisponible";
        status.textContent = "Aucune connexion Internet détectée.";
        return;
      }

      const maxBytes = 1000000;
      const target = new URL(
        "../assets/images/og-takoubakoy-lab.png",
        document.baseURI
      );

      target.searchParams.set("speed-test", Date.now());

      button.disabled = true;
      consent.disabled = true;
      result.textContent = "Mesure en cours...";
      status.textContent = "Téléchargement du fichier de test...";

      if (quality) {
        quality.textContent = "Évaluation en cours...";
      }

      const start = performance.now();
      let transferred = 0;

      try {
        const response = await fetch(target.href, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin"
        });

        if (!response.ok) {
          throw new Error(`Réponse HTTP ${response.status}`);
        }

        if (new URL(response.url).origin !== window.location.origin) {
          throw new Error("Origine du téléchargement non autorisée.");
        }

        if (!response.body) {
          throw new Error("Flux de téléchargement indisponible.");
        }

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          transferred += value.byteLength;

          if (transferred > maxBytes) {
            await reader.cancel();
            throw new Error("Limite de téléchargement dépassée.");
          }
        }

        const duration = (performance.now() - start) / 1000;

        if (transferred === 0 || duration <= 0) {
          throw new Error("Mesure invalide.");
        }

        const megabitsPerSecond =
          (transferred * 8) / duration / 1000000;

        result.textContent = `${megabitsPerSecond.toFixed(2)} Mbit/s`;

        status.textContent =
          `Test terminé : ${(transferred / 1000000).toFixed(3)} Mo transférés en ${duration.toFixed(2)} secondes.`;

        if (quality) {
          quality.textContent = getSpeedQuality(megabitsPerSecond);
        }

        saveSpeedHistory(megabitsPerSecond, transferred);
      } catch (error) {
        result.textContent = "Échec du test";

        if (quality) {
          quality.textContent = "Évaluation indisponible.";
        }

        status.textContent =
          "Le téléchargement n'a pas pu être mesuré. Vérifiez la connexion et réessayez.";
      } finally {
        button.disabled = !consent.checked;
        consent.disabled = false;
      }
    };

    const refreshButton = document.getElementById("diag-refresh");
    if (refreshButton) {
      refreshButton.addEventListener("click", updateDiagnostic);
    }

    const httpTestButton = document.getElementById("diag-http-test");
    if (httpTestButton) {
      httpTestButton.addEventListener("click", runHttpLatencyTest);
    }

    const speedConsent = document.getElementById("diag-speed-consent");
    const speedButton = document.getElementById("diag-speed-test");

    if (speedConsent && speedButton) {
      speedButton.disabled = !speedConsent.checked;

      speedConsent.addEventListener("change", () => {
        speedButton.disabled = !speedConsent.checked;
      });

      speedButton.addEventListener("click", runSpeedTest);
    }

    const clearHistoryButton =
      document.getElementById("diag-speed-history-clear");

    if (clearHistoryButton) {
      clearHistoryButton.addEventListener("click", () => {
        try {
          localStorage.removeItem(HISTORY_KEY);
        } catch (error) {
          // Le stockage local peut être désactivé.
        }

        renderSpeedHistory();
      });
    }

    updateDiagnostic();
    renderSpeedHistory();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSystemDiagnostic, {
      once: true
    });
  } else {
    initSystemDiagnostic();
  }
})();
