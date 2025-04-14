let userLogoutBtn = document.getElementById('user-logout-btn');
userLogoutBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = './login.html';
        }
    });
});