
/* ========================================
   TAKOUBAKOY LAB — System Diagnostic
   Module : Diagnostic environnement
   Version : 1.7.0
======================================== */

(() => {
  "use strict";

  const initSystemDiagnostic = () => {
    const getInfo = window.TAKOUBAKOY?.getBrowserInfo;

    if (typeof getInfo !== "function") return;

    const HISTORY_KEY = "takoubakoy_speed_history";
    const LATENCY_HISTORY_KEY = "takoubakoy_latency_history";
    const MAX_HISTORY = 3;

    // Lecture sécurisée de l'historique des latences.
    const readLatencyHistory = () => {
      try {
        const stored = localStorage.getItem(LATENCY_HISTORY_KEY);
        const history = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(history)) return [];

        return history
          .filter(item =>
            Number.isFinite(item.latency) &&
            typeof item.date === "string"
          )
          .slice(0, MAX_HISTORY);
      } catch (error) {
        return [];
      }
    };

    // Affichage des graphiques Canvas.
    const drawChart = (canvasId, values, unit, color) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const width = canvas.width;
      const height = canvas.height;
      const padding = 42;
      const rightPadding = 100;

      context.clearRect(0, 0, width, height);
      context.font = "13px Arial";
      context.fillStyle = "#a3afc2";
      context.strokeStyle = "#344054";
      context.lineWidth = 1;

      // Axes du graphique.
      context.beginPath();
      context.moveTo(padding, 15);
      context.lineTo(padding, height - padding);
      context.lineTo(width - rightPadding, height - padding);
      context.stroke();

      if (values.length === 0) {
        context.fillText(
          "Aucune mesure disponible",
          padding + 10,
          height / 2
        );
        return;
      }

      const maximum = Math.max(
        ...values.map(item => item.value),
        1
      );

      const minimum = Math.min(
        ...values.map(item => item.value),
        0
      );

      const range = Math.max(
        maximum - minimum,
        maximum * 0.15,
        1
      );

      const chartWidth = width - padding - rightPadding;

      const points = values.map((item, index) => {
        const x = values.length === 1
          ? padding + chartWidth / 2
          : padding + index * chartWidth / (values.length - 1);

        const y = height - padding -
          ((item.value - minimum) / range) *
          (height - padding - 35);

        return {
          x,
          y,
          value: item.value
        };
      });

      // Tracé de la courbe.
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.beginPath();

      points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });

      context.stroke();

      // Points et libellés.
      points.forEach((point, index) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#f2f5fa";

        const label = `${point.value.toFixed(1)} ${unit}`;
        const labelWidth = context.measureText(label).width;

        const labelX = point.x + labelWidth + 14 > width - 8
          ? point.x - labelWidth - 8
          : point.x + 7;

        context.fillText(
          label,
          Math.max(4, labelX),
          Math.max(point.y - 12, 15)
        );

        context.fillStyle = "#a3afc2";
        context.fillText(
          `Test ${index + 1}`,
          point.x - 20,
          height - 12
        );
      });
    };

    // Mise à jour du tableau de bord réseau.
    const renderNetworkDashboard = () => {
      const speeds = readSpeedHistory();
      const latencies = readLatencyHistory();

      if (speeds.length > 0) {
        const values = speeds.map(item => item.speed);

        const average = values.reduce(
          (sum, value) => sum + value,
          0
        ) / values.length;

        setValue(
          "diag-speed-latest",
          `${values[0].toFixed(2)} Mbit/s`
        );

        setValue(
          "diag-speed-average",
          `${average.toFixed(2)} Mbit/s`
        );

        setValue(
          "diag-speed-best",
          `${Math.max(...values).toFixed(2)} Mbit/s`
        );
      } else {
        setValue("diag-speed-latest", "Non disponible");
        setValue("diag-speed-average", "Non disponible");
        setValue("diag-speed-best", "Non disponible");
      }

      drawChart(
        "diag-speed-chart",
        speeds.slice().reverse().map(item => ({
          value: item.speed
        })),
        "Mbit/s",
        "#2788f5"
      );

      drawChart(
        "diag-latency-chart",
        latencies.slice().reverse().map(item => ({
          value: item.latency
        })),
        "ms",
        "#ed3548"
      );
    };

    // Enregistrement de l'historique des latences.
    const saveLatencyHistory = latency => {
      try {
        const history = readLatencyHistory();

        history.unshift({
          latency,
          date: new Date().toISOString()
        });

        localStorage.setItem(
          LATENCY_HISTORY_KEY,
          JSON.stringify(history.slice(0, MAX_HISTORY))
        );
      } catch (error) {
        // Le stockage local peut être indisponible.
      }

      renderNetworkDashboard();
    };

    // Mise à jour sécurisée d'un élément HTML.
    const setValue = (id, value) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = String(value);
      }
    };

    // Identification du navigateur.
    const getBrowserName = userAgent => {
      if (/Edg\//.test(userAgent)) return "Microsoft Edge";
      if (/Firefox\//.test(userAgent)) return "Mozilla Firefox";
      if (/Chrome\//.test(userAgent)) return "Google Chrome";
      if (/Safari\//.test(userAgent)) return "Apple Safari";

      return "Navigateur non identifié";
    };

    // Actualisation des informations système.
    const updateDiagnostic = () => {
      const info = getInfo();

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

      const network = info.network;

      setValue(
        "diag-network-type",
        network?.type || "Non disponible"
      );

      setValue(
        "diag-network-profile",
        network?.effectiveType || "Non disponible"
      );

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

      setValue(
        "diag-gpu-vendor",
        graphics?.vendor || "Non disponible"
      );

      setValue(
        "diag-gpu-renderer",
        graphics?.renderer || "Non disponible"
      );

      setValue(
        "diag-last-update",
        `Dernière actualisation : ${new Date().toLocaleString("fr-FR")}`
      );

      document.documentElement.classList.add(
        "system-diagnostic-ready"
      );
    };

    // Évaluation indicative du débit.
    const getSpeedQuality = speed => {
      if (speed < 5) {
        return "Connexion limitée";
      }

      if (speed < 25) {
        return "Connexion modérée";
      }

      return "Connexion rapide";
    };

    // Lecture sécurisée de l'historique des débits.
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

    // Affichage de l'historique des tests de débit.
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

    // Enregistrement d'un résultat de débit.
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
        renderNetworkDashboard();
      } catch (error) {
        const status = document.getElementById(
          "diag-speed-status"
        );

        if (status) {
          status.textContent +=
            " L'historique n'a pas pu être sauvegardé dans ce navigateur.";
        }
      }
    };

    // Test de latence HTTP.
    const runHttpLatencyTest = async () => {
      const resultElement = document.getElementById(
        "diag-http-latency"
      );

      const statusElement = document.getElementById(
        "diag-http-status"
      );

      const testButton = document.getElementById(
        "diag-http-test"
      );

      if (!resultElement || !statusElement || !testButton) return;

      if (!navigator.onLine) {
        resultElement.textContent = "Indisponible";
        statusElement.textContent =
          "Aucune connexion Internet détectée.";
        return;
      }

      testButton.disabled = true;
      resultElement.textContent = "Mesure en cours...";
      statusElement.textContent =
        "Exécution de trois requêtes HTTP.";

      const samples = [];

      const target = new URL(
        "../assets/images/favicon.svg",
        document.baseURI
      );

      try {
        for (let i = 0; i < 3; i += 1) {
          target.searchParams.set(
            "diagnostic",
            `${Date.now()}-${i}`
          );

          const start = performance.now();

          const response = await fetch(target.href, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin"
          });

          if (!response.ok) {
            throw new Error(
              `Réponse HTTP ${response.status}`
            );
          }

          await response.body?.cancel();

          samples.push(performance.now() - start);
        }

        const average = samples.reduce(
          (total, value) => total + value,
          0
        ) / samples.length;

        resultElement.textContent =
          `${Math.round(average)} ms`;

        saveLatencyHistory(average);

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
      const consent = document.getElementById(
        "diag-speed-consent"
      );

      const button = document.getElementById(
        "diag-speed-test"
      );

      const result = document.getElementById(
        "diag-speed-result"
      );

      const status = document.getElementById(
        "diag-speed-status"
      );

      const quality = document.getElementById(
        "diag-speed-quality"
      );

      if (!consent || !button || !result || !status) return;

      if (!consent.checked) {
        status.textContent =
          "Autorisation nécessaire avant le test.";
        return;
      }

      if (!navigator.onLine) {
        result.textContent = "Indisponible";

        status.textContent =
          "Aucune connexion Internet détectée.";
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

      status.textContent =
        "Téléchargement du fichier de test...";

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
          throw new Error(
            `Réponse HTTP ${response.status}`
          );
        }

        if (
          new URL(response.url).origin !==
          window.location.origin
        ) {
          throw new Error(
            "Origine du téléchargement non autorisée."
          );
        }

        if (!response.body) {
          throw new Error(
            "Flux de téléchargement indisponible."
          );
        }

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          transferred += value.byteLength;

          if (transferred > maxBytes) {
            await reader.cancel();

            throw new Error(
              "Limite de téléchargement dépassée."
            );
          }
        }

        const duration =
          (performance.now() - start) / 1000;

        if (transferred === 0 || duration <= 0) {
          throw new Error("Mesure invalide.");
        }

        const megabitsPerSecond =
          (transferred * 8) / duration / 1000000;

        result.textContent =
          `${megabitsPerSecond.toFixed(2)} Mbit/s`;

        status.textContent =
          `Test terminé : ${(transferred / 1000000).toFixed(3)} Mo transférés en ${duration.toFixed(2)} secondes.`;

        if (quality) {
          quality.textContent =
            getSpeedQuality(megabitsPerSecond);
        }

        saveSpeedHistory(
          megabitsPerSecond,
          transferred
        );
      } catch (error) {
        result.textContent = "Échec du test";

        if (quality) {
          quality.textContent =
            "Évaluation indisponible.";
        }

        status.textContent =
          "Le téléchargement n'a pas pu être mesuré. Vérifiez la connexion et réessayez.";
      } finally {
        button.disabled = !consent.checked;
        consent.disabled = false;
      }
    };
    // Exportation locale du rapport système.
    const exportButton = document.getElementById("diag-export");

    if (exportButton) {
      exportButton.addEventListener("click", () => {
        const info = getInfo();
        const network = info.network || {};
        const graphics = info.graphics || {};
        const speedHistory = readSpeedHistory();
        const latencyHistory = readLatencyHistory();

        const formatValue = value => {
          if (value === undefined || value === null || value === "") {
            return "Non disponible";
          }

          return String(value);
        };

        const speedLines = speedHistory.length
          ? speedHistory.map((item, index) =>
              `${index + 1}. ${item.speed.toFixed(2)} Mbit/s — ` +
              `${(item.bytes / 1000000).toFixed(3)} Mo — ` +
              `${new Date(item.date).toLocaleString("fr-FR")}`
            ).join("\n")
          : "Aucun test enregistré.";

        const latencyLines = latencyHistory.length
          ? latencyHistory.map((item, index) =>
              `${index + 1}. ${item.latency.toFixed(1)} ms — ` +
              `${new Date(item.date).toLocaleString("fr-FR")}`
            ).join("\n")
          : "Aucun test enregistré.";

        const report = [
          "TAKOUBAKOY LAB",
          "RAPPORT DE DIAGNOSTIC SYSTÈME",
          "========================================",
          "",
          `Date du rapport : ${new Date().toLocaleString("fr-FR")}`,
          "",
          "1. NAVIGATEUR",
          `Navigateur : ${getBrowserName(info.userAgent)}`,
          `User-Agent : ${formatValue(info.userAgent)}`,
          `Plateforme : ${formatValue(info.platform)}`,
          `Langue : ${formatValue(info.language)}`,
          "",
          "2. PROCESSEUR ET MÉMOIRE",
          `Processeurs logiques : ${formatValue(info.cores)}`,
          `Mémoire exposée : ${formatValue(info.memory)}`,
          "",
          "3. AFFICHAGE",
          `Résolution : ${info.screen.width} × ${info.screen.height} pixels`,
          `Densité de pixels : ${info.screen.pixelRatio}x`,
          "",
          "4. CONNEXION RÉSEAU",
          `État : ${info.online ? "Connecté" : "Hors ligne"}`,
          `Type : ${formatValue(network.type)}`,
          `Profil : ${formatValue(network.effectiveType)}`,
          `Débit descendant estimé : ${formatValue(network.downlink)}`,
          `Latence estimée : ${formatValue(network.rtt)}`,
          `Économie de données : ${formatValue(network.saveData)}`,
          "",
          "5. GRAPHIQUE ET WEBGL",
          `WebGL : ${graphics.available ? "Disponible" : "Non disponible"}`,
          `Version : ${formatValue(graphics.version)}`,
          `Fabricant : ${formatValue(graphics.vendor)}`,
          `Processeur graphique : ${formatValue(graphics.renderer)}`,
          "",
          "6. HISTORIQUE DES TESTS DE DÉBIT",
          speedLines,
          "",
          "7. HISTORIQUE DES TESTS DE LATENCE HTTP",
          latencyLines,
          "",
          "========================================",
          "Rapport généré localement par TAKOUBAKOY LAB.",
          "Les informations n'ont pas été envoyées à un serveur."
        ].join("\n");

        const blob = new Blob(
          [report],
          { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "takoubakoy-lab-diagnostic.txt";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      });
    }
    // Actualisation manuelle du diagnostic.
    const refreshButton = document.getElementById(
      "diag-refresh"
    );

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        updateDiagnostic
      );
    }

    // Activation du test HTTP.
    const httpTestButton = document.getElementById(
      "diag-http-test"
    );

    if (httpTestButton) {
      httpTestButton.addEventListener(
        "click",
        runHttpLatencyTest
      );
    }

    // Gestion du consentement pour le test de débit.
    const speedConsent = document.getElementById(
      "diag-speed-consent"
    );

    const speedButton = document.getElementById(
      "diag-speed-test"
    );

    if (speedConsent && speedButton) {
      speedButton.disabled = !speedConsent.checked;

      speedConsent.addEventListener("change", () => {
        speedButton.disabled = !speedConsent.checked;
      });

      speedButton.addEventListener(
        "click",
        runSpeedTest
      );
    }

    // Effacement des historiques locaux.
    const clearHistoryButton = document.getElementById(
      "diag-speed-history-clear"
    );

    if (clearHistoryButton) {
      clearHistoryButton.addEventListener("click", () => {
        try {
          localStorage.removeItem(HISTORY_KEY);
          localStorage.removeItem(LATENCY_HISTORY_KEY);
        } catch (error) {
          // Le stockage local peut être désactivé.
        }

        renderSpeedHistory();
        renderNetworkDashboard();
      });
    }

    // Initialisation du diagnostic.
    updateDiagnostic();
    renderSpeedHistory();
    renderNetworkDashboard();
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
