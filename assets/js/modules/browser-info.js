
/* ========================================
   TAKOUBAKOY LAB — Browser Info
   Module : Diagnostic navigateur
   Version : 1.1.0
======================================== */

(() => {
  "use strict";

  const getGraphicsInfo = () => {
    const canvas = document.createElement("canvas");

    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        available: false,
        version: "Non disponible",
        vendor: "Non disponible",
        renderer: "Non disponible"
      };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);

    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    const version = gl.getParameter(gl.VERSION);

    const result = {
      available: true,
      version: version || "Non disponible",
      vendor: vendor || "Non disponible",
      renderer: renderer || "Non disponible"
    };

    const loseContext = gl.getExtension("WEBGL_lose_context");

    if (loseContext) {
      loseContext.loseContext();
    }

    return result;
  };

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
      cores: nav.hardwareConcurrency || "Non disponible",

      graphics: getGraphicsInfo()
    };
  };

  window.TAKOUBAKOY = window.TAKOUBAKOY || {};
  window.TAKOUBAKOY.getBrowserInfo = getBrowserInfo;
})();
