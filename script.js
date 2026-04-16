/* =========================
   KEY NAMES in localStorage
   ========================= */
const LS_USER = "asm_user";
const LS_VIDEOS = "asm_videos";
const LS_REQUESTS = "asm_requests";
const LS_THEME = "asm_theme";

/* =========================
   UTILITIES
   ========================= */
const $ = (id) => document.getElementById(id);

/* safe parse */
function readJSON(k, fallback) {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
}
function writeJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

/* =========================
   ON LOAD: show login or app
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // elements
  const loginScreen = $("login-screen");
  const app = $("app");
  const userNameDisplay = $("userNameDisplay");
  const profileName = $("profileName");

  // theme apply
  const savedTheme = localStorage.getItem(LS_THEME) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon();

  // check user
  const currentUser = localStorage.getItem(LS_USER);
  if (!currentUser) {
    // show login
    loginScreen.classList.remove("hidden");
    app.classList.add("hidden");
  } else {
    // logged in -> show app
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    userNameDisplay.textContent = currentUser;
    profileName.textContent = currentUser;
  }

  // attach login handler
  const loginForm = $("loginForm");
  if (loginForm){
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("loginName").value.trim();
      if (!name) { alert("Enter a display name"); return; }
      localStorage.setItem(LS_USER, name);
      if ($("rememberChk").checked) {
        // already saved by LS_USER; this demo treats it the same
      }
      // update UI
      $("userNameDisplay").textContent = name;
      $("profileName").textContent = name;
      loginScreen.classList.add("hidden");
      app.classList.remove("hidden");
      renderAll();
    });
  }

  // initialize data storage if missing
  if (!localStorage.getItem(LS_VIDEOS)) {
    // start with few sample videos
    const sample = [
      {
        id: genId(),
        title: "Intro to Maths (Educational)",
        embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        uploader: "Admin",
        categories: ["Educational"],
        comments: []
      },
    ];
    writeJSON(LS_VIDEOS, sample);
  }
  if (!localStorage.getItem(LS_REQUESTS)) writeJSON(LS_REQUESTS, []);

  // wire UI controls
  setupUI();
  // initial render
  renderAll();
});

/* =========================
   ID generator
   ========================= */
function genId() { return 'id-' + Math.random().toString(36).slice(2,10); }

/* =========================
   THEME
   ========================= */
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(LS_THEME, next);
  updateThemeIcon();
}
function updateThemeIcon(){
  const btn = $("themeToggle");
  if (!btn) return;
  const cur = document.documentElement.getAttribute("data-theme");
  btn.textContent = cur === "light" ? "🌙" : "☀️";
}

/* =========================
   UI SETUP (menu, buttons)
   ========================= */
function setupUI(){
  // menu open/close
  const hamburger = $("hamburger");
  const side = $("sideMenu");
  const sideClose = $("sideClose");
  hamburger?.addEventListener("click", ()=> side.classList.add("open"));
  sideClose?.addEventListener("click", ()=> side.classList.remove("open"));
  // side buttons
  document.querySelectorAll(".menu-btn").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const action = e.currentTarget.getAttribute("data-action");
      openPanel(action);
      side.classList.remove("open");
    });
  });
  // theme toggle
  $("themeToggle")?.addEventListener("click", toggleTheme);
  // logout
  $("logoutBtn")?.addEventListener("click", logout);
  $("logoutBtn2")?.addEventListener("click", logout);

  // filter buttons
  document.querySelectorAll(".filter-btn").forEach(b=>{
    b.addEventListener("click",(e)=> {
      document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const cat = e.currentTarget.getAttribute("data-cat");
      renderVideos(cat);
    });
  });

  // FAB
  $("fabUpload")?.addEventListener("click", ()=> openPanel("upload"));

  // upload controls
  $("addVideoBtn")?.addEventListener("click", addVideoFromForm);
  $("cancelUploadBtn")?.addEventListener("click", ()=> openPanel("home"));

  // requests
  $("requestForm")?.addEventListener("submit", (e)=> {
    e.preventDefault();
    const txt = $("requestText").value.trim();
    if (!txt) return;
    const requests = readJSON(LS_REQUESTS, []);
    const user = localStorage.getItem(LS_USER) || "Anonymous";
    requests.unshift({ id:genId(), text: txt, user, time: Date.now() });
    writeJSON(LS_REQUESTS, requests);
    $("requestText").value = "";
    renderRequests();
  });

  // profile logout (duplicate)
  $("logoutBtn2")?.addEventListener("click", logout);
}

/* =========================
   NAV / PANELS
   ========================= */
function openPanel(p){
  // hide all panels
  ["uploadPanel","requestsPanel","profilePanel"].forEach(id=>{
    const el = $(id); if (el) el.classList.add("hidden");
  });
  // show main video area by default
  const videoArea = $("videoArea");
  if (videoArea) videoArea.classList.remove("hidden");

  switch(p){
    case "upload":
      $("uploadPanel").classList.remove("hidden");
      videoArea.classList.add("hidden");
      break;
    case "requests":
      $("requestsPanel").classList.remove("hidden");
      videoArea.classList.add("hidden");
      renderRequests();
      break;
    case "profile":
      $("profilePanel").classList.remove("hidden");
      videoArea.classList.add("hidden");
      updateProfile();
      break;
    case "home":
    default:
      // show video area
      videoArea.classList.remove("hidden");
      break;
  }
}

/* =========================
   LOGOUT
   ========================= */
function logout(){
  if (!confirm("Logout?")) return;
  localStorage.removeItem(LS_USER);
  // keep data but reload to login screen
  location.reload();
}

/* =========================
   RENDER: VIDEOS
   ========================= */
function renderAll(){
  // default: show all
  renderVideos("all");
  renderRequests();
  updateProfile();
}

/* returns stored videos */
function loadVideos(){ return readJSON(LS_VIDEOS, []); }
function saveVideos(arr){ writeJSON(LS_VIDEOS, arr); }

/* render videos; cat = 'all' or category name */
function renderVideos(cat="all"){
  const area = $("videoArea");
  if (!area) return;
  area.innerHTML = ""; // clear

  const videos = loadVideos();
  const filtered = (cat === "all") ? videos : videos.filter(v => v.categories.includes(cat));

  if (filtered.length === 0){
    area.innerHTML = `<div class="panel"><p style="color:var(--muted)">No videos in this category yet.</p></div>`;
    return;
  }

  filtered.forEach(video => {
    const card = document.createElement("article");
    card.className = "video-card";

    // frame (YouTube embed or link preview)
    const frameWrap = document.createElement("div");
    frameWrap.className = "video-frame";

    // We'll support YouTube embeds. If embed URL exists, use iframe.
    // If it's an instagram link or other, we show clickable thumbnail-like link.
    if (video.embed && video.embed.includes("youtube.com/embed")) {
      const iframe = document.createElement("iframe");
      iframe.src = video.embed;
      iframe.setAttribute("allow","accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
      iframe.allowFullscreen = true;
      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      frameWrap.appendChild(iframe);
    } else if (video.embed && video.embed.includes("instagram.com")) {
      // graceful fallback: clickable embed link (Instagram needs their embed script for full embed)
      const a = document.createElement("a");
      a.href = video.embed;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Open on Instagram";
      a.style.display = "inline-block";
      a.style.padding = "14px";
      a.style.background = "var(--accent-solid)";
      a.style.color = "#fff";
      a.style.borderRadius = "8px";
      frameWrap.appendChild(a);
    } else {
      const a = document.createElement("a");
      a.href = video.originalUrl || "#";
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Open video";
      frameWrap.appendChild(a);
    }

    // metadata
    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h4");
    title.textContent = video.title;
    const uploader = document.createElement("p");
    uploader.className = "small";
    uploader.textContent = `By ${video.uploader} — ${video.categories.join(", ")}`;
    meta.appendChild(title);
    meta.appendChild(uploader);

    // delete video button (only uploader)
    if ((localStorage.getItem(LS_USER) || "") === video.uploader) {
      const del = document.createElement("button");
      del.className = "btn";
      del.style.marginLeft = "8px";
      del.textContent = "Delete";
      del.onclick = ()=> {
        if (!confirm("Delete this video?")) return;
        const all = loadVideos().filter(v=>v.id !== video.id);
        saveVideos(all);
        renderVideos(getActiveFilter());
      };
      meta.appendChild(del);
    }

    // comments
    const commentsWrap = document.createElement("div");
    commentsWrap.className = "comments";
    const commentList = document.createElement("ul");
    commentList.className = "comment-list";
    (video.comments || []).forEach((c)=>{
      const li = document.createElement("li");
      li.className = "comment";
      li.innerHTML = `<div><strong>${escapeHtml(c.user)}</strong> <span style="color:var(--muted);font-size:12px;margin-left:6px">${timeAgo(c.time)}</span></div>
                      <div style="margin-top:6px">${escapeHtml(c.text)}</div>`;
      // delete comment by owner
      if ((localStorage.getItem(LS_USER) || "") === c.user) {
        const dbtn = document.createElement("button");
        dbtn.className = "btn";
        dbtn.style.marginTop = "6px";
        dbtn.textContent = "Delete";
        dbtn.onclick = ()=>{
          const all = loadVideos();
          const vv = all.find(x=>x.id===video.id);
          vv.comments = vv.comments.filter(cc => cc !== c);
          saveVideos(all);
          renderVideos(getActiveFilter());
        };
        li.appendChild(dbtn);
      }
      commentList.appendChild(li);
    });

    // comment input
    const commentRow = document.createElement("div");
    commentRow.className = "comment-row";
    const commentInput = document.createElement("input");
    commentInput.placeholder = "Add a comment...";
    const commentBtn = document.createElement("button");
    commentBtn.textContent = "Post";
    commentBtn.onclick = () => {
      const text = commentInput.value.trim();
      if (!text) return;
      const user = localStorage.getItem(LS_USER) || "Anonymous";
      const all = loadVideos();
      const vv = all.find(x=>x.id===video.id);
      vv.comments = vv.comments || [];
      vv.comments.unshift({ user, text, time: Date.now() });
      saveVideos(all);
      renderVideos(getActiveFilter());
    };
    commentRow.appendChild(commentInput);
    commentRow.appendChild(commentBtn);

    // assembly
    card.appendChild(frameWrap);
    card.appendChild(meta);
    card.appendChild(commentsWrap);
    commentsWrap.appendChild(commentList);
    commentsWrap.appendChild(commentRow);

    // attach
    $("videoArea").appendChild(card);
  });
}

/* helper for active filter */
function getActiveFilter(){
  const active = document.querySelector(".filter-btn.active");
  return active ? active.getAttribute("data-cat") : "all";
}

/* =========================
   HELPER: safe HTML escape
   ========================= */
function escapeHtml(s){
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

/* =========================
   ADD VIDEO (from form)
   ========================= */
function addVideoFromForm(){
  const title = $("videoTitle").value.trim();
  const url = $("videoUrl").value.trim();
  if (!title || !url){
    alert("Provide title and a YouTube/Instagram URL.");
    return;
  }

  // categories
  const cats = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(i=>i.value);
  if (cats.length === 0){ alert("Pick at least one category."); return; }

  // detect youtube id
  let embed = "";
  let originalUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    embed = "https://www.youtube.com/embed/" + ytMatch[1];
  } else if (url.includes("instagram.com")) {
    embed = url; // we'll open link; full embed requires Instagram script
  } else {
    // try to accept embed directly
    if (url.includes("youtube.com/embed")) embed = url;
    else { alert("Only YouTube or Instagram links are supported in this demo."); return; }
  }

  const user = localStorage.getItem(LS_USER) || "Anonymous";
  const v = {
    id: genId(),
    title,
    embed,
    originalUrl,
    uploader: user,
    categories: cats,
    comments: []
  };
  const all = loadVideos();
  all.unshift(v); // newest first
  saveVideos(all);

  // reset form & go home
  $("videoTitle").value = "";
  $("videoUrl").value = "";
  document.querySelectorAll('input[name="cat"]').forEach(cb=>cb.checked=false);
  openPanel("home");
  // re-render using active filter
  renderVideos(getActiveFilter());
}

/* =========================
   REQUESTS
   ========================= */
function renderRequests(){
  const list = $("requestList");
  if (!list) return;
  list.innerHTML = "";
  const requests = readJSON(LS_REQUESTS, []);
  if (requests.length === 0) {
    list.innerHTML = `<li class="request-item" style="color:var(--muted)">No requests yet.</li>`;
    return;
  }
  requests.forEach(r => {
    const li = document.createElement("li");
    li.className = "request-item";
    li.innerHTML = `<div><strong>${escapeHtml(r.user)}</strong> — ${escapeHtml(r.text)}</div>`;
    // allow delete by requester
    if ((localStorage.getItem(LS_USER) || "") === r.user) {
      const del = document.createElement("button");
      del.className = "btn";
      del.textContent = "Delete";
      del.onclick = () => {
        const arr = readJSON(LS_REQUESTS, []).filter(x => x.id !== r.id);
        writeJSON(LS_REQUESTS, arr);
        renderRequests();
      };
      li.appendChild(del);
    }
    list.appendChild(li);
  });
}

/* =========================
   PROFILE
   ========================= */
function updateProfile(){
  const name = localStorage.getItem(LS_USER) || "—";
  $("profileName").textContent = name;
  const vids = loadVideos().filter(v=>v.uploader === name).length;
  $("profileCount").textContent = vids;
}

/* =========================
   SMALL HELPERS
   ========================= */
function timeAgo(ts){
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts)/1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  return Math.floor(s/86400) + "d ago";
}