const API_KEY = "AIzaSyDfRdI6TWmMG00zZjlW-7TrSRWtNMqmdR4";

function formatViews(count) {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M views";
  if (count >= 1000)    return (count / 1000).toFixed(1) + "K views";
  return count + " views";
}

async function loadVideos(query = "tech reviews") {
  try {

    // 1. FETCH VIDEOS
    const res  = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=50&type=video&key=${API_KEY}`
    );
    const data = await res.json();

    // 2. LOOP THROUGH EACH VIDEO
    data.items.forEach(async (video) => {

      // FROM SEARCH
      const videoId   = video.id.videoId;
      const title     = video.snippet.title;
      const channel   = video.snippet.channelTitle;
      const channelId = video.snippet.channelId;
      const thumbnail = video.snippet.thumbnails.high.url;
      const date      = video.snippet.publishedAt.slice(0, 10);
      const link      = `https://youtube.com/watch?v=${videoId}`;

      // FROM CHANNELS API → profile pic
      const channelRes  = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
      );
      const channelData = await channelRes.json();
      const profile     = channelData.items[0].snippet.thumbnails.default.url;

      // FROM VIDEOS API → views
      const videoRes  = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`
      );
      const videoData = await videoRes.json();
      const views     = formatViews(videoData.items[0].statistics.viewCount);

      // BUILD CARD
      const card = `
  <a href="${link}" target="_blank" style="text-decoration:none; color:black;">
    <div class="externalplayera">
      <div class="externalplayer-aa">

        <div class="playera">
          <img src="${thumbnail}">
        </div>

        <div class="player-description-bara">
          <div class="channel-profilea">
            <img src="${profile}">
          </div>
          <div class="descriptiona">
            <div class="topica">${title}</div>
            <div class="channel-name-viewsa">
              <div class="channel-namea">${channel}</div>
              <div class="viewsa">${views} • ${date}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </a>
`;

      // INJECT INTO GRID
      document.getElementById("video-grid").innerHTML += card;

    });

  } catch (err) {
    console.error("Error:", err);
  }
}

// SEARCH FUNCTIONALITY
const searchInput = document.querySelector(".searchbar input");
const searchIcon  = document.querySelector(".searchbar img");

function searchVideos(q) {
  if (!q) return;
  document.getElementById("video-grid").innerHTML = ""; // clear old results
  loadVideos(q);
}

// Enter key
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchVideos(searchInput.value.trim());
});

// Search icon click
searchIcon.addEventListener("click", () => {
  searchVideos(searchInput.value.trim());
});

// INITIAL LOAD
loadVideos();



// restricted api on 27 march 2026
