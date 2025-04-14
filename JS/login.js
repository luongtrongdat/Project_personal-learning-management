document.addEventListener('DOMContentLoaded', function () {
    let form = document.getElementById('loginForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let isValid = true;
        let errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.textContent = '');
        let email = document.getElementById('email').value.trim();
        let password = document.getElementById('password').value.trim();
        let contact = JSON.parse(localStorage.getItem('contact')) || [];
        let user = contact.find(user => user.email === email && user.password === password);
        if (email === '') {
            document.getElementById('emailError').textContent = 'Email không được bỏ trống.';
            isValid = false;
        } else if (!user) {
            document.getElementById('credentialError').textContent = 'Email hoặc mật khẩu không đúng.';
            isValid = false;
        }
        if (password === '') {
            document.getElementById('passwordError').textContent = 'Mật khẩu không được bỏ trống.';
            isValid = false;
        } else if (!user) {
            document.getElementById('credentialError').textContent = 'Email hoặc mật khẩu không đúng.';
            isValid = false;
        }
    
        if (isValid) {
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = './category-manager.html';
            });
        }
    });
});
