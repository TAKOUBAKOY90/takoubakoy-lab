
/* ========================================
   TAKOUBAKOY LAB — System Diagnostic
   Module : Diagnostic environnement
   Version : 1.3.0
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

      // Navigateur et plateforme.
      setValue("diag-user-agent", getBrowserName(info.userAgent));
      setValue("diag-platform", info.platform);
      setValue("diag-language", info.language);

      // Processeur et mémoire.
      setValue("diag-cores", info.cores);

      setValue(
        "diag-memory",
        typeof info.memory === "number"
          ? `${info.memory} Go (estimation)`
          : info.memory
      );

      // Affichage.
      setValue(
        "diag-resolution",
        `${info.screen.width} × ${info.screen.height} pixels`
      );

      setValue("diag-pixel-ratio", `${info.screen.pixelRatio}x`);

      // Connexion.
      setValue("diag-online", info.online ? "Connecté" : "Hors ligne");

      // Informations réseau.
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

      // Informations graphiques.
      const graphics = info.graphics;

      setValue(
        "diag-webgl",
        graphics?.available
          ? `Disponible (${graphics.version})`
          : "Non disponible"
      );

      setValue("diag-gpu-vendor", graphics?.vendor || "Non disponible");
      setValue("diag-gpu-renderer", graphics?.renderer || "Non disponible");

      // Date et heure de la dernière actualisation.
      const now = new Date();

      setValue(
        "diag-last-update",
        `Dernière actualisation : ${now.toLocaleString("fr-FR")}`
      );

      document.documentElement.classList.add("system-diagnostic-ready");
    };

    const refreshButton = document.getElementById("diag-refresh");

    if (refreshButton) {
      refreshButton.addEventListener("click", updateDiagnostic);
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
