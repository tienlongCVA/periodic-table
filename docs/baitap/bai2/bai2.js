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
let timeLeft = 0; // globale để start/clear giữa các hàm

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
fetch("bai2.json")
  .then(res => res.json())
  .then(data => {
    questions = shuffleArray(data || []);
    startQuiz();
  })
  .catch(err => {
    console.error("Lỗi tải JSON:", err);
    questionEl.textContent = "Lỗi tải dữ liệu câu hỏi.";
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
  scoreEl.textContent = `Điểm: ${score}`;
  endScreen.style.display = "none";
  document.querySelector(".timer-bar").style.display = "block";
  showQuestion();
}

function showQuestion() {
  // Dọn dẹp interval trước khi render
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
if (oldImg) oldImg.remove(); // Xóa ảnh cũ nếu có

if (q.image) {
  const img = document.createElement("img");
  img.src = q.image;
  img.className = "question-image";
  img.alt = "minh họa";
  // Chèn ảnh sau phần câu hỏi
  questionEl.insertAdjacentElement("afterend", img);
}


  // đảm bảo hiển thị/ẩn vùng option hoặc interactive đúng
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
      // Dừng timer khi nộp
      clearInterval(timer);

      const given = input.value.trim();
      const correctAns = (q.answer || "").toString();

      if (given.toLowerCase() === correctAns.toLowerCase()) {
        input.classList.add("correct");
        score += 10;
      } else {
        input.classList.add("wrong");
        // hiển thị đáp án đúng
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
    // q.items là mảng ban đầu (trộn nếu muốn)
    // q.correct là mảng thứ tự đúng
    const items = Array.isArray(q.items) ? q.items.slice() : [];
    // nếu muốn hiển thị shuffled order to user, shuffle items copy:
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
  // dừng timer và vô hiệu hoá thao tác
  clearInterval(timer);

  const ulChildren = [...ul.children];
  // lấy mảng đáp án đúng: ưu tiên q.correct, q.order, q.itemsCorrect
  const correctArr = (q.correct || q.order || q.itemsCorrect || q.items || []).map(x => String(x).trim());
  
  // bảo vệ: nếu không có correctArr thì báo lỗi ra console và hiển thị
  if (!correctArr.length) {
    console.warn("Không tìm thấy mảng đáp án đúng (correct/order/itemsCorrect) trong câu:", q);
    const ct = document.createElement("div");
    ct.className = "correct-answer";
    ct.textContent = `Không có đáp án đúng trong dữ liệu (kiểm tra JSON).`;
    interactiveEl.appendChild(ct);
    setTimeout(nextQuestion, 3000);
    return;
  }

  // disable drag và nút sau khi nộp
  ulChildren.forEach(li => {
    li.draggable = false;
    li.style.cursor = "default";
  });
  btn.disabled = true;
  btn.style.opacity = "0.6";

  let ok = true;
  ulChildren.forEach((li, idx) => {
    const shown = String(li.textContent || "").trim();
    const expected = String(correctArr[idx] || "").trim();
    // so sánh chuẩn hoá (không phân biệt hoa thường)
    if (shown.toLowerCase() === expected.toLowerCase()) {
      li.classList.add("correct");
    } else {
      li.classList.add("wrong");
      ok = false;
    }
  });

  if (ok) {
    score += 10;
  } else {
    const ct = document.createElement("div");
    ct.className = "correct-answer";
    ct.textContent = `Thứ tự đúng: ${correctArr.join(" → ")}`;
    interactiveEl.appendChild(ct);
  }

  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
};


    interactiveEl.appendChild(ul);
    interactiveEl.appendChild(btn);
  }

  // Bắt đầu timer cho câu này
  startTimerForQuestion();
}

/* ---------------------
   Timer (global timeLeft)
   --------------------- */
function startTimerForQuestion(duration = 10) {
  // xóa interval cũ (phòng trường hợp)
  clearInterval(timer);
  timeLeft = duration;
  timerFill.style.width = "100%";
  timerFill.style.background = "linear-gradient(90deg,#00b894,#55efc4)";

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
      // khi hết giờ: hiển thị đáp án đúng tùy theo loại câu
      const q = questions[index];

      if (q.type === "multiple") {
        const opts = document.querySelectorAll(".option");
        if (opts && opts[q.answer]) opts[q.answer].classList.add("correct");
        // disable click
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

        // highlight li (nếu có ul)
        const ul = interactiveEl.querySelector(".drag-list");
        if (ul) {
          const lis = [...ul.children];
          lis.forEach((li, i) => {
            const expected = (correctArr[i] || "").toString();
            if (li.textContent.toString() === expected.toString()) li.classList.add("correct");
            else li.classList.add("wrong");
          });
        }
      }

      setTimeout(nextQuestion, 3000);
    }
  }, 100);
}

/* ---------------------
   Multiple select handler
   --------------------- */
function selectAnswer(i, btn) {
  clearInterval(timer);
  const q = questions[index];
  const opts = document.querySelectorAll(".option");
  opts.forEach(o => (o.style.pointerEvents = "none"));

  if (i === q.answer) {
    btn.classList.add("correct");
    score += 10;
  } else {
    btn.classList.add("wrong");
    if (opts && opts[q.answer]) opts[q.answer].classList.add("correct");
  }
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
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/* ---------------------
   Next / End
   --------------------- */
function nextQuestion() {
  index++;
  if (index < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  clearInterval(timer);
  questionEl.style.display = "none";
  optionsEl.style.display = "none";
  interactiveEl.style.display = "none";
  document.querySelector(".timer-bar").style.display = "none";
  endScreen.style.display = "flex";
  finalScoreEl.textContent = `Tổng điểm: ${score} / ${questions.length * 10}`;
}
