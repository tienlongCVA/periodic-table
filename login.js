document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn form reload trang

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Kiểm tra username và password
    if (username === 'admin' && password === '123456') {
        // Hiển thị thông báo thành công
        document.getElementById('message').textContent = 'Login successful! Redirecting...';
        document.getElementById('message').style.color = 'green';

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = 'index.html'; // Tệp HTML mới
            }, 2000);
    } else {
        document.getElementById('message').textContent = 'Invalid username or password.';
        document.getElementById('message').style.color = 'red';
    }
});