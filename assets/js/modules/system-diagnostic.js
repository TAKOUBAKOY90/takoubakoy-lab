
/* ========================================
   TAKOUBAKOY LAB — System Diagnostic
   Module : Diagnostic environnement
   Version : 1.4.0
======================================== */

(() => {
  "use strict";

  const initSystemDiagnostic = () => {
    const getInfo = window.TAKOUBAKOY?.getBrowserInfo;

    if (typeof getInfo !== "function") {
      return;
    }

    const setValue = (id, value) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = String(value);
      }
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

    const runHttpLatencyTest = async () => {
      const resultElement = document.getElementById("diag-http-latency");
      const statusElement = document.getElementById("diag-http-status");
      const testButton = document.getElementById("diag-http-test");

      if (!resultElement || !statusElement || !testButton) {
        return;
      }

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

          const duration = performance.now() - start;

          if (!response.ok) {
            throw new Error(`Réponse HTTP ${response.status}`);
          }

          await response.body?.cancel();

          samples.push(duration);
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

    const refreshButton = document.getElementById("diag-refresh");

    if (refreshButton) {
      refreshButton.addEventListener("click", updateDiagnostic);
    }

    const httpTestButton = document.getElementById("diag-http-test");

    if (httpTestButton) {
      httpTestButton.addEventListener("click", runHttpLatencyTest);
    }

    updateDiagnostic();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSystemDiagnostic, {
      once: true
    });
  } else {
    initSystemDiagnostic();
  }
})();
