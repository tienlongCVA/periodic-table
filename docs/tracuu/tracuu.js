function goBack() {
  window.location.href = "../index.html"; // Quay lại bảng tuần hoàn
}

// Load dữ liệu từ file JSON
async function loadTerms() {
  try {
    const res = await fetch("tracuu.json");
    const data = await res.json();

    const list = document.getElementById("termsList");
    list.innerHTML = "";

    Object.keys(data).forEach(term => {
      const div = document.createElement("div");
      div.className = "term";
      div.innerHTML = `
        <h3>${term}</h3>
        <p>${data[term]}</p>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Không thể load terms.json", err);
  }
}

// Tìm kiếm
document.addEventListener("DOMContentLoaded", () => {
  loadTerms();

  document.getElementById("searchInput").addEventListener("input", function () {
    let filter = this.value.toLowerCase();
    let terms = document.getElementsByClassName("term");
    Array.from(terms).forEach(t => {
      let text = t.textContent.toLowerCase();
      t.style.display = text.includes(filter) ? "" : "none";
    });
  });
});
