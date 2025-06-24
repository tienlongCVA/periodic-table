document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;
    
    if (username && email && password) {
        document.getElementById('signupMessage').innerText = 'Account created successfully!';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        document.getElementById('signupMessage').innerText = 'Please fill in all fields';
    }
});
