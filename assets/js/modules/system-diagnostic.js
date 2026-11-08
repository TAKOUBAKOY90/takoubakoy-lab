
/* ========================================
   TAKOUBAKOY LAB — System Diagnostic
   Module : Diagnostic environnement
   Version : 1.0.0
======================================== */

(() => {
  "use strict";

  const initSystemDiagnostic = () => {
    const getInfo = window.TAKOUBAKOY?.getBrowserInfo;

    if (typeof getInfo !== "function") {
      return;
    }

    const info = getInfo();

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

    setValue(
      "diag-user-agent",
      getBrowserName(info.userAgent)
    );

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

    setValue(
      "diag-pixel-ratio",
      `${info.screen.pixelRatio}x`
    );

    setValue(
      "diag-online",
      info.online ? "Connecté" : "Hors ligne"
    );

    document.documentElement.classList.add(
      "system-diagnostic-ready"
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSystemDiagnostic,
      { once: true }
    );
  } else {
    initSystemDiagnostic();
  }
})();
