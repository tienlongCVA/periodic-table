let quizData = []; // Mảng chứa dữ liệu câu hỏi
const container = document.getElementById("exercise-container");
const submitButton = document.getElementById("submit");
const timerContainer = document.getElementById("timer");

const modal = document.getElementById("modal");
const modalQuestion = document.getElementById("modal-question");
const modalOptions = document.getElementById("modal-options");
const closeModal = document.getElementById("close-modal");

const resultModal = document.getElementById("result-modal");
const resultContent = document.getElementById("result-content");
const closeResultModal = document.getElementById("close-result-modal");

let selectedAnswers = {}; // Lưu các câu trả lời đã chọn
let timeLeft = 30 * 60; // 30 phút tính bằng giây
let timer;

// Tải dữ liệu câu hỏi từ file quizData.json
fetch('quizData.json')
    .then(response => response.json())
    .then(data => {
        quizData = data; // Gán dữ liệu từ JSON vào mảng quizData
        loadQuiz(); // Gọi hàm loadQuiz khi dữ liệu đã được tải xong
    })
    .catch(error => {
        console.error("Error loading quiz data:", error);
    });

// Tải câu hỏi và tạo các thẻ bài
function loadQuiz() {
    quizData.forEach((quiz, index) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `<div class="card-title">${quiz.question}</div>`;

        // Hiển thị modal khi bấm vào thẻ bài
        card.addEventListener("click", () => {
            openModal(index);
        });

        container.appendChild(card);
    });
}

// Mở modal hiển thị nội dung câu hỏi
function openModal(index) {
    const quiz = quizData[index];
    modalQuestion.textContent = quiz.question;

    modalOptions.innerHTML = quiz.options
        .map(
            (option, i) => `
            <label>
                <input type="radio" name="question${index}" value="${i}" 
                ${selectedAnswers[index] === i ? "checked" : ""}>
                ${option}
            </label><br>`
        )
        .join("");

    // Lưu câu trả lời khi chọn
    modalOptions.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", (e) => {
            selectedAnswers[index] = parseInt(e.target.value);
        });
    });

    modal.style.display = "block";
}

// Đóng modal câu hỏi
function closeModalHandler() {
    modal.style.display = "none";
}

// Tính điểm dựa trên câu trả lời đúng
function calculateScore() {
    let score = 0;
    const totalQuestions = quizData.length;
    const pointsPerQuestion = 10 / totalQuestions; // Mỗi câu sẽ có điểm bằng tổng điểm chia cho số câu hỏi

    quizData.forEach((quiz, index) => {
        // Kiểm tra nếu người dùng chọn đáp án đúng
        if (selectedAnswers[index] === quiz.answer) {
            score += pointsPerQuestion; // Cộng điểm cho câu trả lời đúng
        }
    });

    return score.toFixed(2); // Làm tròn điểm đến 2 chữ số thập phân
}

// Hiển thị kết quả trong popup
function showResult() {
    const score = calculateScore();
    let resultHTML = `<p><strong>Điểm của bạn:</strong> ${score}/10</p>`;
    resultHTML += "<p><strong>Đáp án:</strong></p><ul>";

    quizData.forEach((quiz, index) => {
        const isCorrect = selectedAnswers[index] === quiz.answer;
        resultHTML += `
            <li>
                <strong>${quiz.question}</strong><br>
                Đáp án đúng: ${quiz.options[quiz.answer]}<br>
                Bạn chọn: ${
                    selectedAnswers[index] !== undefined
                        ? quiz.options[selectedAnswers[index]]
                        : "Không chọn"
                } (${isCorrect ? "Đúng" : "Sai"})
            </li>`;
    });

    resultHTML += "</ul>";
    resultContent.innerHTML = resultHTML;
    resultModal.style.display = "block"; // Hiển thị popup kết quả
}

// Cập nhật bộ đếm thời gian
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerContainer.textContent = `Thời gian còn lại: ${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    if (timeLeft <= 0) {
        clearInterval(timer);
        finishQuiz();
    }
    timeLeft--;
}

// Hàm kết thúc bài thi
function finishQuiz() {
    submitButton.disabled = true; // Vô hiệu hóa nút nộp sau khi nộp
    clearInterval(timer);
    disableChoices(); // Vô hiệu hóa các lựa chọn sau khi nộp bài
    showResult(); // Hiển thị kết quả sau khi nộp bài
}

// Vô hiệu hóa tất cả các lựa chọn đáp án
function disableChoices() {
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.disabled = true; // Vô hiệu hóa tất cả radio buttons
    });
}


// Đóng modal kết quả
closeResultModal.addEventListener("click", () => {
    resultModal.style.display = "none"; // Đóng popup kết quả khi nhấn X
});

window.addEventListener("click", (e) => {
    if (e.target === resultModal) resultModal.style.display = "none"; // Đóng nếu click ngoài modal
});

// Đóng modal câu hỏi
closeModal.addEventListener("click", closeModalHandler);
window.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler(); // Đóng nếu click ngoài modal
});

// Khởi chạy bài thi khi dữ liệu đã được tải
timer = setInterval(updateTimer, 1000);

// Lắng nghe sự kiện click vào nút nộp bài
submitButton.addEventListener("click", finishQuiz);
