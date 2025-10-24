
function goBack() {
  window.location.href = "../baitap.html"; // Quay lại bảng tuần hoàn
}

let questions = [];
let index=0, score=0, timer;

const questionEl = document.querySelector(".question");
const optionsEl = document.querySelector(".options");
const interactiveEl = document.querySelector(".interactive");
const scoreEl = document.querySelector(".score");
const timerFill = document.querySelector(".timer-fill");
const endScreen = document.querySelector(".end-screen");
const finalScoreEl = document.querySelector(".final-score");

fetch("test.json")
  .then(res=>res.json())
  .then(data=>{
    questions=data;
    startQuiz();
  });

function startQuiz(){
  index=0; score=0;
  showQuestion();
  startTimer();
}

function showQuestion(){
  clearInterval(timer);
  interactiveEl.innerHTML="";
  optionsEl.innerHTML="";
  const q = questions[index];
  questionEl.textContent = q.question;

  //chọn
  if(q.type==="multiple"){
    q.options.forEach((opt,i)=>{
      const btn=document.createElement("div");
      btn.classList.add("option");
      btn.textContent=opt;
      btn.onclick=()=>selectAnswer(i,btn);
      optionsEl.appendChild(btn);
    });
  } // điền khuyết
  else if(q.type==="fill"){
    const input=document.createElement("input");
    input.type="text";
    input.className="blank";
    input.placeholder="Nhập đáp án";
    const btn=document.createElement("button");
    btn.className="blank-btn";
    btn.textContent="Nộp";
    btn.onclick = () => {
  // Dừng thời gian khi nộp
  clearInterval(timer);

  // Kiểm tra đáp án
  if (q.type === "fill") {
    const val = input.value.trim().toLowerCase();
    const ans = q.answer.trim().toLowerCase();
    if (val === ans) input.classList.add("correct");
    else input.classList.add("wrong");
    if (correct) score += 10;
  }

  if (q.type === "drag") {
    const lis = [...ul.children];
    let correct = true;
    lis.forEach((li, i) => {
      if (li.textContent !== q.order[i]) { li.classList.add("wrong"); correct = false; }
      else li.classList.add("correct");
    });
    if (correct) score += 10;
  }

  if (q.type === "matching") {
    const items = interactiveEl.querySelectorAll(".item, .item-drop");
    items.forEach(item => item.style.pointerEvents = "none");
    // highlight đúng/sai đã xử lý trong drop
  }

  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
};

    interactiveEl.appendChild(input);
    interactiveEl.appendChild(btn); 
  } //kéo thả
  else if(q.type==="drag"){
    const ul=document.createElement("ul");
    ul.className="drag-list";
    q.order.forEach((item,i)=>{
      const li=document.createElement("li");
      li.draggable=true;
      li.dataset.index=i;
      li.textContent=item;
      li.addEventListener("dragstart", e=>{li.classList.add("dragging"); e.dataTransfer.setData("text/plain", i);});
      li.addEventListener("dragend", e=>{li.classList.remove("dragging");});
      ul.appendChild(li);
    });
    ul.addEventListener("dragover", e=>{
      e.preventDefault();
      const dragging=document.querySelector(".dragging");
      const afterEl=getDragAfterElement(ul,e.clientY);
      if(afterEl==null) ul.appendChild(dragging);
      else ul.insertBefore(dragging,afterEl);
    });
    const btn=document.createElement("button");
    btn.className="blank-btn";
    btn.textContent="Kiểm tra";
    btn.onclick = () => {
  // Dừng thời gian khi nộp
  clearInterval(timer);

  // Kiểm tra đáp án
  if (q.type === "fill") {
    const val = input.value.trim().toLowerCase();
    const ans = q.answer.trim().toLowerCase();
    if (val === ans) input.classList.add("correct");
    else input.classList.add("wrong");
  }

  if (q.type === "drag") {
    const lis = [...ul.children];
    let correct = true;
    lis.forEach((li, i) => {
      if (li.textContent !== q.order[i]) { li.classList.add("wrong"); correct = false; }
      else li.classList.add("correct");
    });
    if (correct) score += 10;
  }

  if (q.type === "matching") {
    const items = interactiveEl.querySelectorAll(".item, .item-drop");
    items.forEach(item => item.style.pointerEvents = "none");
    // highlight đúng/sai đã xử lý trong drop
  }

  scoreEl.textContent = `Điểm: ${score}`;
  setTimeout(nextQuestion, 3000);
};

    
    interactiveEl.appendChild(ul);
    interactiveEl.appendChild(btn);
  }

  startTimer();
}

function getDragAfterElement(container,y){
  const draggableElements=[...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest,child)=>{
    const box=child.getBoundingClientRect();
    const offset=y-(box.top+box.height/2);
    if(offset<0 && offset>closest.offset) return {offset:offset,element:child};
    else return closest;
  }, {offset:-Infinity}).element;
}

function selectAnswer(i,btn){
  clearInterval(timer);
  const q=questions[index];
  const options=document.querySelectorAll(".option");
  options.forEach(o=>o.style.pointerEvents="none");
  if(i===q.answer){btn.classList.add("correct"); score+=10;}
  else{btn.classList.add("wrong"); options[q.answer].classList.add("correct");}
  scoreEl.textContent=`Điểm: ${score}`;
  setTimeout(nextQuestion,2000); //thời gian hiện đáp án
}

function nextQuestion(){
  index++;
  if(index<questions.length) showQuestion();
  else endQuiz();
}

function startTimer(){
  clearInterval(timer);
  let timeLeft=10; //thời gian làm câu hỏi
  const totalTime=10;//thời gian làm câu hỏi
  timerFill.style.width="100%";
  timerFill.style.background="linear-gradient(90deg,#00b894,#55efc4)";
  timer=setInterval(()=>{
    timeLeft-=0.1;
    const percent=(timeLeft/totalTime)*100;
    timerFill.style.width=percent+"%";
    if(percent<60 && percent>=30) timerFill.style.background="linear-gradient(90deg,#fdcb6e,#ffeaa7)";
    else if(percent<30) timerFill.style.background="linear-gradient(90deg,#d63031,#ff7675)";
    if(timeLeft<=0){
      clearInterval(timer);
      const q=questions[index];
      const options=document.querySelectorAll(".option");
      if(q.type==="multiple") options[q.answer].classList.add("correct");
      setTimeout(nextQuestion,2000); //thời gian hiện đáp án
    }
  },100);
}

function endQuiz(){
  document.querySelector(".question").style.display="none";
  optionsEl.style.display="none";
  interactiveEl.style.display="none";
  document.querySelector(".timer-bar").style.display="none";
  endScreen.style.display="flex";
  finalScoreEl.textContent=`Tổng điểm: ${score} / ${questions.length*10}`;
}


function selectAnswer(i, btn) {
  const q = questions[index];
  const options = document.querySelectorAll(".option");
  options.forEach(o => o.style.pointerEvents = "none");

  // Dừng thời gian khi chọn
  clearInterval(timer);

  // Kiểm tra đáp án
  if (i === q.answer) {
    btn.classList.add("correct");
    score += 10;
  } else {
    btn.classList.add("wrong");
    options[q.answer].classList.add("correct");
  }
  scoreEl.textContent = `Điểm: ${score}`;

  // 3s sau tự chuyển câu hỏi
  setTimeout(nextQuestion, 3000);
}
