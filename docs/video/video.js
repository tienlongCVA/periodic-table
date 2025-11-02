document.getElementById("Home").addEventListener("click", () => {
  window.location.href = "../index.html";
});

const btnAll = document.getElementById("btnAll");
const btnVN = document.getElementById("btnVN");
const btnEN = document.getElementById("btnEN");

const vnVideos = document.querySelectorAll(".video-card.vn");
const enVideos = document.querySelectorAll(".video-card.en");

function showVideos(showVN, showEN) {
  const allVideos = [...vnVideos, ...enVideos];

  // Cho video trượt ra
  allVideos.forEach(v => {
    v.classList.remove("slide-in");
    v.classList.add("slide-out");
  });

  setTimeout(() => {
    allVideos.forEach(v => {
      v.style.display = "none";
      if ((showVN && v.classList.contains("vn")) ||
          (showEN && v.classList.contains("en"))) {
        v.style.display = "block";
        v.classList.remove("slide-out");
        v.classList.add("slide-in");
      }
    });
  }, 300);
}

btnAll.addEventListener("click", () => showVideos(true, true));
btnVN.addEventListener("click", () => showVideos(true, false));
btnEN.addEventListener("click", () => showVideos(false, true));
