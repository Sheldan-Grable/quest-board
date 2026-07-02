const quests = [
  {
    title: "Rats in the Cellar",
    difficulty: "easy",
    type: "Combat",
    description: "A nervous tavern keeper needs help clearing strange rats from the cellar."
  },
  {
    title: "The Missing Courier",
    difficulty: "medium",
    type: "Exploration",
    description: "A courier vanished on the old forest road while carrying an important message."
  },
  {
    title: "The Broken Shrine",
    difficulty: "easy",
    type: "Roleplay",
    description: "Villagers want someone to investigate whispers coming from an abandoned shrine."
  },
  {
    title: "Bandits at Blackbridge",
    difficulty: "medium",
    type: "Combat",
    description: "Travelers are being robbed near the bridge outside town."
  },
  {
    title: "The Wyrm Below",
    difficulty: "hard",
    type: "Combat",
    description: "Something ancient has awakened beneath the ruined watchtower."
  },
  {
    title: "A Noble's Secret",
    difficulty: "hard",
    type: "Roleplay",
    description: "A noble family is hiding something dangerous behind closed doors."
  },
  {
    title: "The Bell That Rings Below",
    difficulty: "deadly",
    type: "Investigation",
    description: "Each midnight, a buried bell tolls beneath the town, and those who hear it dream of their own deaths."
  }
];

const questList = document.querySelector("#quest-list");
const questCount = document.querySelector("#quest-count");
const searchInput = document.querySelector("#search-input");
const difficultyButtons = document.querySelectorAll("[data-difficulty]");
const typeButtons = document.querySelectorAll("[data-type]");

let currentDifficulty = "all";
let currentType = "all";
let currentSearch = "";

function applyFilters() {
  let filteredQuests = quests;

  if (currentDifficulty !== "all") {
    filteredQuests = filteredQuests.filter(function(quest) {
      return quest.difficulty === currentDifficulty;
    });
  }

  if (currentType !== "all") {
    filteredQuests = filteredQuests.filter(function(quest) {
      return quest.type === currentType;
    });
  }

  if (currentSearch !== "") {
    filteredQuests = filteredQuests.filter(function(quest) {
      const title = quest.title.toLowerCase();
      const description = quest.description.toLowerCase();

      return title.includes(currentSearch) || description.includes(currentSearch);
    });
  }

  displayQuests(filteredQuests);
}

function updateActiveButton(buttons, selectedValue, dataName) {
  buttons.forEach(function(button) {
    if (button.dataset[dataName] === selectedValue) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

difficultyButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    currentDifficulty = button.dataset.difficulty;
    updateActiveButton(difficultyButtons, currentDifficulty, "difficulty");
    applyFilters();
  });
});

typeButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    currentType = button.dataset.type;
    updateActiveButton(typeButtons, currentType, "type");
    applyFilters();
  });
});

searchInput.addEventListener("input", function() {
  currentSearch = searchInput.value.toLowerCase().trim();
  applyFilters();
});

displayQuests(quests);
function displayQuests(questArray) {
  questList.innerHTML = "";
  questCount.textContent = `Showing ${questArray.length} of ${quests.length} quests`;

   if (questArray.length === 0) {
    const noResultsMessage = document.createElement("p");
    noResultsMessage.classList.add("no-results");
    noResultsMessage.textContent = "No quests match your current filters.";

    questList.appendChild(noResultsMessage);
    return;
  }

  questArray.forEach(function(quest) {
    const questCard = document.createElement("article");
    questCard.classList.add("quest-card");

    questCard.innerHTML = `
  <h2 class="quest-title">${quest.title}</h2>

  <div class="quest-meta">
  <div class="badge-group">
    <span class="badge-label">Difficulty</span>
    <span class="badge difficulty ${quest.difficulty}">
      ${quest.difficulty.toUpperCase()}
    </span>
  </div>

  <div class="badge-group">
    <span class="badge-label">Type</span>
    <span class="badge type ${quest.type.toLowerCase()}">
      ${quest.type}
    </span>
  </div>
</div>

  <p class="quest-description">${quest.description}</p>
`;

    questList.appendChild(questCard);
  });
}

filterButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    const difficulty = button.dataset.difficulty;

    if (difficulty === "all") {
      displayQuests(quests);
    } else {
      const filteredQuests = quests.filter(function(quest) {
        return quest.difficulty === difficulty;
      });

      displayQuests(filteredQuests);
    }
  });
});

updateActiveButton(difficultyButtons, currentDifficulty, "difficulty");
updateActiveButton(typeButtons, currentType, "type");
displayQuests(quests);