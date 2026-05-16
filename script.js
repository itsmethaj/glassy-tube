const API_KEY = "AIzaSyBkX95uomSG4cDG3oxy66YiHKN8X5d2BP0";
const grid=document.getElementById("video-grid");
const searchInput=document.querySelector(".search_input_box input");
const navItems=document.querySelectorAll(".nav_item");
const videoGrid=document.getElementById("video-grid");
const openSearch=document.getElementById("openSearch");
const closeSearch=document.getElementById("closeSearch");
const searchContainer=document.getElementById("searchContainer");
const topBar=document.querySelector(".top_bar");
const micBtn=document.querySelector(".search_mic");
const voiceStatus=document.getElementById("voiceStatus");
const searchInputBox=document.querySelector(".search_input_box");

function formatViews(count){
  count=Number(count)||0;
  if(count>=1_000_000) return(count/1_000_000).toFixed(1)+"M views";
  if(count>=1_000) return(count/1_000).toFixed(1)+"K views";
  return count+" views";
}

function truncateTitle(title,max=55){
  return title.length<=max
  ? title
  : title.slice(0,max).split(" ").slice(0,-1).join(" ")+"...";
}

function convertDurationToSeconds(duration){
  const match=duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return(
    (parseInt(match?.[1]||0)*3600)+
    (parseInt(match?.[2]||0)*60)+
    parseInt(match?.[3]||0)
  );
}

function showEducationalAlert(){
  alert(
    "This is not an official YouTube app or website.\n\nMade only for educational purposes.\n\nThis feature is unavailable."
  );
}

async function loadVideos(query="tech reviews",isShorts=false){

  try{

    grid.innerHTML="<p style='color:white'>Loading...</p>";

    grid.classList.toggle(
      "shorts_feed",
      isShorts
    );

    const res=await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=50&type=video&key=${API_KEY}`
    );

   const data=await res.json();

if(!data.items){

  console.log(data);

  const errorReason=
    data?.error?.errors?.[0]?.reason;

  if(errorReason==="quotaExceeded"){

    grid.innerHTML=`
    <div style="
      color:white;
      padding:25px;
      text-align:center;
      line-height:1.7;
    ">
      <h2 style="
        color:#ff4d4d;
        margin-bottom:10px;
      ">
        API Credits Expired
      </h2>

      <p>
        YouTube API daily limit exceeded.
      </p>

      <p style="
        opacity:.7;
        font-size:.9rem;
      ">
        Credits usually reset within 24 hours.
      </p>
    </div>
    `;

  }else if(
  errorReason==="ipRefererBlocked"||
  errorReason==="forbidden"
){

  grid.innerHTML=`
  <div style="
    color:white;
    padding:25px;
    text-align:center;
    line-height:1.7;
  ">
    <h2 style="
      color:#ff4d4d;
      margin-bottom:10px;
    ">
      API Restriction Error
    </h2>

    <p>
      This domain is not allowed
      to use the API key.
    </p>
  </div>
  `;

}else{

  console.error(
    "YouTube API Error:",
    data
  );

  grid.innerHTML=`
  <p style="
    color:red;
    padding:20px;
  ">
    Failed to load videos
  </p>
  `;
}
return
}
    grid.innerHTML="";

    for(const video of data.items){

      const videoId=video.id?.videoId;

      if(!videoId) continue;

      const detailsRes=await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${API_KEY}`
      );

      const details=await detailsRes.json();

      const duration=
        details.items?.[0]?.contentDetails?.duration||"";

      const seconds=
        convertDurationToSeconds(duration);

      if(isShorts && seconds>60) continue;
      if(!isShorts && seconds<=60) continue;

      const title=video.snippet?.title||"No title";
      const channel=video.snippet?.channelTitle||"Unknown";
      const channelId=video.snippet?.channelId;
      const thumbnail=video.snippet?.thumbnails?.high?.url||"";
      const date=video.snippet?.publishedAt?.slice(0,10)||"";
      const views=formatViews(
        details.items?.[0]?.statistics?.viewCount||0
      );

      let profile="https://via.placeholder.com/36";

      try{

        const channelRes=await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
        );

        const channelData=await channelRes.json();

        profile=
          channelData.items?.[0]
          ?.snippet?.thumbnails
          ?.default?.url||profile;

      }catch{}

      const card=document.createElement("a");

      card.href=`https://youtube.com/watch?v=${videoId}`;
      card.target="_blank";
      card.style.textDecoration="none";

      card.innerHTML=isShorts
      ?`
      <div class="short_card">
        <div class="short_player">

          <div class="unmute_btn">
            🔊 Tap for Sound
          </div>

          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>

          <div class="short_gradient"></div>

          <div class="short_badge">
            SHORTS
          </div>

          <div class="short_bottom">

            <div class="short_title">
              ${truncateTitle(title,45)}
            </div>

            <div class="short_meta">

              <div class="short_channel">
                ${channel}
              </div>

              <div class="short_views">
                ${views}
              </div>

            </div>

          </div>

        </div>
      </div>
      `
      :`
      <div class="externalplayera">

        <div class="playera">
          <img src="${thumbnail}">
        </div>

        <div class="player-description-bara">

          <div class="channel-profilea">
            <img src="${profile}">
          </div>

          <div class="descriptiona">

            <div class="topica">
              ${truncateTitle(title)}
            </div>

            <div class="channel-name-viewsa">
              <div>${channel}</div>
              <div>${views} • ${date}</div>
            </div>

          </div>

        </div>

      </div>
      `;

      grid.appendChild(card);
    }

  }catch(err){

    console.log(err);

    grid.innerHTML=
    "<p style='color:red'>Something went wrong</p>";
  }
}

function searchVideos(q){
  if(q) loadVideos(q);
}

searchInput?.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    searchVideos(searchInput.value.trim());
  }
});

openSearch?.addEventListener("click",()=>{
  searchContainer.classList.add("active");
  topBar.classList.add("search_mode");
  searchInput.focus();
});

closeSearch?.addEventListener("click",()=>{
  searchContainer.classList.remove("active");
  topBar.classList.remove("search_mode");
});

if("webkitSpeechRecognition" in window){

  const recognition=new webkitSpeechRecognition();

  recognition.continuous=false;
  recognition.interimResults=true;
  recognition.maxAlternatives=5;
  recognition.lang=navigator.language||"en-US";

  let silenceTimer;

  micBtn?.addEventListener("click",()=>{

    clearTimeout(silenceTimer);

    searchInput.value="";

    voiceStatus.textContent="Listening...";
    voiceStatus.classList.add("active");
    voiceStatus.classList.remove("error");

    micBtn.classList.add("listening");
    searchInputBox.classList.add("voice_mode");

    recognition.start();
  });

  recognition.onresult=(event)=>{

    clearTimeout(silenceTimer);

    let transcript="";

    for(
      let i=event.resultIndex;
      i<event.results.length;
      i++
    ){
      transcript+=event.results[i][0].transcript;
    }

    transcript=transcript
      .replace(/\s+/g," ")
      .trim();

    searchInput.value=transcript;

    voiceStatus.textContent="Recognizing...";

    silenceTimer=setTimeout(()=>{
      recognition.stop();
    },1800);
  };

  recognition.onend=()=>{

    micBtn.classList.remove("listening");
    searchInputBox.classList.remove("voice_mode");

    const query=searchInput.value.trim();

    if(query){

      voiceStatus.textContent="Searching...";

      searchVideos(query);

      setTimeout(()=>{
        searchContainer.classList.remove("active");
      },500);

    }else{

      voiceStatus.textContent="Voice not detected";

      voiceStatus.classList.add("error");
    }

    setTimeout(()=>{
      voiceStatus.classList.remove("active");
    },2200);
  };

  recognition.onerror=()=>{

    micBtn.classList.remove("listening");

    voiceStatus.textContent=
    "Voice recognition failed";

    voiceStatus.classList.add(
      "active",
      "error"
    );

    setTimeout(()=>{
      voiceStatus.classList.remove("active");
    },2500);
  };
}

navItems.forEach(item=>{

  item.addEventListener("click",()=>{

    navItems.forEach(nav=>{
      nav.classList.remove("active_nav");
    });

    item.classList.add("active_nav");

    if(item.id==="homeBtn"){
      loadVideos();
    }

    if(item.id==="shortsBtn"){
      loadVideos("viral shorts",true);
    }

    if(
      item.id==="subsBtn"||
      item.id==="youBtn"||
      item.id==="createBtn"
    ){
      showEducationalAlert();
    }

  });
});

document.addEventListener("click",e=>{

  const shortPlayer=
    e.target.closest(".short_player");

  if(!shortPlayer) return;

  const iframe=
    shortPlayer.querySelector("iframe");

  if(!iframe) return;

  iframe.src=
    iframe.src.replace(
      "mute=1",
      "mute=0"
    );

  shortPlayer.querySelector(
    ".unmute_btn"
  )?.remove();
});

document
.querySelector(".notification")
?.addEventListener(
  "click",
  showEducationalAlert
);

loadVideos();