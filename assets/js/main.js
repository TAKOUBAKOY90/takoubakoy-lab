/* ========================================
   TAKOUBAKOY LAB — JavaScript principal
   Digital Independence
   Version : 1.1.0
======================================== */

(() => {
  "use strict";

  /**
   * Point d'entrée des fonctionnalités globales.
   */
  const init = () => {
    // Activation du marqueur JavaScript.
    document.documentElement.classList.add("js");

    // Vérification de la disponibilité du diagnostic navigateur.
    if (typeof window.TAKOUBAKOY?.getBrowserInfo === "function") {
      document.documentElement.classList.add("browser-info-ready");
    }
  };

  // Initialisation après le chargement du document.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
