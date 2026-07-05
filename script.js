let quests = [];
let highlightedQuestId = "";

const FILTER_ALL = "all";
const QUEST_DATA_URL = "quests.json";
const RELATIONSHIP_FIELDS = ["prerequisites", "unlocks", "leadsTo"];
const STATUS_OPTIONS = ["Available", "Urgent", "Locked", "Hidden", "Completed"];

const questList = document.querySelector("#quest-list");
const questCount = document.querySelector("#quest-count");
const searchInput = document.querySelector("#search-input");
const clearFiltersButton = document.querySelector("#clear-filters");

const difficultyButtons = document.querySelectorAll("[data-difficulty]");
const typeButtons = document.querySelectorAll("[data-type]");
const statusButtons = document.querySelectorAll("[data-status]");

const filters = {
  difficulty: FILTER_ALL,
  type: FILTER_ALL,
  status: FILTER_ALL,
  search: ""
};

async function loadQuests() {
  try {
    const response = await fetch(QUEST_DATA_URL);

    if (!response.ok) {
      throw new Error("Quest data could not be loaded.");
    }

    const data = await response.json();
    quests = data.quests;

    validateQuestConnections();
    renderQuests(quests);
  } catch (error) {
    showLoadError(error);
  }
}

function showLoadError(error) {
  console.error(error);

  questCount.textContent = "Unable to load contracts.";
  questList.innerHTML = `
    <p class="no-results">
      The quest board could not load its contract data. Make sure you are running the project with Live Server.
    </p>
  `;
}

function getQuestById(questId) {
  return quests.find(function (quest) {
    return quest.id === questId;
  });
}

function getQuestTitleById(questId) {
  const quest = getQuestById(questId);
  return quest ? quest.title : questId;
}

function getListField(quest, fieldName) {
  if (Array.isArray(quest[fieldName])) {
    return quest[fieldName];
  }

  return [];
}

function validateQuestConnections() {
  const questIds = quests.map(function (quest) {
    return quest.id;
  });

  quests.forEach(function (quest) {
    RELATIONSHIP_FIELDS.forEach(function (fieldName) {
      getListField(quest, fieldName).forEach(function (connectedQuestId) {
        if (!questIds.includes(connectedQuestId)) {
          console.warn(
            `"${quest.title}" has a missing ${fieldName} connection: ${connectedQuestId}`
          );
        }
      });
    });
  });

  quests.forEach(function (quest) {
    getListField(quest, "unlocks").forEach(function (unlockedQuestId) {
      const unlockedQuest = getQuestById(unlockedQuestId);

      if (!unlockedQuest) {
        return;
      }

      const prerequisites = getListField(unlockedQuest, "prerequisites");

      if (!prerequisites.includes(quest.id)) {
        console.warn(
          `"${quest.title}" unlocks "${unlockedQuest.title}", but "${unlockedQuest.title}" does not list "${quest.id}" as a prerequisite.`
        );
      }
    });
  });
}

function getSearchableText(quest) {
  const prerequisiteTitles = getListField(quest, "prerequisites").map(getQuestTitleById);
  const unlockTitles = getListField(quest, "unlocks").map(getQuestTitleById);
  const leadTitles = getListField(quest, "leadsTo").map(getQuestTitleById);

  return [
    quest.title,
    quest.difficulty,
    quest.type,
    quest.status,
    quest.location,
    quest.questGiver,
    quest.reward,
    quest.summary,
    quest.description,
    quest.complication,
    getListField(quest, "prerequisites").join(" "),
    prerequisiteTitles.join(" "),
    getListField(quest, "unlocks").join(" "),
    unlockTitles.join(" "),
    getListField(quest, "leadsTo").join(" "),
    leadTitles.join(" "),
    getListField(quest, "relatedNpcs").join(" "),
    getListField(quest, "relatedLocations").join(" "),
    getListField(quest, "tags").join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

function getFilteredQuests() {
  return quests.filter(function (quest) {
    const matchesDifficulty =
      filters.difficulty === FILTER_ALL || quest.difficulty === filters.difficulty;

    const matchesType = filters.type === FILTER_ALL || quest.type === filters.type;

    const matchesStatus =
      filters.status === FILTER_ALL || quest.status === filters.status;

    const matchesSearch =
      filters.search === "" || getSearchableText(quest).includes(filters.search);

    return matchesDifficulty && matchesType && matchesStatus && matchesSearch;
  });
}

function applyFilters() {
  renderQuests(getFilteredQuests());
}

function updateActiveButton(buttons, selectedValue, dataName) {
  buttons.forEach(function (button) {
    button.classList.toggle("active", button.dataset[dataName] === selectedValue);
  });
}

function updateAllActiveButtons() {
  updateActiveButton(difficultyButtons, filters.difficulty, "difficulty");
  updateActiveButton(typeButtons, filters.type, "type");
  updateActiveButton(statusButtons, filters.status, "status");
}

function resetFilters() {
  filters.difficulty = FILTER_ALL;
  filters.type = FILTER_ALL;
  filters.status = FILTER_ALL;
  filters.search = "";
  highlightedQuestId = "";

  searchInput.value = "";

  updateAllActiveButtons();
  renderQuests(quests);
}

function formatDifficulty(difficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function createStatusOptionsMarkup(currentStatus) {
  return STATUS_OPTIONS.map(function (status) {
    const selected = status === currentStatus ? "selected" : "";
    return `<option value="${status}" ${selected}>${status}</option>`;
  }).join("");
}

function createTagMarkup(tags) {
  return tags
    .map(function (tag) {
      return `<span class="quest-tag">${tag}</span>`;
    })
    .join("");
}

function createListMarkup(items) {
  if (items.length === 0) {
    return "<p>None</p>";
  }

  return `
    <ul class="details-list">
      ${items
        .map(function (item) {
          return `<li>${item}</li>`;
        })
        .join("")}
    </ul>
  `;
}

function createQuestConnectionMarkup(questIds, connectionType) {
  if (questIds.length === 0) {
    return "<p>None</p>";
  }

  return `
    <ul class="details-list quest-connection-list">
      ${questIds
        .map(function (questId) {
          return `
            <li>
              <button
                type="button"
                class="quest-connection-button ${connectionType}-connection"
                data-connected-quest="${questId}"
              >
                ${getQuestTitleById(questId)}
              </button>
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function createQuestCardMarkup(quest) {
  return `
    <div class="contract-topline">
      <span class="contract-label">Guild Contract</span>

      <div class="status-tools">
        <span class="status-badge status-${quest.status.toLowerCase()}">
          ${quest.status}
        </span>

        <label class="status-select-label">
          <span class="sr-only">Change status for ${quest.title}</span>
          <select
            class="status-select"
            data-status-select
            data-quest-id="${quest.id}"
          >
            ${createStatusOptionsMarkup(quest.status)}
          </select>
        </label>
      </div>
    </div>

    <div class="contract-heading">
      <h2 class="quest-title">${quest.title}</h2>

      <div class="contract-chips">
        <span class="contract-chip difficulty ${quest.difficulty}">
          ${formatDifficulty(quest.difficulty)}
        </span>

        <span class="contract-chip type ${quest.type.toLowerCase()}">
          ${quest.type}
        </span>
      </div>
    </div>

    <p class="quest-summary">${quest.summary}</p>

    <div class="contract-info-list">
      <div class="contract-info-item">
        <span class="info-label">Location</span>
        <p>${quest.location}</p>
      </div>

      <div class="contract-info-item">
        <span class="info-label">Quest Giver</span>
        <p>${quest.questGiver}</p>
      </div>

      <div class="contract-info-item">
        <span class="info-label">Reward</span>
        <p>${quest.reward}</p>
      </div>
    </div>

    <details class="quest-details">
      <summary>Open DM dossier</summary>
      ${createQuestDetailsMarkup(quest)}
    </details>
  `;
}

function createQuestDetailsMarkup(quest) {
  return `
    <div class="details-content">
      <div class="detail-block">
        <span class="info-label">Full Brief</span>
        <p>${quest.description}</p>
      </div>

      <div class="detail-block dm-hook">
        <span class="info-label">DM Hook</span>
        <p>${quest.complication}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-block">
          <span class="info-label">Requires</span>
          ${createQuestConnectionMarkup(getListField(quest, "prerequisites"), "prerequisite")}
        </div>

        <div class="detail-block">
          <span class="info-label">Unlocks</span>
          ${createQuestConnectionMarkup(getListField(quest, "unlocks"), "unlock")}
        </div>

        <div class="detail-block">
          <span class="info-label">Story Leads</span>
          ${createQuestConnectionMarkup(getListField(quest, "leadsTo"), "lead")}
        </div>

        <div class="detail-block">
          <span class="info-label">Related NPCs</span>
          ${createListMarkup(getListField(quest, "relatedNpcs"))}
        </div>

        <div class="detail-block">
          <span class="info-label">Related Locations</span>
          ${createListMarkup(getListField(quest, "relatedLocations"))}
        </div>
      </div>

      <div class="detail-block">
        <span class="info-label">Tags</span>
        <div class="tag-row">
          ${createTagMarkup(getListField(quest, "tags"))}
        </div>
      </div>
    </div>
  `;
}

function renderQuests(questArray) {
  questList.innerHTML = "";
  questCount.textContent = `Showing ${questArray.length} of ${quests.length} contracts`;

  if (questArray.length === 0) {
    questList.innerHTML = `<p class="no-results">No contracts match your current filters.</p>`;
    return;
  }

  questArray.forEach(function (quest) {
    const questCard = document.createElement("article");
    questCard.classList.add("quest-card");

    if (quest.id === highlightedQuestId) {
      questCard.classList.add("quest-card-highlight");
    }

    questCard.innerHTML = createQuestCardMarkup(quest);
    questList.appendChild(questCard);
  });
}

function showConnectedQuest(questId) {
  const connectedQuest = getQuestById(questId);

  if (!connectedQuest) {
    return;
  }

  filters.difficulty = FILTER_ALL;
  filters.type = FILTER_ALL;
  filters.status = FILTER_ALL;
  filters.search = connectedQuest.title.toLowerCase();
  highlightedQuestId = questId;

  searchInput.value = connectedQuest.title;

  updateAllActiveButtons();
  applyFilters();

  document.querySelector(".board-area").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function updateQuestStatus(questId, newStatus) {
  const questToUpdate = getQuestById(questId);

  if (!questToUpdate) {
    return;
  }

  questToUpdate.status = newStatus;
  highlightedQuestId = questId;
  applyFilters();
}

function handleFilterButtonClick(buttons, dataName, filterName) {
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      filters[filterName] = button.dataset[dataName];
      highlightedQuestId = "";
      updateActiveButton(buttons, filters[filterName], dataName);
      applyFilters();
    });
  });
}

function setupEventListeners() {
  handleFilterButtonClick(difficultyButtons, "difficulty", "difficulty");
  handleFilterButtonClick(typeButtons, "type", "type");
  handleFilterButtonClick(statusButtons, "status", "status");

  clearFiltersButton.addEventListener("click", resetFilters);

  searchInput.addEventListener("input", function () {
    filters.search = searchInput.value.toLowerCase().trim();
    highlightedQuestId = "";
    applyFilters();
  });

  questList.addEventListener("click", function (event) {
    const connectionButton = event.target.closest("[data-connected-quest]");

    if (!connectionButton) {
      return;
    }

    showConnectedQuest(connectionButton.dataset.connectedQuest);
  });

  questList.addEventListener("change", function (event) {
    const statusSelect = event.target.closest("[data-status-select]");

    if (!statusSelect) {
      return;
    }

    updateQuestStatus(statusSelect.dataset.questId, statusSelect.value);
  });
}

updateAllActiveButtons();
setupEventListeners();
loadQuests();