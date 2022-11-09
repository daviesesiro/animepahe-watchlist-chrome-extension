import { debounce, getActiveTab } from "./utils.js";

const listContainer = document.getElementById("list");
const episodes = (await chrome.storage.sync.get("list"))["list"] || [];
const searchInput = document.getElementById("search");

const displayEpisodes = (episodes) => {
  listContainer.innerHTML = "";

  if (episodes.length) {
    episodes.forEach((episode) => {
      const episodeContainer = document.createElement("div");
      episodeContainer.setAttribute("class", "flex items-center p-2");

      const image = document.createElement("img");
      image.setAttribute("src", episode.image);
      image.setAttribute("class", "w-[36px] h-[20px] mr-2");

      const title = document.createElement("p");
      title.setAttribute("class", "text-md");
      title.innerText = episode.title;

      const viewBtn = document.createElement("button");
      viewBtn.setAttribute(
        "class",
        "ml-auto bg-primary hover:bg-primary text-white p-1 rounded text-xs"
      );
      viewBtn.innerText = "View";
      viewBtn.addEventListener("click", () => onViewClick(episode.title));

      const removeBtn = document.createElement("button");
      removeBtn.setAttribute(
        "class",
        "ml-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
      );
      removeBtn.innerText = "Remove";
      removeBtn.addEventListener("click", async (e) => {
        const newList = episodes.filter((e) => e.title !== episode.title);
        const tabId = (await getActiveTab()).id;
        chrome.tabs.sendMessage(
          tabId,
          { type: "REMOVE_EPISODE", episode },
          () => displayEpisodes(newList)
        );
      });

      episodeContainer.append(image);
      episodeContainer.append(title);
      episodeContainer.append(viewBtn);
      episodeContainer.append(removeBtn);
      listContainer.append(episodeContainer);
    });
    return;
  }

  const noEpisode = document.createElement("p");
  noEpisode.innerText = "No episodes yet";
  listContainer.append(noEpisode);
};

displayEpisodes(episodes);

searchInput.addEventListener(
  "input",
  debounce(async (e) => {
    const query = e.target.value?.toLowerCase();
    if (!query) {
      displayEpisodes(episodes);
      return;
    }

    const filteredEpisodes = episodes.filter((ep) =>
      ep.title.toLowerCase().includes(query)
    );

    displayEpisodes(filteredEpisodes);
  }, 500)
);

const onViewClick = async (e) => {
  const sessionId = await getEpisodeSessionId(e);
  const url = `https://animepahe.com/play/${sessionId}`;

  chrome.tabs.create({ url });
};

const getEpisodeSessionId = async (title) => {
  const response = await fetch(`https://animepahe.com/api?m=search&q=${title}`);
  const data = await response.json();
  const ep = data.data[0];
  return ep.session;
};
