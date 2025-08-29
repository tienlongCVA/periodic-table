function showElementDetails(name, symbol, number, mass) {
    // Mở trang element3d.html với query string
    const url = `element3d.html?name=${encodeURIComponent(name)}&number=${number}&mass=${mass}`;
    window.location.href = url;
}

function closeModal() {
    document.getElementById("element-details").style.display = "none";
}

// Close the modal when the user clicks anywhere outside the modal content
window.onclick = function(event) {
    let modal = document.getElementById("element-details");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function filterElements(type){
    // Lấy tất cả các ô trong bảng tuần hoàn 
    var elements = document.querySelectorAll('.element');

    //Nếu chọn 'all, hiện tất cả các nguyên tó
    if(type==='all'){
        elements.forEach(function(element){
            element.classList.remove('dimmed')
        }

        );
    }
    else{
        elements.forEach(function(element){
            //Kiểm tra nếu nguyên tố có lớp thuộc loại chọn
            if(element.classList.contains(type)){
                element.classList.remove('dimmed') // Hiện rõ các ô qua tâm
            }
            else{
                element.classList.add('dimmed'); // Làm mờ các ô không quan tâm
            }
        })       
    }
}
document.getElementById("logoutBtn").addEventListener("click", function() {
  // Xóa hết dữ liệu đăng nhập
  localStorage.removeItem("user");  
  // hoặc localStorage.clear(); nếu bạn lưu nhiều key
  
  // Quay về trang login
  window.location.href = "login/login.html";
});
