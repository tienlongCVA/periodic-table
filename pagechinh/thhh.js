function showElementDetails(name, symbol, number, mass) {
    document.getElementById("element-name").innerText = name;
    document.getElementById("element-symbol").innerText = symbol;
    document.getElementById("element-number").innerText = number;
    document.getElementById("element-mass").innerText = mass;

    document.getElementById("element-details").style.display = "block";
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