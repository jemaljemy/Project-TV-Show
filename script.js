//You can edit ALL of the code here
const state = {};
const allShowsUrl = "https://api.tvmaze.com/shows";

const fetchShows = async () => {
  // Requirement 6: Cache fetched shows to avoid re-fetching
  if (state.allShows) {
    console.log("Using cached show data.");
    return state.allShows;
  }
  const response = await fetch(allShowsUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const showData = await response.json();
  state.allShows = showData;
  return showData;
};

const fetchEpisodes = async (showId = 82) => {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const populateShowDropdown = (shows) => {
  const selectShow = document.getElementById("select-show");

  if (!selectShow) {
    console.error("select-show element not found!");
    return;
  }

  // Clear existing options
  selectShow.innerHTML = "";

  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "--Select A Show--";
  selectShow.append(defaultShowOption);

  // Requirement 5: Sort shows alphabetically, case-insensitive
  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selectShow.append(option);
  });
};

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const templateMovie = document.getElementById("episodes-template");

  // Clear the root element to prepare for new content
  rootElem.innerHTML = "";

  // Create the main container for all controls
  const divDropDown = document.createElement("div");
  divDropDown.className = "search-container";

  // Create and append the Show Selector (Requirement 1)
  const selectShow = document.createElement("select");
  selectShow.id = "select-show";

  // Add event listener for show change (Requirement 3)
  selectShow.addEventListener("change", async (event) => {
    const showId = event.target.value;
    if (showId) {
      try {
        // Fetch new episodes and re-render the page
        const newEpisodeData = await fetchEpisodes(showId);
        makePageForEpisodes(newEpisodeData);
        // After re-rendering, set the show dropdown to the newly selected show
        populateShowDropdown(state.allShows);
        document.getElementById("select-show").value = showId;
      } catch (error) {
        console.error("Failed to fetch episodes for new show:", error);
      }
    }
  });

  // Create search input and episode selector as before
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search Episodes..";

  const label = document.createElement("label");
  label.textContent = "Select An Episode ";
  label.setAttribute("for", "select-movie");

  const selectMovie = document.createElement("select");
  selectMovie.id = "select-movie";
  const defOption = document.createElement("option");
  defOption.value = "";
  defOption.textContent = "--Show All Episodes--";
  selectMovie.append(defOption);

  const paragraphD = document.createElement("p");
  paragraphD.id = "selectedMovie";
  paragraphD.textContent = `Displaying ${episodeList.length}/${episodeList.length} episodes`;

  // Append all UI controls to the divDropDown container
  divDropDown.append(selectShow, searchInput, label, selectMovie, paragraphD);
  rootElem.append(divDropDown);

  // Generate episode cards and populate the episode dropdown
  episodeList.forEach((episode) => {
    const episodeMovie = templateMovie.content.cloneNode(true);

    const movieTitle = episodeMovie.querySelector(
      ".episode-card-header .episode-title"
    );
    const imgMovie = episodeMovie.querySelector(".episode-image");
    const summaryMovie = episodeMovie.querySelector(".episode-summary");

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    movieTitle.textContent = `${episode.name} - ${episodeCode}`;

    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    selectMovie.append(option);

    imgMovie.src = episode.image?.medium
      ? episode.image.medium
      : "./levels/example-screenshots/example-level-100.png";
    imgMovie.alt = `Thumbnail for ${episode.name}`;

    summaryMovie.innerHTML = episode.summary;

    const episodeCard = episodeMovie.querySelector(".episode-card");
    episodeCard.classList.add("episode");
    episodeCard.setAttribute("data-episode-code", episodeCode);

    const tvmazeLink = document.createElement("p");
    tvmazeLink.innerHTML = `<a href="${episode.url}">See more on TVMaze.com</a>`;
    episodeMovie.querySelector(".episode-card-body").appendChild(tvmazeLink);

    rootElem.append(episodeMovie);
  });

  // Select menu filtering (Requirement 4)
  selectMovie.addEventListener("change", function () {
    const selectedCode = this.value;
    const allEpisodeCards = document.querySelectorAll(".episode-card");
    let displayedCount = 0;

    allEpisodeCards.forEach((card) => {
      const code = card.getAttribute("data-episode-code");
      if (selectedCode === "" || code === selectedCode) {
        card.style.display = "flex";
        displayedCount++;
      } else {
        card.style.display = "none";
      }
    });

    paragraphD.textContent = `Displaying ${displayedCount}/${episodeList.length} episodes`;
  });

  // Search input filtering (Requirement 4)
  searchInput.addEventListener("input", function () {
    const searchItem = this.value.toLowerCase();
    const allEpisodeCards = document.querySelectorAll(".episode-card");
    let count = 0;

    allEpisodeCards.forEach((episodeDiv) => {
      const episodeName = episodeDiv
        .querySelector("h2")
        .textContent.toLowerCase();
      const episodeSummary = episodeDiv
        .querySelector(".episode-summary")
        .textContent.toLowerCase();

      if (
        episodeName.includes(searchItem) ||
        episodeSummary.includes(searchItem)
      ) {
        episodeDiv.style.display = "flex";
        count++;
      } else {
        episodeDiv.style.display = "none";
      }
    });
    paragraphD.textContent = `Displaying ${count}/${episodeList.length} episodes`;
  });
}

const setup = async () => {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<h1>Loading shows and episodes...</h1>";

  try {
    // Fetch and populate all shows (Requirement 2)
    const allShows = await fetchShows();
    // Create the initial page structure with a default show
    const defaultShowId = 82; // Breaking Bad
    const arrayEpisodes = await fetchEpisodes(defaultShowId);
    makePageForEpisodes(arrayEpisodes);

    // Populate the show dropdown after the page is rendered
    populateShowDropdown(allShows);
    // Set the default show in the dropdown
    document.getElementById("select-show").value = defaultShowId;
  } catch (error) {
    console.error("An error occurred while fetching data:", error);
    rootElem.innerHTML = `
            <div style="text-align: center; color: red;">
                <h1>Oops! Something went wrong.</h1>
                <p>Could not load the data. Please try again later.</p>
            </div>
        `;
  }
};
window.onload = setup;
