document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'admin' && password === '123456789') {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = "/periodic-table/";  
  } else {
    document.getElementById('errorMessage').innerText = "Sai thông tin đăng nhập!";
  }
});
