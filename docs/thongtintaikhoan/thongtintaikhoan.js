// Hàm hiển thị ảnh khi chọn file từ máy tính
function previewAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("avatar").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Hàm chỉnh sửa thông tin cá nhân
function editProfile() {
  let newName = prompt("Nhập tên mới:", document.getElementById("username").innerText);
  let newEmail = prompt("Nhập email mới:", document.getElementById("email").innerText);
  let newDob = prompt("Nhập ngày sinh mới:", document.getElementById("dob").innerText);
  let newGender = prompt("Nhập giới tính (Nam/Nữ):", document.getElementById("gender").innerText);

  if (newName) document.getElementById("username").innerText = newName;
  if (newEmail) document.getElementById("email").innerText = newEmail;
  if (newDob) document.getElementById("dob").innerText = newDob;
  if (newGender) document.getElementById("gender").innerText = newGender;
}
