// Khai báo thời gian làm bài (900 giây)
let timeLeft = 120;
const countdownElement = document.getElementById("countdown");
const submitButton = document.getElementById("submitBtn");

// Hàm cập nhật đồng hồ đếm ngược
function updateCountdown() {
    if (timeLeft > 0) {
        timeLeft--;
        countdownElement.textContent = timeLeft;
    } else {
        // Hết giờ -> vô hiệu hóa nút nộp bài
        clearInterval(timer);
        submitButton.disabled = true;
        alert("Hết giờ! Bạn không thể nộp bài nữa.");
    }
}

// Khởi động bộ đếm giờ
const timer = setInterval(updateCountdown, 1000);

// Hàm xử lý khi người dùng nhấn nút "Nộp bài"
submitButton.addEventListener("click", function () {
    submitButton.disabled = true; // Đóng băng nút để tránh gian lận
    clearInterval(timer); // Dừng đồng hồ khi đã nộp bài

    let score = 0;
    const answers = {
        q1: "D",
        q2: "A",
        q3: "A",
        q4: "B",
        q5: "D",
        q6: "C",
        q7: "D",
        q8: "A",
        q9: "A",
        q10: "C"
    };

    // Lấy câu trả lời của người dùng
    const formData = new FormData(document.getElementById("quizForm"));

    // Kiểm tra đáp án
    for (let [question, answer] of Object.entries(answers)) {
        if (formData.get(question) === answer) {
            score++;
        }
    }

    // Hiển thị kết quả
    document.getElementById("result").textContent = `Bạn đạt ${score}/10 điểm!`;
});
