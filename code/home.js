console.log("JS loaded");
const API_KEY = "AIzaSyCedKlYyMVLFJCZE2WaStodjK8e7HKA1mI";
const query = "tech reviews";

// FORMAT VIEWS → 7700000 becomes "7.7M views"
function formatViews(count) {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M views";
  if (count >= 1000)    return (count / 1000).toFixed(1) + "K views";
  return count + " views";
}

async function loadVideos() {
  try {

    // 1. FETCH VIDEOS
    const res  = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=50&type=video&key=${API_KEY}`
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

loadVideos();

