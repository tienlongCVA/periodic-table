function goBack() {
  window.location.href = "../baitap.html";
}

/* ---------------------
   Global vars
   --------------------- */
let questions = [];
let index = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let summary = []; // Lưu lại kết quả từng câu

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
    startQuiz();
    document.body.classList.remove("quiz-finished");
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

  // Hiển thị hình ảnh nếu có
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

  // MULTIPLE CHOICE
  if (q.type === "multiple") {
    (q.options || []).forEach((opt, i) => {
      const btn = document.createElement("div");
      btn.className = "option";
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(i, btn);
      optionsEl.appendChild(btn);
    });
  }

  // FILL-IN
  else if (q.type === "fill") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "blank";
    input.placeholder = "Nhập đáp án";
    const btn = document.createElement("button");
    btn.className = "blank-btn";
    btn.textContent = "Nộp";
    btn.onclick = () => {
  // ✅ Vô hiệu hoá nút ngay lập tức
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";

  // Dừng timer khi nộp
  clearInterval(timer);

  const given = input.value.trim();
  const correctAns = (q.answer || "").toString();

  if (given.toLowerCase() === correctAns.toLowerCase()) {
    input.classList.add("correct");
    score += 10;
  } else {
    input.classList.add("wrong");
    const ct = document.createElement("div");
    ct.className = "correct-answer";
    ct.textContent = `Đáp án đúng: ${correctAns}`;
    interactiveEl.appendChild(ct);
  }

  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
};

    interactiveEl.appendChild(input);
    interactiveEl.appendChild(btn);
  }

  // DRAG ORDER
  else if (q.type === "drag") {
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
      const correctArr =
        q.correct || q.order || q.itemsCorrect || q.items || [];
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

      summary.push({
        question: q.question,
        correct: ok,
        knowledge: q.knowledge || "Không có ghi chú.",
      });

      scoreEl.textContent = `Điểm: ${score}`;
      setTimeout(nextQuestion, 3000);
    };

    interactiveEl.appendChild(ul);
    interactiveEl.appendChild(btn);
  }

  startTimerForQuestion();
}

/* ---------------------
   Timer
   --------------------- */
function startTimerForQuestion(duration = 15) {
  clearInterval(timer);
  timeLeft = duration;
  timerFill.style.width = "100%";
  timerFill.style.background = "linear-gradient(90deg,#00b894,#55efc4)";

  timer = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft < 0) timeLeft = 0;
    const percent = (timeLeft / duration) * 100;
    timerFill.style.width = percent + "%";

    if (percent < 30)
      timerFill.style.background = "linear-gradient(90deg,#d63031,#ff7675)";
    else if (percent < 60)
      timerFill.style.background = "linear-gradient(90deg,#fdcb6e,#ffeaa7)";
    else
      timerFill.style.background = "linear-gradient(90deg,#00b894,#55efc4)";

    if (timeLeft <= 0) {
      clearInterval(timer);
      const q = questions[index];

      if (q.type === "multiple") {
        const opts = document.querySelectorAll(".option");
        if (opts && opts[q.answer]) opts[q.answer].classList.add("correct");
        opts.forEach(o => (o.style.pointerEvents = "none"));
      } else if (q.type === "fill") {
        const correctAns = q.answer || "";
        const ct = document.createElement("div");
        ct.className = "correct-answer";
        ct.textContent = `Đáp án đúng: ${correctAns}`;
        interactiveEl.appendChild(ct);
      } else if (q.type === "drag") {
        const correctArr = q.correct || q.order || q.itemsCorrect || q.items || [];
        const ct = document.createElement("div");
        ct.className = "correct-answer";
        ct.textContent = `Thứ tự đúng: ${correctArr.join(", ")}`;
        interactiveEl.appendChild(ct);
      }

      summary.push({
        question: q.question,
        correct: false,
        knowledge: q.knowledge || "Không có ghi chú.",
      });

      setTimeout(nextQuestion, 3000);
    }
  }, 100);
}

/* ---------------------
   Multiple handler
   --------------------- */
function selectAnswer(i, btn) {
  clearInterval(timer);
  const q = questions[index];
  const opts = document.querySelectorAll(".option");
  opts.forEach(o => (o.style.pointerEvents = "none"));
  let correct = false;
  if (i === q.answer) {
    btn.classList.add("correct");
    score += 10;
    correct = true;
  } else {
    btn.classList.add("wrong");
    if (opts && opts[q.answer]) opts[q.answer].classList.add("correct");
  }

  summary.push({
    question: q.question,
    correct,
    knowledge: q.knowledge || "Không có ghi chú.",
  });

  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
}

/* ---------------------
   Drag helper
   --------------------- */
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".drag:not(.dragging)")];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      else return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/* ---------------------
   Next / End
   --------------------- */
function nextQuestion() {
  index++;
  if (index < questions.length) showQuestion();
  else endQuiz();
}

/* ---------------------
   End Quiz
   --------------------- */
function endQuiz() {
  clearInterval(timer);
  document.querySelector(".timer-bar").style.display = "none";
  questionEl.style.display = "none";
  optionsEl.style.display = "none";
  interactiveEl.style.display = "none";
  endScreen.style.display = "none";
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
    const p = document.createElement("p");
    p.textContent = "Tuyệt vời! Bạn đã làm đúng tất cả 🎉";
    container.appendChild(p);
  } else {
    wrongList.forEach((s, i) => {
      const item = document.createElement("div");
      item.className = "review-item";
      item.innerHTML = `
        <p><b>Câu ${i + 1}:</b> ${s.question}</p>
        <p class="knowledge">💡 ${s.knowledge}</p>
        <hr>
      `;
      container.appendChild(item);
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
