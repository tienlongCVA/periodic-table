document.getElementById("Home").addEventListener("click", () => {
  window.location.href = "../index.html";
});

// Chức năng lọc video
const btnAll = document.getElementById("btnAll");
const btnVN = document.getElementById("btnVN");
const btnEN = document.getElementById("btnEN");

const vnVideos = document.querySelectorAll(".video-card.vn");
const enVideos = document.querySelectorAll(".video-card.en");

btnAll.addEventListener("click", () => {
  vnVideos.forEach(v => v.style.display = "block");
  enVideos.forEach(v => v.style.display = "block");
});

btnVN.addEventListener("click", () => {
  vnVideos.forEach(v => v.style.display = "block");
  enVideos.forEach(v => v.style.display = "none");
});

btnEN.addEventListener("click", () => {
  vnVideos.forEach(v => v.style.display = "none");
  enVideos.forEach(v => v.style.display = "block");
});
