document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const validUsername = 'admin'; // ตั้ง ID
    const validPassword = '777'; // ตั้ง Password

    // ตรวจสอบชื่อผู้ใช้และรหัสผ่าน
    if (username === validUsername && password === validPassword) {
        // หากถูกต้อง ให้แสดง SweetAlert และเปลี่ยนเส้นทางไปยังหน้า borrow.html หลังจากผู้ใช้คลิกตกลง
        Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            text: 'คุณจะถูกนำไปยังหน้าถัดไป',
            confirmButtonText: 'ตกลง'
        }).then(() => {
            window.location.href = 'borrow.html';
        });
    } else {
        // หากไม่ถูกต้อง แสดงการแจ้งเตือนข้อผิดพลาด
        Swal.fire({
            icon: 'error',
            title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            text: 'กรุณาลองใหม่',
            confirmButtonText: 'ตกลง'
        });
    }
});
