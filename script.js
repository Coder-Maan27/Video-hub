// === LOGIN LOGIC ===
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (document.body.classList.contains("login-page")) {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", username);
      window.location.href = "index.html";
    });
  } else {
    if (!isLoggedIn) {
      window.location.href = "login.html";
    }
  }
});

// === HAMBURGER MENU ===
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    sideMenu.style.left = sideMenu.style.left === "0px" ? "-200px" : "0px";
  });
}

// === LOGOUT ===
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  });
}

// === THEME TOGGLE ===
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    }
  });
}

// === SAMPLE VIDEOS ===
const videos = [
  {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Educational Video",
    uploader: "Alice",
    categories: ["educational"]
  },
  {
    url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
    title: "Personal Video",
    uploader: "Bob",
    categories: ["personal", "sports"]
  }
];

function renderVideos() {
  videos.forEach((video, idx) => {
    video.categories.forEach(cat => {
      const list = document.getElementById(cat + "List");
      if (list) {
        const card = document.createElement("div");
        card.className = "video-card";
        card.innerHTML = `
          <iframe src="${video.url}" allowfullscreen></iframe>
          <p><strong>${video.title}</strong> by ${video.uploader}</p>
          <div class="comment-box">
            <input type="text" placeholder="Add comment..." id="comment-${idx}-${cat}">
            <button onclick="addComment(${idx}, '${cat}')">Post</button>
          </div>
          <ul id="comments-${idx}-${cat}"></ul>
        `;
        list.appendChild(card);
      }
    });
  });
}
if (document.querySelector("main")) renderVideos();

// === COMMENTS ===
function addComment(idx, cat) {
  const input = document.getElementById(`comment-${idx}-${cat}`);
  const list = document.getElementById(`comments-${idx}-${cat}`);
  if (input.value.trim() !== "") {
    const li = document.createElement("li");
    li.textContent = `${localStorage.getItem("username")}: ${input.value}`;
    list.appendChild(li);
    input.value = "";
  }
}

// === REQUESTS ===
const requestForm = document.getElementById("requestForm");
const requestList = document.getElementById("requestList");
if (requestForm) {
  requestForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = document.getElementById("requestText").value;
    const li = document.createElement("li");
    li.textContent = `${localStorage.getItem("username")}: ${text}`;
    requestList.appendChild(li);
    requestForm.reset();
  });
}