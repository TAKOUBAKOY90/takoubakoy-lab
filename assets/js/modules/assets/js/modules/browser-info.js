
/* ========================================
   TAKOUBAKOY LAB — Browser Info
   Module : Diagnostic navigateur
   Version : 1.0.0
======================================== */

(() => {
  "use strict";

  const getBrowserInfo = () => {
    const nav = window.navigator;
    const screenInfo = window.screen;

    return {
      userAgent: nav.userAgent,
      platform: nav.userAgentData?.platform || nav.platform || "Non disponible",
      language: nav.language || "Non disponible",
      online: nav.onLine,
      screen: {
        width: screenInfo.width,
        height: screenInfo.height,
        pixelRatio: window.devicePixelRatio || 1
      },
      memory: nav.deviceMemory || "Non disponible",
      cores: nav.hardwareConcurrency || "Non disponible"
    };
  };

  window.TAKOUBAKOY = window.TAKOUBAKOY || {};
  window.TAKOUBAKOY.getBrowserInfo = getBrowserInfo;
})();
