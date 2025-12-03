// Version simplifiée sans localStorage pour éviter tout bug de navigateur

// === Données d’exemple de base ===

let characters = [
  {
    id: 1,
    name: "Eldran Vael",
    class: "Mage de guerre arcanique",
    level: 7,
    xpRatio: 0.65,
    status: "actif",
    lastCampaign: "Les Cendres de l’Empire de Verre",
    player: "Alice"
  },
  {
    id: 2,
    name: "Sœur Lyra",
    class: "Clerc du Sanctuaire des Lunes",
    level: 5,
    xpRatio: 0.3,
    status: "actif",
    lastCampaign: "La Tour des Échos",
    player: "Baptiste"
  }
];

const campaigns = [
  {
    id: 1,
    title: "Les Cendres de l’Empire de Verre",
    status: "en-cours",
    type: "Longue",
    level: 5,
    progressRatio: 0.4,
    players: ["Eldran Vael", "Sœur Lyra"],
    description: "Une campagne épique au cœur des ruines d’un empire brisé, où les reliques de verre chantent encore le nom des anciens rois.",
    summary: "Le groupe explore actuellement les faubourgs de la capitale de verre, à la recherche du Chantre disparu."
  },
  {
    id: 2,
    title: "Le Bal des Masques Silencieux",
    status: "en-attente",
    type: "One-shot",
    level: 3,
    progressRatio: 0,
    players: [],
    description: "Une soirée mondaine où personne ne parle… et où les poignards parlent à la place.",
    summary: "En préparation : intrigue de cour, complots et identités secrètes."
  }
];

let loreSections = [
  {
    id: 1,
    key: "monde",
    title: "Histoire du monde",
    content: "Résume ici la légende de la création, les grands âges, les événements fondateurs : chute d\'empire, arrivée des dieux, grande fracture magique, etc."
  },
  {
    id: 2,
    key: "regions",
    title: "Régions & lieux importants",
    content: "Décris les continents, royaumes, cités, zones dangereuses et donjons légendaires. Une phrase par région pour aller à l\'essentiel."
  },
  {
    id: 3,
    key: "factions",
    title: "Factions & peuples",
    content: "Note les ordres de mages, guildes marchandes, cultes secrets, tribus et empires : objectifs, symboles, alliances et conflits."
  },
  {
    id: 4,
    key: "chronologie",
    title: "Chronologie globale",
    content: "Liste quelques grandes dates : guerres, découvertes, catastrophes, changements d\'ère. Utilise-les comme toile de fond pour tes campagnes."
  }
];




const timelineEvents = [
  {
    date: "Année 1208 – Printemps",
    title: "Première apparition connue de l’Empire de Verre",
    desc: "Les héros découvrent les ruines cristallines dans les Terres Brisées."
  }
];

let editingCharacterId = null;
let currentPortraitDataUrl = "";

// === Rendu des personnages ===

const characterGrid = document.getElementById("character-grid");

function renderCharacters(filter = "all") {
  if (!characterGrid) return;
  characterGrid.innerHTML = "";

  const filtered = characters.filter((ch) => {
    if (filter === "all") return true;
    return ch.status === filter;
  });

  filtered.forEach((ch) => {
    const card = document.createElement("article");
    card.className = "character-card";

    const statusLabel =
      ch.status === "actif"
        ? "Actif"
        : ch.status === "legende"
        ? "Légende"
        : "Retraité";

    const portraitStyle = ch.portraitUrl
      ? `background-image: url('${ch.portraitUrl}');`
      : "";
    const portraitClass = ch.portraitUrl ? "character-portrait" : "character-portrait placeholder";

    card.innerHTML = `
      <div class="character-main">
        <div class="character-portrait-wrapper">
          <div class="${portraitClass}" style="${portraitStyle}">
            ${ch.portraitUrl ? "" : "🖼️"}
          </div>
        </div>
        <div class="character-info">
          <div class="character-header">
            <div class="character-name">${ch.name}</div>
            <div class="character-tag">${statusLabel}</div>
          </div>
          <div class="character-meta">
            <span>⚔️ ${ch.class}</span>
            <span> • </span>
            <span>Niveau ${ch.level}</span>
          </div>
          <div class="character-meta">
            <span>👤 Joueur : <strong>${ch.player}</strong></span>
          </div>
          <div class="character-campaign">
            Dernière campagne : <strong>${ch.lastCampaign || "—"}</strong>
          </div>
          <div class="xp-bar-wrapper">
            <div class="xp-label">Progression vers le prochain niveau</div>
            <div class="xp-bar">
              <div class="xp-fill" style="--xp-scale: ${ch.xpRatio || 0};"></div>
            </div>
          </div>
          <div class="character-actions">
            <button class="small-btn edit-btn" data-id="${ch.id}">Modifier</button>
            <button class="small-btn delete-btn" data-id="${ch.id}">Supprimer</button>
          </div>
        </div>
      </div>
    `;

    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditCharacter(ch.id);
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCharacter(ch.id);
      });
    }

    characterGrid.appendChild(card);
  });
}

// === Rendu des campagnes ===

const campaignGrid = document.getElementById("campaign-grid");

function renderCampaigns(tab = "en-cours") {
  if (!campaignGrid) return;
  campaignGrid.innerHTML = "";

  const filtered = campaigns.filter((c) => c.status === tab);

  filtered.forEach((c) => {
    const card = document.createElement("article");
    card.className = "campaign-card";

    const statusText =
      c.status === "en-cours"
        ? "Campagne en cours"
        : c.status === "en-attente"
        ? "Campagne en attente"
        : "Campagne terminée";

    const progress = typeof c.progressRatio === "number" ? c.progressRatio : 0;

    card.innerHTML = `
      <div class="campaign-title">${c.title}</div>
      <div class="campaign-meta">
        Type : <strong>${c.type}</strong><br>
        Niveau recommandé : <strong>${c.level || "—"}</strong><br>
        Joueurs : ${
          c.players && c.players.length > 0
            ? c.players.join(", ")
            : "<em>Aucun pour l’instant</em>"
        }
      </div>
      <div class="campaign-description">
        ${c.description}
      </div>
      <div class="campaign-summary">
        <strong>Où on en est :</strong> ${c.summary || "<em>Pas encore renseigné.</em>"}
      </div>
      <div class="campaign-progress-wrapper">
        <div class="campaign-progress-label">Progression de la campagne</div>
        <div class="xp-bar">
          <div class="xp-fill" style="--xp-scale: ${progress};"></div>
        </div>
      </div>
      <div class="character-actions">
        <button class="small-btn edit-campaign-btn" data-id="${c.id}">Modifier</button>
        <button class="small-btn delete-btn delete-campaign-btn" data-id="${c.id}">Supprimer</button>
      </div>
      <div class="campaign-status">${statusText}</div>
    `;

    const editBtn = card.querySelector(".edit-campaign-btn");
    const deleteBtn = card.querySelector(".delete-campaign-btn");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditCampaign(c.id);
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCampaign(c.id);
      });
    }

    campaignGrid.appendChild(card);
  });
}

// === Rendu de la chronologie ===

const timelineContainer = document.getElementById("timeline");

function renderTimeline() {
  if (!timelineContainer) return;
  timelineContainer.innerHTML = "";

  timelineEvents.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "timeline-event";

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-date">${ev.date}</div>
      <div class="timeline-title">${ev.title}</div>
      <div class="timeline-desc">${ev.desc}</div>
    `;

    timelineContainer.appendChild(item);
  });
}

// === Navigation entre sections (nav du haut) ===

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-section");

    navButtons.forEach((b) => b.classList.remove("nav-btn-active"));
    btn.classList.add("nav-btn-active");

    sections.forEach((sec) => {
      if (sec.id === target) {
        sec.classList.add("section-active");
      } else {
        sec.classList.remove("section-active");
      }
    });
  });
});

// === Bouton "Voir les campagnes à venir" du bandeau ===

document.querySelectorAll("[data-section-jump]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-section-jump");
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    navButtons.forEach((b) => {
      if (b.getAttribute("data-section") === targetId) {
        b.classList.add("nav-btn-active");
      } else {
        b.classList.remove("nav-btn-active");
      }
    });

    sections.forEach((sec) => {
      if (sec.id === targetId) {
        sec.classList.add("section-active");
      } else {
        sec.classList.remove("section-active");
      }
    });

    if (targetId === "section-campagnes") {
      const waitingTab = document.querySelector('[data-campaign-tab="en-attente"]');
      if (waitingTab) {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
        waitingTab.classList.add("tab-active");
        renderCampaigns("en-attente");
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


// === Panneau de création / édition de campagne ===

const openCampaignPanelBtn = document.getElementById("open-campaign-panel");
const campaignBackdrop = document.getElementById("campaign-panel-backdrop");
const closeCampaignPanelBtn = document.getElementById("close-campaign-panel");
const cancelCampaignBtn = document.getElementById("cancel-campaign");
const campaignForm = document.getElementById("campaign-form");
const campaignMessage = document.getElementById("campaign-message");

function openCampaignPanel() {
  editingCampaignId = null;
  if (!campaignBackdrop) return;
  campaignBackdrop.classList.remove("hidden");
  if (campaignMessage) campaignMessage.textContent = "";

  if (campaignForm) {
    campaignForm.reset();
  }
  const statusSelect = document.getElementById("camp-status");
  const levelInput = document.getElementById("camp-level");
  const progressInput = document.getElementById("camp-progress");
  if (statusSelect) statusSelect.value = "en-cours";
  if (levelInput) levelInput.value = 1;
  if (progressInput) progressInput.value = 0;
}

function closeCampaignPanel() {
  if (!campaignBackdrop) return;
  campaignBackdrop.classList.add("hidden");
  if (campaignForm) campaignForm.reset();
  if (campaignMessage) campaignMessage.textContent = "";
  editingCampaignId = null;
}

if (openCampaignPanelBtn) {
  openCampaignPanelBtn.addEventListener("click", openCampaignPanel);
}
if (closeCampaignPanelBtn) {
  closeCampaignPanelBtn.addEventListener("click", closeCampaignPanel);
}
if (cancelCampaignBtn) {
  cancelCampaignBtn.addEventListener("click", closeCampaignPanel);
}
if (campaignBackdrop) {
  campaignBackdrop.addEventListener("click", (event) => {
    if (event.target === campaignBackdrop) {
      closeCampaignPanel();
    }
  });
}

// Soumission du formulaire de campagne
if (campaignForm) {
  campaignForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("camp-title").value.trim();
    const type = document.getElementById("camp-type").value;
    const status = document.getElementById("camp-status").value;
    const levelRaw = document.getElementById("camp-level").value;
    const progressRaw = document.getElementById("camp-progress").value;
    const summary = document.getElementById("camp-summary").value.trim();
    const playersRaw = document.getElementById("camp-players").value.trim();

    if (!title) {
      if (campaignMessage) campaignMessage.textContent = "Merci d'indiquer au moins un titre.";
      return;
    }

    let level = parseInt(levelRaw, 10);
    if (Number.isNaN(level) || level < 1) level = 1;

    let progressPercent = parseInt(progressRaw, 10);
    if (Number.isNaN(progressPercent) || progressPercent < 0) progressPercent = 0;
    if (progressPercent > 100) progressPercent = 100;
    const progressRatio = progressPercent / 100;

    let playersList = [];
    if (playersRaw) {
      playersList = playersRaw.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
    }

    if (editingCampaignId !== null) {
      const idx = campaigns.findIndex((c) => c.id === editingCampaignId);
      if (idx !== -1) {
        campaigns[idx] = {
          ...campaigns[idx],
          title,
          type,
          status,
          level,
          progressRatio,
          summary,
          players: playersList
        };
      }
      if (campaignMessage) campaignMessage.textContent = "✅ Campagne mise à jour.";
    } else {
      const maxId = campaigns.reduce((max, c) => Math.max(max, c.id || 0), 0);
      const newId = maxId + 1;
      const newCamp = {
        id: newId,
        title,
        type,
        status,
        level,
        progressRatio,
        summary,
        players: playersList,
        description: summary || "Campagne en cours de préparation."
      };
      campaigns.push(newCamp);
      if (campaignMessage) campaignMessage.textContent = "✅ Campagne créée.";
    }

    const activeTab = document.querySelector(".tab.tab-active");
    const currentTab = activeTab ? activeTab.getAttribute("data-campaign-tab") : "en-cours";
    renderCampaigns(currentTab);

    setTimeout(() => {
      closeCampaignPanel();
    }, 700);
  });
}


// === Filtres des personnages ===

const chips = document.querySelectorAll(".chip");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("chip-active"));
    chip.classList.add("chip-active");

    const filter = chip.getAttribute("data-filter");
    renderCharacters(filter);
  });
});

// === Onglets campagnes ===

const campaignTabs = document.querySelectorAll(".tabs .tab");

campaignTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    campaignTabs.forEach((t) => t.classList.remove("tab-active"));
    tab.classList.add("tab-active");

    const tabKey = tab.getAttribute("data-campaign-tab");
    renderCampaigns(tabKey);
  });
});

// === Panneau de création de personnage ===

const openCreatePanelBtn = document.getElementById("open-create-panel");
const closeCreatePanelBtn = document.getElementById("close-create-panel");
const createBackdrop = document.getElementById("create-panel-backdrop");
const cancelCreateBtn = document.getElementById("cancel-create");
const createForm = document.getElementById("create-character-form");
const createMessage = document.getElementById("create-message");

function openCreatePanel() {
  if (!createBackdrop) return;
  createBackdrop.classList.remove("hidden");
  if (createMessage) createMessage.textContent = "";
}

function closeCreatePanel() {
  editingCharacterId = null;
  currentPortraitDataUrl = "";
  resetPortraitPreview();
  if (!createBackdrop) return;
  createBackdrop.classList.add("hidden");
  if (createForm) createForm.reset();
  const levelInput = document.getElementById("char-level");
  const xpInput = document.getElementById("char-xp");
  const statusSelect = document.getElementById("char-status");
  if (levelInput) levelInput.value = 1;
  if (xpInput) xpInput.value = 0;
  if (statusSelect) statusSelect.value = "actif";
  if (createMessage) createMessage.textContent = "";
}

if (openCreatePanelBtn) {
  openCreatePanelBtn.addEventListener("click", openCreatePanel);
}
if (closeCreatePanelBtn) {
  closeCreatePanelBtn.addEventListener("click", closeCreatePanel);
}
if (cancelCreateBtn) {
  cancelCreateBtn.addEventListener("click", closeCreatePanel);
}

if (createBackdrop) {
  createBackdrop.addEventListener("click", (event) => {
    if (event.target === createBackdrop) {
      closeCreatePanel();
    }
  });
}


// === Gestion du portrait (drag & drop & sélection de fichier) ===

const portraitDropzone = document.getElementById("portrait-dropzone");
const portraitFileInput = document.getElementById("char-portrait-file");
const portraitPreviewImg = document.getElementById("portrait-preview-img");
const portraitInstructions = document.getElementById("portrait-instructions");

function updatePortraitPreview(dataUrl) {
  currentPortraitDataUrl = dataUrl || "";
  if (!portraitPreviewImg || !portraitInstructions) return;

  if (dataUrl) {
    portraitPreviewImg.src = dataUrl;
    portraitPreviewImg.style.display = "block";
    portraitInstructions.style.display = "none";
  } else {
    portraitPreviewImg.src = "";
    portraitPreviewImg.style.display = "none";
    portraitInstructions.style.display = "inline";
  }
}

function resetPortraitPreview() {
  updatePortraitPreview("");
}

function handlePortraitFiles(files) {
  const file = files && files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    if (createMessage) createMessage.textContent = "Le fichier doit être une image.";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    updatePortraitPreview(dataUrl);
  };
  reader.readAsDataURL(file);
}

if (portraitDropzone) {
  portraitDropzone.addEventListener("click", (e) => {
    const input = document.getElementById("char-portrait-file");
    if (input) input.click();
  });

  portraitDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    portraitDropzone.classList.add("dragover");
  });

  portraitDropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    portraitDropzone.classList.remove("dragover");
  });

  portraitDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    portraitDropzone.classList.remove("dragover");
    if (e.dataTransfer && e.dataTransfer.files) {
      handlePortraitFiles(e.dataTransfer.files);
    }
  });
}

if (portraitFileInput) {
  portraitFileInput.addEventListener("change", (e) => {
    handlePortraitFiles(e.target.files);
  });
}


// Soumission du formulaire : création / édition de personnage

if (createForm) {
  createForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("char-name").value.trim();
    const player = document.getElementById("char-player").value.trim();
    const charClass = document.getElementById("char-class").value.trim();
    const levelRaw = document.getElementById("char-level").value;
    const status = document.getElementById("char-status").value;
    const lastCampaign = document.getElementById("char-last-campaign").value.trim();
    const xpRaw = document.getElementById("char-xp").value;

    if (!name || !player || !charClass) {
      if (createMessage) createMessage.textContent = "Merci de remplir au moins le nom, le joueur et la classe.";
      return;
    }

    let level = parseInt(levelRaw, 10);
    if (Number.isNaN(level) || level < 1) level = 1;
    let xpPercent = parseInt(xpRaw, 10);
    if (Number.isNaN(xpPercent) || xpPercent < 0) xpPercent = 0;
    if (xpPercent > 100) xpPercent = 100;

    const xpRatio = xpPercent / 100;

    if (editingCharacterId !== null) {
      const idx = characters.findIndex((c) => c.id === editingCharacterId);
      if (idx !== -1) {
        characters[idx] = {
          ...characters[idx],
          name,
          class: charClass,
          level,
          xpRatio,
          status,
          lastCampaign,
          player,
          portraitUrl: currentPortraitDataUrl
        };
      }
      if (createMessage) createMessage.textContent = "✅ Personnage mis à jour.";
    } else {
      const maxId = characters.reduce((max, c) => Math.max(max, c.id || 0), 0);
      const newId = maxId + 1;

      const newChar = {
        id: newId,
        name,
        class: charClass,
        level,
        xpRatio,
        status,
        lastCampaign,
        player,
        portraitUrl: currentPortraitDataUrl
      };

      characters.push(newChar);
      if (createMessage) createMessage.textContent = "✅ Personnage ajouté au Hall des Héros.";
    }

    const activeChip = document.querySelector(".chip.chip-active");
    const currentFilter = activeChip ? activeChip.getAttribute("data-filter") : "all";
    renderCharacters(currentFilter);

    setTimeout(() => {
      closeCreatePanel();
    }, 800);
  });
}


function startEditCharacter(id) {
  const char = characters.find((c) => c.id === id);
  if (!char) return;

  editingCharacterId = id;

  if (!createBackdrop) return;
  createBackdrop.classList.remove("hidden");

  if (createMessage) {
    createMessage.textContent = "Mode édition du personnage.";
  }

  const nameInput = document.getElementById("char-name");
  const playerInput = document.getElementById("char-player");
  const classInput = document.getElementById("char-class");
  const levelInput = document.getElementById("char-level");
  const statusSelect = document.getElementById("char-status");
  const lastCampaignInput = document.getElementById("char-last-campaign");
  const xpInput = document.getElementById("char-xp");

  if (nameInput) nameInput.value = char.name || "";
  if (playerInput) playerInput.value = char.player || "";
  if (classInput) classInput.value = char.class || "";
  if (levelInput) levelInput.value = char.level || 1;
  if (statusSelect) statusSelect.value = char.status || "actif";
  if (lastCampaignInput) lastCampaignInput.value = char.lastCampaign || "";
  if (xpInput) xpInput.value = Math.round((char.xpRatio || 0) * 100);
  if (char.portraitUrl) {
    updatePortraitPreview(char.portraitUrl);
  } else {
    resetPortraitPreview();
  }
}

function deleteCharacter(id) {
  const char = characters.find((c) => c.id === id);
  const name = char ? char.name : "ce personnage";

  const ok = window.confirm(`Supprimer définitivement ${name} du Hall des Héros ?`);
  if (!ok) return;

  characters = characters.filter((c) => c.id !== id);

  if (editingCharacterId === id) {
    editingCharacterId = null;
    closeCreatePanel();
  }

  const activeChip = document.querySelector(".chip.chip-active");
  const currentFilter = activeChip ? activeChip.getAttribute("data-filter") : "all";
  renderCharacters(currentFilter);
}


function startEditCampaign(id) {
  const camp = campaigns.find((c) => c.id === id);
  if (!camp) return;

  editingCampaignId = id;

  const backdrop = document.getElementById("campaign-panel-backdrop");
  const msg = document.getElementById("campaign-message");
  if (backdrop) backdrop.classList.remove("hidden");
  if (msg) msg.textContent = "Mode édition de la campagne.";

  const titleInput = document.getElementById("camp-title");
  const typeSelect = document.getElementById("camp-type");
  const statusSelect = document.getElementById("camp-status");
  const levelInput = document.getElementById("camp-level");
  const progressInput = document.getElementById("camp-progress");
  const summaryInput = document.getElementById("camp-summary");
  const playersInput = document.getElementById("camp-players");

  if (titleInput) titleInput.value = camp.title || "";
  if (typeSelect) typeSelect.value = camp.type || "Longue";
  if (statusSelect) statusSelect.value = camp.status || "en-cours";
  if (levelInput) levelInput.value = camp.level || 1;
  if (progressInput) progressInput.value = Math.round((camp.progressRatio || 0) * 100);
  if (summaryInput) summaryInput.value = camp.summary || "";
  if (playersInput) {
    if (Array.isArray(camp.players)) {
      playersInput.value = camp.players.join(", ");
    } else {
      playersInput.value = camp.players || "";
    }
  }
}

function deleteCampaign(id) {
  const camp = campaigns.find((c) => c.id === id);
  const name = camp ? camp.title : "cette campagne";

  const ok = window.confirm(`Supprimer définitivement ${name} ?`);
  if (!ok) return;

  campaigns = campaigns.filter((c) => c.id !== id);

  if (editingCampaignId === id) {
    editingCampaignId = null;
    const backdrop = document.getElementById("campaign-panel-backdrop");
    if (backdrop) backdrop.classList.add("hidden");
  }

  const activeTab = document.querySelector(".tab.tab-active");
  const currentTab = activeTab ? activeTab.getAttribute("data-campaign-tab") : "en-cours";
  renderCampaigns(currentTab);
}




// === Rendu et édition des sections de lore ===

function renderLoreSections() {
  const tabsContainer = document.getElementById("lore-tabs");
  const panelsContainer = document.getElementById("lore-panels");
  if (!tabsContainer || !panelsContainer) return;

  tabsContainer.innerHTML = "";
  panelsContainer.innerHTML = "";

  if (loreSections.length === 0) return;

  loreSections.forEach((section, index) => {
    const tab = document.createElement("button");
    tab.className = "lore-tab" + (index === 0 ? " lore-tab-active" : "");
    tab.setAttribute("data-lore-id", section.id);
    tab.textContent = section.title;

    const panel = document.createElement("article");
    panel.className = "lore-panel" + (index === 0 ? " lore-panel-active" : "");
    panel.setAttribute("data-lore-id", section.id);

    panel.innerHTML = `
      <h4>${section.title}</h4>
      <p>${section.content || "<em>Pas encore de contenu pour cette section.</em>"}</p>
      <div class="lore-panel-actions">
        <button class="small-btn edit-lore-btn" data-id="${section.id}">Modifier</button>
        <button class="small-btn delete-btn delete-lore-btn" data-id="${section.id}">Supprimer</button>
      </div>
    `;

    tab.addEventListener("click", () => {
      const allTabs = document.querySelectorAll(".lore-tab");
      const allPanels = document.querySelectorAll(".lore-panel");
      allTabs.forEach((t) => t.classList.remove("lore-tab-active"));
      allPanels.forEach((p) => p.classList.remove("lore-panel-active"));
      tab.classList.add("lore-tab-active");
      panel.classList.add("lore-panel-active");
    });

    const editBtn = panel.querySelector(".edit-lore-btn");
    const deleteBtn = panel.querySelector(".delete-lore-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditLore(section.id);
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteLore(section.id);
      });
    }

    tabsContainer.appendChild(tab);
    panelsContainer.appendChild(panel);
  });
}

function startEditLore(id) {
  const section = loreSections.find((s) => s.id === id);
  if (!section) return;

  editingLoreId = id;

  const backdrop = document.getElementById("lore-panel-backdrop");
  const msg = document.getElementById("lore-message");
  if (backdrop) backdrop.classList.remove("hidden");
  if (msg) msg.textContent = "Mode édition de la section.";

  const titleInput = document.getElementById("lore-title");
  const contentInput = document.getElementById("lore-content");

  if (titleInput) titleInput.value = section.title || "";
  if (contentInput) contentInput.value = section.content || "";
}

function deleteLore(id) {
  const section = loreSections.find((s) => s.id === id);
  const name = section ? section.title : "cette section";

  const ok = window.confirm(`Supprimer définitivement ${name} ?`);
  if (!ok) return;

  loreSections = loreSections.filter((s) => s.id !== id);
  editingLoreId = null;

  renderLoreSections();
}

// === Panneau de création / édition de lore ===

const openLorePanelBtn = document.getElementById("open-lore-panel");
const loreBackdrop = document.getElementById("lore-panel-backdrop");
const closeLorePanelBtn = document.getElementById("close-lore-panel");
const cancelLoreBtn = document.getElementById("cancel-lore");
const loreForm = document.getElementById("lore-form");
const loreMessage = document.getElementById("lore-message");

function openLorePanel() {
  if (loreBackdrop) loreBackdrop.classList.remove("hidden");
  if (loreMessage) loreMessage.textContent = "";
  editingLoreId = null;

  if (loreForm) {
    loreForm.reset();
  }
}

function closeLorePanel() {
  if (loreBackdrop) loreBackdrop.classList.add("hidden");
  if (loreForm) loreForm.reset();
  if (loreMessage) loreMessage.textContent = "";
  editingLoreId = null;
}

if (openLorePanelBtn) {
  openLorePanelBtn.addEventListener("click", openLorePanel);
}
if (closeLorePanelBtn) {
  closeLorePanelBtn.addEventListener("click", closeLorePanel);
}
if (cancelLoreBtn) {
  cancelLoreBtn.addEventListener("click", closeLorePanel);
}
if (loreBackdrop) {
  loreBackdrop.addEventListener("click", (event) => {
    if (event.target === loreBackdrop) {
      closeLorePanel();
    }
  });
}

if (loreForm) {
  loreForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("lore-title").value.trim();
    const content = document.getElementById("lore-content").value.trim();

    if (!title) {
      if (loreMessage) loreMessage.textContent = "Merci d’indiquer un titre.";
      return;
    }

    if (editingLoreId !== null) {
      const idx = loreSections.findIndex((s) => s.id === editingLoreId);
      if (idx !== -1) {
        loreSections[idx] = {
          ...loreSections[idx],
          title,
          content
        };
      }
      if (loreMessage) loreMessage.textContent = "✅ Section mise à jour.";
    } else {
      const maxId = loreSections.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newId = maxId + 1;
      const key = "section-" + newId;
      loreSections.push({
        id: newId,
        key,
        title,
        content
      });
      if (loreMessage) loreMessage.textContent = "✅ Section créée.";
    }

    renderLoreSections();

    setTimeout(() => {
      closeLorePanel();
    }, 700);
  });
}

// === Gestion de la carte du monde (drag & drop & fichier) ===

const mapWrapper = document.getElementById("map-wrapper");
const worldMapImage = document.getElementById("world-map-image");
const worldMapFileInput = document.getElementById("world-map-file");

function handleMapFiles(files) {
  const file = files && files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentWorldMapDataUrl = dataUrl;
    if (worldMapImage) {
      worldMapImage.src = dataUrl;
    }
  };
  reader.readAsDataURL(file);
}

if (mapWrapper) {
  mapWrapper.addEventListener("click", () => {
    if (worldMapFileInput) worldMapFileInput.click();
  });

  mapWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    mapWrapper.classList.add("map-dragover");
  });

  mapWrapper.addEventListener("dragleave", (e) => {
    e.preventDefault();
    mapWrapper.classList.remove("map-dragover");
  });

  mapWrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    mapWrapper.classList.remove("map-dragover");
    if (e.dataTransfer && e.dataTransfer.files) {
      handleMapFiles(e.dataTransfer.files);
    }
  });
}

if (worldMapFileInput) {
  worldMapFileInput.addEventListener("change", (e) => {
    handleMapFiles(e.target.files);
  });
}

// === Init ===

renderCharacters("all");
renderCampaigns("en-cours");
renderLoreSections();
// renderTimeline(); // désactivé car remplacé par l’onglet Ressources
