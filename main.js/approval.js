const maxRequestsPerPage = 8;
const totalPages = 1000;
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear() + 543; 
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function countBorrowedTimes(studentId) {
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.filter(request => request.studentId === studentId).length;
}

function loadRequests(page) {
    const requestsTable = document.getElementById('requestsTable');
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    // Clear previous rows except the header  ลบแถวก่อนหน้า ยกเว้นส่วนหัว
    requestsTable.querySelectorAll('tr:not(:first-child)').forEach(row => row.remove());

    // Calculate start and end for pagination
    const start = (page - 1) * maxRequestsPerPage;
    const end = start + maxRequestsPerPage;
    const paginatedRequests = requests.slice(start, end);

    paginatedRequests.forEach(request => {
        const row = requestsTable.insertRow();
        row.className = request.status === 'อนุมัติ' ? 'table-custom-approved' :
                        request.status === 'ปฏิเสธ' ? 'table-custom-denied' :
                        request.status === 'คืนแล้ว' ? 'table-custom-returned' : ''; 
    
        const formattedDateTime = formatDate(request.dateTime);
    
       row.insertCell(0).innerText = formattedDateTime;
        row.insertCell(1).innerText = request.studentId;
        row.insertCell(2).innerText = request.studentName;
        row.insertCell(3).innerText = request.equipment;
        row.insertCell(4).innerText = request.type;
        row.insertCell(5).innerText = request.status;
    
        const returnDateTime = request.returnDateTime ? formatDate(request.returnDateTime) : '-';
        row.insertCell(6).innerText = returnDateTime;
        
        row.insertCell(7).innerText = request.staffName || '-'; // Add staff name to the table

        const actionCell = row.insertCell(8);
        // Add number of times borrowed  จำนวนการยืม
        // const borrowedTimesCell = row.insertCell(9);
        // borrowedTimesCell.innerText = countBorrowedTimes(request.studentId);
    
        // Add buttons based on status เพิ่มปุ่มตามสถานะ
        if (request.status === 'รออนุมัติ') {
            const approveButton = document.createElement('button');
            approveButton.innerText = 'อนุมัติ';
            approveButton.className = 'btn btn-success btn-sm mr-2';
            approveButton.onclick = () => updateRequestStatus(request.id, 'อนุมัติ');
    
            const denyButton = document.createElement('button');
            denyButton.innerText = 'ปฏิเสธ';
            denyButton.className = 'btn btn-danger btn-sm';
            denyButton.onclick = () => updateRequestStatus(request.id, 'ปฏิเสธ');
            
            actionCell.appendChild(approveButton);
            actionCell.appendChild(denyButton);
        } 
    });
    
    // Update pagination buttons
    updatePaginationInfo(page, totalPages);
}

function updatePaginationInfo(page, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    // Create First Page Button
    const firstButton = document.createElement('button');
    firstButton.className = 'btn btn-primary btn-sm';
    firstButton.innerText = 'หน้าแรก';
    if (page <= 1) {
        firstButton.classList.add('disabled');
    }
    firstButton.onclick = () => {
        if (page > 1) {
            currentPage = 1;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };
    paginationContainer.appendChild(firstButton);

    // Create Previous Button
    const prevButton = document.createElement('button');
    prevButton.id = 'prevPage';
    prevButton.className = 'btn btn-secondary btn-sm mx-1';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (page <= 1) {
        prevButton.classList.add('disabled');
    }
    prevButton.onclick = () => {
        if (page > 1) {
            currentPage--;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Calculate the range of page numbers to display
    const maxButtons = 5; // Display fewer page numbers for a cleaner look
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Create Number Buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'btn btn-outline-primary btn-sm mx-1';
        if (i === page) {
            pageButton.classList.add('active');
        }
        pageButton.innerText = i;
        pageButton.onclick = () => {
            currentPage = i;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        };
        paginationContainer.appendChild(pageButton);
    }

    // Create Next Button
    const nextButton = document.createElement('button');
    nextButton.id = 'nextPage';
    nextButton.className = 'btn btn-secondary btn-sm mx-1';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (page >= totalPages) {
        nextButton.classList.add('disabled');
    }
    nextButton.onclick = () => {
        if (page < totalPages) {
            currentPage++;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };
    paginationContainer.appendChild(nextButton);

    // Create Last Page Button
    const lastButton = document.createElement('button');
    lastButton.className = 'btn btn-primary btn-sm';
    lastButton.innerText = 'หน้าสุดท้าย';
    if (page >= totalPages) {
        lastButton.classList.add('disabled');
    }
    lastButton.onclick = () => {
        if (page < totalPages) {
            currentPage = totalPages;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };
    paginationContainer.appendChild(lastButton);
}




// ฟังก์ชันสำหรับอัปเดตสถานะ
// ฟังก์ชันสำหรับอัปเดตสถานะ
function updateRequestStatus(id, status) {
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    let updatedRequest;

    requests = requests.map(request => {
        if (request.id === id) {
            updatedRequest = { ...request, status };
            return updatedRequest;
        }
        return request;
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    if (status === 'อนุมัติ') {
        // แสดงการโหลดขณะส่งคำขอ
        Swal.fire({
            title: 'กำลังส่งคำขอ...',
            text: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // ส่งข้อมูลไปยัง Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbxvtdP0WK9IHDy06cMDoHrBWW1-yliO8pVXVK66TKhTWubSQwBPkOjKuHUONTpQQIjb/exec', {
            method: 'POST',
            body: new URLSearchParams({ 
                dateTime: updatedRequest.dateTime,
                studentId: updatedRequest.studentId,
                studentName: updatedRequest.studentName,
                equipment: updatedRequest.equipment,
                staffName: updatedRequest.staffName
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then(response => response.text())
        .then(data => {
            console.log(data); // For debugging purposes
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'คำขอถูกอนุมัติแล้ว',
                confirmButtonText: 'ตกลง'
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'การส่งข้อมูลไปยัง Google Sheets ล้มเหลว',
                confirmButtonText: 'ตกลง'
            });
        });
    } else {
        // แสดงแจ้งเตือนเมื่อปฏิเสธคำขอ
        Swal.fire({
            icon: 'warning',
            title: 'คำขอถูกปฏิเสธ',
            text: 'คำขอนี้ถูกปฏิเสธแล้ว',
            confirmButtonText: 'ตกลง'
        });
    }

    // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าจอ
    loadRequests(currentPage);
}




// ฟังก์ชันสำหรับแก้ไขคำขอ
function editRequest(id) {
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    const statusSelect = document.getElementById('statusSelect');
    const requestId = document.getElementById('requestId');
    
    requestId.value = id;
    statusSelect.value = '';
    modal.show();
}

// ฟังก์ชันสำหรับอัปเดตสถานะใหม่ในคำขอ
function updateStatus() {
    const statusSelect = document.getElementById('statusSelect');
    const requestId = document.getElementById('requestId').value;
    const newStatus = statusSelect.value;

    if (newStatus) {
        let requests = JSON.parse(localStorage.getItem('requests')) || [];
        requests = requests.map(request => {
            if (request.id === parseInt(requestId, 10)) {
                return { ...request, status: newStatus };
            }
            return request;
        });
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequests(currentPage);
        
        // แสดงข้อความแจ้งเตือนหลังจากอัปเดตสถานะ
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'คำขอถูกแก้ไขแล้ว',
            confirmButtonText: 'ตกลง'
        });
        bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณาเลือกสถานะที่ถูกต้อง',
            confirmButtonText: 'ตกลง'
        });
    }
}

// เมื่อมีการลบคำขอ
function deleteRequest(id) {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            requests = requests.filter(request => request.id !== id);
            localStorage.setItem('requests', JSON.stringify(requests));
            loadRequests(currentPage);

            // แสดงข้อความแจ้งเตือนหลังจากลบคำขอ
            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'คำขอถูกลบแล้ว',
                confirmButtonText: 'ตกลง'
            });
        }
    });
}

// เมื่อมีการลบคำขอทั้งหมดในหน้านี้
function deleteAllRequests() {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอทั้งหมดในหน้านี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            const start = (currentPage - 1) * maxRequestsPerPage;
            const end = start + maxRequestsPerPage;

            // กรองคำขอที่ไม่อยู่ในหน้านี้ออก
            requests = requests.filter((_, index) => index < start || index >= end);

            localStorage.setItem('requests', JSON.stringify(requests));
            loadRequests(currentPage);

            // แสดงข้อความแจ้งเตือนหลังจากลบคำขอทั้งหมดในหน้านี้
            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'คำขอทั้งหมดในหน้านี้ถูกลบแล้ว',
                confirmButtonText: 'ตกลง'
            });
        }
    });
}

// เรียกใช้ฟังก์ชันเมื่อเริ่มต้น
window.onload = () => {
    loadRequests(currentPage);
    updatePaginationInfo(currentPage, totalPages);
};
