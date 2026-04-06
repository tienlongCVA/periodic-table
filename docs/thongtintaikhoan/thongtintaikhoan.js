window.onload = function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (isLoggedIn === "true") {
        // Lấy dữ liệu từ bộ nhớ
        const userName = localStorage.getItem("userName");
        const userID = localStorage.getItem("userID");
        const userDob = localStorage.getItem("userDob");
        const userGender = localStorage.getItem("userGender");

        // Đổ dữ liệu vào giao diện HTML
        document.getElementById("username").innerText = userName;
        document.getElementById("email").innerText = "Mã số thẻ: " + userID;
        
        // Cập nhật ngày sinh và giới tính
        if (document.getElementById("dob")) {
            document.getElementById("dob").innerText = userDob;
        }
        if (document.getElementById("gender")) {
            document.getElementById("gender").innerText = userGender;
        }

        // Kiểm tra ảnh đại diện cũ
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar) {
            document.getElementById("avatar").src = savedAvatar;
        }
    } else {
        window.location.href = "login.html";
    }
};

// Hàm hiển thị ảnh khi chọn file và LƯU LẠI vào máy
function previewAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      document.getElementById("avatar").src = imageData;
      
      // Lưu ảnh vào localStorage để khi F5 hoặc quay lại vẫn còn ảnh này
      localStorage.setItem("userAvatar", imageData);
    };
    reader.readAsDataURL(file);
  }
}

// Chỉnh sửa lại hàm editProfile để thông báo dữ liệu này là cố định từ thẻ
function editProfile() {
  alert("Họ tên và Mã số thẻ được đồng bộ từ hệ thống thẻ học sinh và không thể thay đổi thủ công.");
}