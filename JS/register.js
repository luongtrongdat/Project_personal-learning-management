document.addEventListener('DOMContentLoaded', function () {
    let form = document.getElementById('registrationForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        let isValid = true;
        let errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.textContent = '');
        let surname = document.getElementById('surname').value.trim();
        if (surname === '') {
            document.getElementById('surnameError').textContent = 'Họ và tên đệm không được để trống.';
            isValid = false;
        }
        let name = document.getElementById('name').value.trim();
        if (name === '') {
            document.getElementById('nameError').textContent = 'Tên không được để trống.';
            isValid = false;
        }
        let email = document.getElementById('email').value.trim();
        if (email === '') {
            document.getElementById('emailError').textContent = 'Email không được để trống.';
            isValid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Email không đúng định dạng. Phải chứa @ và kết thúc bằng .com hoặc .vn';
            isValid = false;
        }
        let password = document.getElementById('password').value.trim();
        if (password === '') {
            document.getElementById('passwordError').textContent = 'Mật khẩu không được để trống.';
            isValid = false;
        } else if (password.length < 8) {
            document.getElementById('passwordError').textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
            isValid = false;
        }
        let confirmPassword = document.getElementById('confirmPassword').value.trim();
        if (confirmPassword === '') {
            document.getElementById('confirmPasswordError').textContent = 'Xác nhận mật khẩu không được để trống.';
            isValid = false;
        } else if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Mật khẩu không trùng khớp.';
            isValid = false;
        }
        let termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            document.getElementById('termsError').textContent = 'Bạn phải đồng ý với chính sách và điều khoản.';
            isValid = false;
        }
        if (isValid) {
            let contact = JSON.parse(localStorage.getItem('contact')) || [];
            let id = contact.length > 0 ? contact[contact.length - 1].id + 1 : 1;
            let newRegistration = {
                id: id,
                surname: surname,
                name: name,
                email: email,
                password: password,
            };
            contact.push(newRegistration);
            localStorage.setItem('contact', JSON.stringify(contact));
            Swal.fire({
                icon: 'success',
                title: 'Đăng ký thành công!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = './login.html';
            });
        }
    });

    function isValidEmail(email) {
        let emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
        return emailRegex.test(email);
    }
});
