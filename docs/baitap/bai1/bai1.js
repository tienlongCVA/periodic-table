/* ---------------------
   Firebase Configuration
   --------------------- */
// Nạp script Firebase từ CDN (Dùng bản Compat để giữ nguyên logic của bạn)
const firebaseScripts = [
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"
];

function loadFirebase(callback) {
    let loaded = 0;
    firebaseScripts.forEach(src => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            loaded++;
            if (loaded === firebaseScripts.length) callback();
        };
        document.head.appendChild(script);
    });
}


const firebaseConfig = {
  apiKey: "AIzaSyBOAsuFx2EOV60cbyQ6CETPXQ4vv6c5aoI",
  authDomain: "trang-mo-phong-3d-bthhh.firebaseapp.com",
  databaseURL: "https://trang-mo-phong-3d-bthhh-default-rtdb.firebaseio.com",
  projectId: "trang-mo-phong-3d-bthhh",
  storageBucket: "trang-mo-phong-3d-bthhh.firebasestorage.app",
  messagingSenderId: "331870971692",
  appId: "1:331870971692:web:ca84647275e7da36642e89",
  measurementId: "G-YNNZV77S3Q"
};

let db;

loadFirebase(() => {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("Firebase đã sẵn sàng!");
});

/* ---------------------
   Hàm đẩy dữ liệu lên Firebase
   --------------------- */
function saveResultToFirebase(finalScore, summaryData) {
    if (!db) return console.error("Firebase chưa tải xong!");
    
    const resultRef = db.ref('quiz_results');
    const newResultRef = resultRef.push();
    
    newResultRef.set({
        user: "Tien Long", // Có thể tùy biến sau
        score: finalScore,
        totalQuestions: questions.length,
        timestamp: new Date().toLocaleString("vi-VN"),
        details: summaryData
    }).then(() => {
        console.log("✅ Dữ liệu đã được đẩy lên Firebase thành công!");
    }).catch(err => {
        console.error("❌ Lỗi khi đẩy dữ liệu:", err);
    });
}

/* ---------------------
   Global vars (Giữ nguyên của bạn)
   --------------------- */
function goBack() {
  window.location.href = "../baitap.html";
}

let questions = [];
let index = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let summary = []; 

const questionEl = document.querySelector(".question");
const optionsEl = document.querySelector(".options");
const interactiveEl = document.querySelector(".interactive");
const scoreEl = document.querySelector(".score");
const timerFill = document.querySelector(".timer-fill");
const endScreen = document.querySelector(".end-screen");
const finalScoreEl = document.querySelector(".final-score");

/* ---------------------
   Load & shuffle
   --------------------- */
fetch("bai1.json")
  .then(res => res.json())
  .then(data => {
    questions = shuffleArray(data || []);
    // startQuiz() sẽ được gọi khi nhấn Bắt đầu ở màn hình Start
  })
  .catch(err => {
    console.error("Lỗi tải JSON:", err);
    questionEl.textContent = "Lỗi tải dữ liệu câu hỏi.";
  });

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const countdownEl = document.getElementById("countdown");

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  let count = 3;
  countdownEl.style.display = "block";
  countdownEl.textContent = count;

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countdown);
      startScreen.style.display = "none";
      startQuiz();
    }
  }, 1000);
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------------
   Start / show question
   --------------------- */
function startQuiz() {
  index = 0;
  score = 0;
  summary = [];
  scoreEl.textContent = `Điểm: ${score}`;
  endScreen.style.display = "none";
  document.querySelector(".timer-bar").style.display = "block";
  showQuestion();
}

function showQuestion() {
  clearInterval(timer);
  interactiveEl.innerHTML = "";
  optionsEl.innerHTML = "";

  if (!questions.length) {
    questionEl.textContent = "Không có câu hỏi.";
    return;
  }

  const q = questions[index];
  questionEl.textContent = q.question || "—";

  const oldImg = document.querySelector(".question-image");
  if (oldImg) oldImg.remove();

  if (q.image) {
    const img = document.createElement("img");
    img.src = q.image;
    img.className = "question-image";
    img.alt = "minh họa";
    questionEl.insertAdjacentElement("afterend", img);
  }

  optionsEl.style.display = q.type === "multiple" ? "flex" : "none";
  interactiveEl.style.display = q.type !== "multiple" ? "block" : "none";

  if (q.type === "multiple") {
    (q.options || []).forEach((opt, i) => {
      const btn = document.createElement("div");
      btn.className = "option";
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(i, btn);
      optionsEl.appendChild(btn);
    });
  } else if (q.type === "fill") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "blank";
    input.placeholder = "Nhập đáp án";
    const btn = document.createElement("button");
    btn.className = "blank-btn";
    btn.textContent = "Nộp";
    btn.onclick = () => {
        btn.disabled = true;
        btn.style.opacity = "0.6";
        clearInterval(timer);
        const given = input.value.trim();
        const correctAns = (q.answer || "").toString();
        let isCorrect = given.toLowerCase() === correctAns.toLowerCase();

        if (isCorrect) {
            input.classList.add("correct");
            score += 10;
        } else {
            input.classList.add("wrong");
            const ct = document.createElement("div");
            ct.className = "correct-answer";
            ct.textContent = `Đáp án đúng: ${correctAns}`;
            interactiveEl.appendChild(ct);
        }

        summary.push({
            question: q.question,
            correct: isCorrect,
            knowledge: q.knowledge || "Không có ghi chú.",
        });

        scoreEl.textContent = `Điểm: ${score}`;
        setTimeout(nextQuestion, 3000);
    };
    interactiveEl.appendChild(input);
    interactiveEl.appendChild(btn);
  } else if (q.type === "drag") {
    const items = Array.isArray(q.items) ? q.items.slice() : [];
    const shuffledItems = shuffleArray(items);
    const ul = document.createElement("ul");
    ul.className = "drag-list";
    shuffledItems.forEach(text => {
      const li = document.createElement("li");
      li.className = "drag";
      li.draggable = true;
      li.textContent = text;
      li.addEventListener("dragstart", e => {
        li.classList.add("dragging");
        e.dataTransfer.setData("text/plain", text);
      });
      li.addEventListener("dragend", () => li.classList.remove("dragging"));
      ul.appendChild(li);
    });

    ul.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      const after = getDragAfterElement(ul, e.clientY);
      if (!dragging) return;
      if (after == null) ul.appendChild(dragging);
      else ul.insertBefore(dragging, after);
    });

    const btn = document.createElement("button");
    btn.className = "blank-btn";
    btn.textContent = "Nộp";
    btn.onclick = () => {
      clearInterval(timer);
      const lis = [...ul.children];
      const correctArr = q.correct || q.order || q.itemsCorrect || q.items || [];
      let ok = true;
      lis.forEach((li, i) => {
        const expected = (correctArr[i] || "").toString();
        if (li.textContent.toString() === expected.toString()) {
          li.classList.add("correct");
        } else {
          li.classList.add("wrong");
          ok = false;
        }
      });
      if (ok) score += 10;
      else {
        const ct = document.createElement("div");
        ct.className = "correct-answer";
        ct.textContent = `Thứ tự đúng: ${correctArr.join(", ")}`;
        interactiveEl.appendChild(ct);
      }
      summary.push({ question: q.question, correct: ok, knowledge: q.knowledge || "Không có ghi chú." });
      scoreEl.textContent = `Điểm: ${score}`;
      setTimeout(nextQuestion, 3000);
    };
    interactiveEl.appendChild(ul);
    interactiveEl.appendChild(btn);
  }
  startTimerForQuestion();
}

function startTimerForQuestion(duration = 15) {
  clearInterval(timer);
  timeLeft = duration;
  timerFill.style.width = "100%";
  timer = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft < 0) timeLeft = 0;
    const percent = (timeLeft / duration) * 100;
    timerFill.style.width = percent + "%";
    
    if (percent < 30) timerFill.style.background = "linear-gradient(90deg,#d63031,#ff7675)";
    else if (percent < 60) timerFill.style.background = "linear-gradient(90deg,#fdcb6e,#ffeaa7)";
    else timerFill.style.background = "linear-gradient(90deg,#00b894,#55efc4)";

    if (timeLeft <= 0) {
      clearInterval(timer);
      const q = questions[index];
      // Xử lý khi hết thời gian (như cũ)
      summary.push({ question: q.question, correct: false, knowledge: q.knowledge || "Không có ghi chú." });
      setTimeout(nextQuestion, 3000);
    }
  }, 100);
}

function selectAnswer(i, btn) {
  clearInterval(timer);
  const q = questions[index];
  const opts = document.querySelectorAll(".option");
  opts.forEach(o => (o.style.pointerEvents = "none"));
  let correct = (i === q.answer);
  if (correct) {
    btn.classList.add("correct");
    score += 10;
  } else {
    btn.classList.add("wrong");
    if (opts && opts[q.answer]) opts[q.answer].classList.add("correct");
  }
  summary.push({ question: q.question, correct, knowledge: q.knowledge || "Không có ghi chú." });
  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".drag:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function nextQuestion() {
  index++;
  if (index < questions.length) showQuestion();
  else endQuiz();
}

function endQuiz() {
  clearInterval(timer);
  
  // 🚀 ĐẨY DỮ LIỆU LÊN FIREBASE TRƯỚC KHI RENDER KẾT QUẢ
  saveResultToFirebase(score, summary);

  document.querySelector(".timer-bar").style.display = "none";
  questionEl.style.display = "none";
  optionsEl.style.display = "none";
  interactiveEl.style.display = "none";
  document.body.classList.add("quiz-finished");

  const correctCount = summary.filter(s => s.correct).length;
  const wrongCount = summary.length - correctCount;

  const container = document.createElement("div");
  container.className = "final-knowledge";
  container.innerHTML = `
    <h2>🎯 KẾT QUẢ CUỐI CÙNG</h2>
    <p><b>Tổng điểm:</b> ${score} / ${questions.length * 10}</p>
    <p>✅ <b>Số câu đúng:</b> ${correctCount}</p>
    <p>❌ <b>Số câu sai:</b> ${wrongCount}</p>
    <hr>
    <h3>📘 Kiến thức cần ôn lại:</h3>
  `;

  const wrongList = summary.filter(s => !s.correct);
  if (wrongList.length === 0) {
    container.innerHTML += `<p>Tuyệt vời! Bạn đã làm đúng tất cả 🎉</p>`;
  } else {
    wrongList.forEach((s, i) => {
      container.innerHTML += `
        <div class="review-item">
          <p><b>Câu ${i + 1}:</b> ${s.question}</p>
          <p class="knowledge">💡 ${s.knowledge}</p>
          <hr>
        </div>`;
    });
  }

  const retry = document.createElement("button");
  retry.textContent = "🔁 Làm lại bài";
  retry.className = "retry-btn";
  retry.onclick = () => location.reload();
  container.appendChild(retry);

  document.body.innerHTML = "";
  document.body.appendChild(container);
}