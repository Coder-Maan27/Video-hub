let currentUser = null;
let videos = JSON.parse(localStorage.getItem("videos")) || [];
let requests = JSON.parse(localStorage.getItem("requests")) || [];

function login() {
  const name = document.getElementById('username').value.trim();
  if (name) {
    currentUser = name;
    localStorage.setItem("currentUser", name);

    document.getElementById('currentUser').textContent = name;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');

    renderVideos();
    renderRequests();
  } else {
    alert("Enter your name to login!");
  }
}

// Auto-login if saved user exists
window.onload = function () {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    document.getElementById('currentUser').textContent = savedUser;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    renderVideos();
    renderRequests();
  }
};

function shareVideo() {
  const url = document.getElementById('videoUrl').value.trim();
  if (!url) return alert("Enter a video URL!");

  const video = {
    url,
    user: currentUser,
    comments: []
  };

  videos.push(video);
  localStorage.setItem("videos", JSON.stringify(videos));

  document.getElementById('videoUrl').value = "";
  renderVideos();
}

function renderVideos() {
  const list = document.getElementById('videoList');
  list.innerHTML = "";
  videos.forEach((v, index) => {
    const div = document.createElement('div');
    div.className = "video-card";

    let embedUrl = v.url;
    if (v.url.includes("youtube.com/watch?v=")) {
      embedUrl = v.url.replace("watch?v=", "embed/");
    } else if (v.url.includes("youtu.be")) {
      embedUrl = v.url.replace("youtu.be/", "youtube.com/embed/");
    }

    div.innerHTML = `
      <p>Shared by: <b>${v.user}</b></p>
      <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
      <div class="comments">
        <h4>Comments</h4>
        <div id="comments-${index}">
          ${v.comments.map(c => `<div class="comment"><b>${c.user}:</b> ${c.text}</div>`).join("")}
        </div>
        <input type="text" id="commentInput-${index}" placeholder="Write a comment...">
        <button onclick="addComment(${index})">Post</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function addComment(index) {
  const input = document.getElementById(`commentInput-${index}`);
  const text = input.value.trim();
  if (!text) return;

  videos[index].comments.push({ user: currentUser, text });
  localStorage.setItem("videos", JSON.stringify(videos));

  input.value = "";
  renderVideos();
}

function addRequest() {
  const req = document.getElementById('requestText').value.trim();
  if (!req) return;

  requests.push({ user: currentUser, text: req });
  localStorage.setItem("requests", JSON.stringify(requests));

  document.getElementById('requestText').value = "";
  renderRequests();
}

function renderRequests() {
  const list = document.getElementById('requestList');
  list.innerHTML = "";
  requests.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.user}: ${r.text}`;
    list.appendChild(li);
  });
}