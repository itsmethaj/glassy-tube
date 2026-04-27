/* ================= CONFIG ================= */
const API_KEY = "AIzaSyDSNxr_R7AjzSpAv2VbJowDI0DR3YrSVPU";

/* ================= HELPERS ================= */
function formatViews(count) {
count = Number(count) || 0;
if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M views";
if (count >= 1_000) return (count / 1_000).toFixed(1) + "K views";
return count + " views";
}

/* ================= MAIN ================= */
async function loadVideos(query = "tech reviews") {
const grid = document.getElementById("video-grid");

if (!grid) {
console.error("❌ #video-grid not found");
return;
}

try {
grid.innerHTML = "<p style='color:white'>Loading...</p>";


const res = await fetch(
  `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=8&type=video&key=${API_KEY}`
);

if (!res.ok) {
  console.error("❌ API ERROR:", await res.text());
  grid.innerHTML = "<p style='color:red'>API Error</p>";
  return;
}

const data = await res.json();
console.log("Videos:", data.items);

if (!data.items || data.items.length === 0) {
  grid.innerHTML = "<p style='color:white'>No results found</p>";
  return;
}

/* 🔹 CLEAR GRID */
grid.innerHTML = "";

/* 🔹 LOOP */
for (const video of data.items) {
  const videoId = video.id?.videoId;
  if (!videoId) continue;

  const title = video.snippet?.title || "No title";
  const channel = video.snippet?.channelTitle || "Unknown";
  const channelId = video.snippet?.channelId;
  const thumbnail = video.snippet?.thumbnails?.high?.url || "";
  const date = video.snippet?.publishedAt?.slice(0, 10) || "";
  const link = `https://youtube.com/watch?v=${videoId}`;

  let profile = "https://via.placeholder.com/36";
  let views = "0 views";

  /* 🔹 CHANNEL FETCH */
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    profile =
      channelData.items?.[0]?.snippet?.thumbnails?.default?.url ||
      profile;
  } catch {
    console.warn("Channel fetch failed");
  }

  /* 🔹 VIDEO STATS FETCH */
  try {
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`
    );
    const videoData = await videoRes.json();
    views = formatViews(
      videoData.items?.[0]?.statistics?.viewCount || 0
    );
  } catch {
    console.warn("Video stats fetch failed");
  }

  /* 🔹 BUILD CARD */
  const card = document.createElement("a");
  card.href = link;
  card.target = "_blank";
  card.style.textDecoration = "none";

  card.innerHTML = `
    <div class="externalplayera">
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
            <div>${channel}</div>
            <div>${views} • ${date}</div>
          </div>
        </div>
      </div>
    </div>
  ` ;

  grid.appendChild(card);
}
} catch (err) {
console.error("❌ Unexpected Error:", err);
grid.innerHTML = "<p style='color:red'>Something went wrong</p>";
}
}

/* ================= SEARCH ================= */
const searchInput = document.querySelector(".searchbar input");
const searchIcon = document.querySelector(".searchbar img");

function searchVideos(q) {
if (!q) return;
document.getElementById("video-grid").innerHTML = "";
loadVideos(q);
}

searchInput?.addEventListener("keydown", (e) => {
if (e.key === "Enter") searchVideos(searchInput.value.trim());
});

searchIcon?.addEventListener("click", () => {
searchVideos(searchInput.value.trim());
});

/* ================= INIT ================= */
loadVideos();
