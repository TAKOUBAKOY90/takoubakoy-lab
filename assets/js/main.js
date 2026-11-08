
/* ========================================
   TAKOUBAKOY LAB — JavaScript principal
   Digital Independence
   Version : 1.0.0
======================================== */

(() => {
  "use strict";

  /**
   * Point d'entrée des fonctionnalités globales.
   * Les modules indépendants seront intégrés ici.
   */
  const init = () => {
    // Activation du marqueur JavaScript.
    document.documentElement.classList.add("js");
  };

  // Initialisation après le chargement du document.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
