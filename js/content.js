async function addDownloadButton() {
  if (window.location.href.includes('/anime/')) return;

  const episodeList = document.querySelectorAll('.episode');
  const list = (await chrome.storage.sync.get('list'))?.list

  episodeList.forEach((episode) => {
    console.log(episode.querySelector('.episode-snapshot img'));
    const data = {
      image: episode.querySelector('.episode-snapshot img').getAttribute('data-src'),
      title: episode.querySelector('.episode-number').innerText,
    };

    if (list?.find((e) => e.title === data.title)) return;

    episode.classList.add('relative');
    const downloadButton = document.createElement('button');
    const className = 'absolute top-0 right-0 z-10 bg-primary hover:bg-primary/70 text-white p-1 rounded text-xs';
    downloadButton.setAttribute('class', className);
    downloadButton.innerText = 'Add to watch list';
    episode.append(downloadButton);

    downloadButton.addEventListener('click', () => {
      chrome.storage.sync.get('list', (result) => {
        const list = result.list || [];
        list.push(data);
        chrome.storage.sync.set({ list }, () => {
          downloadButton.innerText = 'Added';
        });
      });
    })
  });
}

async function removeEpisode(episode) {
  const list = (await chrome.storage.sync.get('list'))?.list;
  const newList = list.filter((e) => e.title !== episode.title);
  await chrome.storage.sync.set({ list: newList });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REMOVE_EPISODE') {
    removeEpisode(request.episode);
  }
});

const observer = new MutationObserver(function () {
  addDownloadButton()
});

observer.observe(document.querySelector('.episode-list-wrapper'), {
  attributes: true,
  childList: true,
  characterData: true
});