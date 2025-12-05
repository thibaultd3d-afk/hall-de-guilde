// === Données ===

let characters = [];
let campaigns = [];
let loreSections = [];
let currentWorldMapDataUrl = "";

// === Utilitaires ===

function safeNumber(n, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

// === Rendu des personnages ===

function renderCharacters(filterKey = "all") {
  const container = document.getElementById("characters-grid");
  const empty = document.getElementById("characters-empty");
  if (!container) return;

  let list = [...characters];

  if (filterKey === "actif") {
    list = list.filter((c) => c.status === "actif");
  } else if (filterKey === "legende") {
    list = list.filter((c) => c.status === "legende" || c.status === "légende");
  } else if (filterKey === "retraite") {
    list = list.filter((c) => c.status === "retraite");
  }

  container.innerHTML = "";

  if (!list.length) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  list.forEach((ch) => {
    const card = document.createElement("article");
    card.className = "character-card";

    const xpRatio = safeNumber(ch.xpRatio, 0);

    let statusLabel = "Actif";
    if (ch.status === "legende" || ch.status === "légende") statusLabel = "Légende";
    else if (ch.status === "retraite") statusLabel = "Retraité";
    else if (ch.status && ch.status !== "actif") statusLabel = ch.status;

    let tierClass = "";
    const level = safeNumber(ch.level, 1);
    if (level >= 16) {
      tierClass = "portrait-tier-mythic";
    } else if (level >= 12) {
      tierClass = "portrait-tier-legend";
    } else if (level >= 8) {
      tierClass = "portrait-tier-silver";
    } else if (level >= 4) {
      tierClass = "portrait-tier-bronze";
    } else {
      tierClass = "portrait-tier-common";
    }

    const portraitStyle = ch.portraitUrl ? `background-image: url('${ch.portraitUrl}'); background-size: cover; background-position: center;` : "";

    card.innerHTML = `
      <div class="character-main">
        <div class="character-portrait-wrapper">
          <div class="character-portrait ${tierClass}" style="${portraitStyle}">
            ${ch.portraitUrl ? "" : "🖼️"}
          </div>
        </div>
        <div class="character-info">
          <div class="character-header">
            <div class="character-name">${ch.name || "Sans nom"}</div>
            <div class="character-tag">${statusLabel}</div>
          </div>
          <div class="character-meta">
            <span>⚔️ ${ch.class || "Classe inconnue"}</span>
            <span> • </span>
            <span>Niveau ${level}</span>
          </div>
          <div class="character-meta">
            <span>👤 Joueur : <strong>${ch.player || "?"}</strong></span>
          </div>
          <div class="character-campaign">
            Dernière campagne : <strong>${ch.lastCampaign || "—"}</strong>
          </div>
          <div class="xp-bar-wrapper">
            <div class="xp-label">Progression vers le prochain niveau</div>
            <div class="xp-bar">
              <div class="xp-fill" style="--xp-scale: ${xpRatio}"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="character-extra">
        <div class="character-lore-title">Histoire du personnage</div>
        <div class="character-lore">
          ${
            ch.lore && String(ch.lore).trim()
              ? ch.lore
              : "<em>Aucune histoire renseignée pour ce personnage.</em>"
          }
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("character-card-expanded");
    });

    container.appendChild(card);
  });
}

// === Rendu des campagnes ===

function renderCampaigns(statusKey = "en-cours") {
  const container = document.getElementById("campaigns-grid");
  const empty = document.getElementById("campaigns-empty");
  if (!container) return;

  let list = [...campaigns];

  if (statusKey === "en-cours") {
    list = list.filter((c) => c.status === "en-cours");
  } else if (statusKey === "en-attente") {
    list = list.filter((c) => c.status === "en-attente");
  } else if (statusKey === "finie") {
    list = list.filter((c) => c.status === "finie");
  }

  container.innerHTML = "";

  if (!list.length) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  list.forEach((camp) => {
    const card = document.createElement("article");
    card.className = "campaign-card";

    const level = safeNumber(camp.level, 1);
    const progress = safeNumber(camp.progress, 0);

    card.innerHTML = `
      <div class="campaign-main">
        <div class="campaign-title">${camp.title || "Campagne sans titre"}</div>
        <div class="campaign-meta">
          <span>🎯 Niveau recommandé : ${level}</span>
          ${
            camp.status === "en-cours"
              ? '<span> • En cours</span>'
              : camp.status === "en-attente"
              ? '<span> • À venir</span>'
              : camp.status === "finie"
              ? '<span> • Terminée</span>'
              : ""
          }
        </div>
        <div class="campaign-progress">
          <div class="campaign-progress-label">Progression de la campagne</div>
          <div class="progress-bar">
            <div class="progress-fill" style="--progress-scale: ${progress}"></div>
          </div>
        </div>
        <div class="campaign-summary">
          ${camp.summary || "<em>Pas encore de résumé pour cette campagne.</em>"}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// === Rendu du lore (lecture seule) ===

function renderLoreSections() {
  const tabsContainer = document.getElementById("lore-tabs");
  const panelsContainer = document.getElementById("lore-panels");
  if (!tabsContainer || !panelsContainer) return;

  tabsContainer.innerHTML = "";
  panelsContainer.innerHTML = "";

  if (!loreSections.length) {
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = "Aucune section de lore n’a été définie par le MJ.";
    panelsContainer.appendChild(p);
    return;
  }

  loreSections.forEach((section, index) => {
    const tab = document.createElement("button");
    tab.className = "lore-tab" + (index === 0 ? " lore-tab-active" : "");
    tab.textContent = section.title || "Section sans titre";

    const panel = document.createElement("article");
    panel.className = "lore-panel" + (index === 0 ? " lore-panel-active" : "");

    panel.innerHTML = `
      <h4>${section.title || "Section sans titre"}</h4>
      <p>${section.content || "<em>Pas encore de contenu pour cette section.</em>"}</p>
    `;

    tab.addEventListener("click", () => {
      const allTabs = tabsContainer.querySelectorAll(".lore-tab");
      const allPanels = panelsContainer.querySelectorAll(".lore-panel");
      allTabs.forEach((t) => t.classList.remove("lore-tab-active"));
      allPanels.forEach((p) => p.classList.remove("lore-panel-active"));
      tab.classList.add("lore-tab-active");
      panel.classList.add("lore-panel-active");
    });

    tabsContainer.appendChild(tab);
    panelsContainer.appendChild(panel);
  });
}

// === Chargement des données depuis le JSON exporté ===

async function loadDataFromJson() {
  try {
    const res = await fetch("hall-de-guilde-data.json", { cache: "no-store" });
    if (!res.ok) {
      console.error("Impossible de charger hall-de-guilde-data.json :", res.status);
      renderCharacters("all");
      renderCampaigns("en-cours");
      renderLoreSections();
      return;
    }
    const data = await res.json();

    characters = Array.isArray(data.characters) ? data.characters : [];
    campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
    loreSections = Array.isArray(data.loreSections) ? data.loreSections : [];
    currentWorldMapDataUrl = typeof data.worldMapDataUrl === "string" ? data.worldMapDataUrl : "";

    if (currentWorldMapDataUrl) {
      const mapImg = document.getElementById("world-map-image");
      if (mapImg) {
        mapImg.src = currentWorldMapDataUrl;
      }
    }

    renderCharacters("all");
    renderCampaigns("en-cours");
    renderLoreSections();
  } catch (e) {
    console.error("Erreur lors du chargement des données JSON :", e);
    renderCharacters("all");
    renderCampaigns("en-cours");
    renderLoreSections();
  }
}

// === Navigation sections ===

function setupSectionNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-section");
      if (!targetId) return;

      navButtons.forEach((b) => b.classList.remove("nav-btn-active"));
      btn.classList.add("nav-btn-active");

      sections.forEach((sec) => {
        if (sec.id === targetId) {
          sec.classList.add("section-active");
        } else {
          sec.classList.remove("section-active");
        }
      });
    });
  });
}

// === Filtres personnages & campagnes ===

function setupFilters() {
  const chipButtons = document.querySelectorAll(".chip");
  chipButtons.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filterKey = chip.getAttribute("data-filter") || "all";
      chipButtons.forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      renderCharacters(filterKey);
    });
  });

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.getAttribute("data-campaign-tab") || "en-cours";
      tabs.forEach((t) => t.classList.remove("tab-active"));
      tab.classList.add("tab-active");
      renderCampaigns(key);
    });
  });
}

// === Init ===

document.addEventListener("DOMContentLoaded", () => {
  setupSectionNavigation();
  setupFilters();
  loadDataFromJson();
});
