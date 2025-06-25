document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'tienlongCVA' && password === 'long10pen') {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = "/docs/index.html";
  } else {
    document.getElementById('errorMessage').innerText = "Sai thông tin đăng nhập!";
  }
});
    