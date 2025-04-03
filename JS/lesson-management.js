document.addEventListener('DOMContentLoaded', function () {
    const lessonTableBody = document.getElementById('lesson-table-body');
    const addLessonBtn = document.getElementById('add-lesson-btn');
    const addLessonModal = document.getElementById('add-lesson-modal');
    const closeModal = document.querySelector('.close');
    const addLessonForm = document.getElementById('add-lesson-form');
    const statusFilter = document.getElementById('status-filter');
    const paginationContainer = document.getElementById('pagination');

    let lessons = [
        { id: 1, name: 'Lập trình C', duration: 24, status: 'active' },
        { id: 2, name: 'Lập trình Frontend với ReactJS', duration: 44, status: 'inactive' },
        { id: 3, name: 'Lập trình Backend với Spring Boot', duration: 24, status: 'active' },
        { id: 4, name: 'Lập trình Frontend với VueJS', duration: 44, status: 'inactive' },
        { id: 5, name: 'Lập trình C', duration: 24, status: 'active' },
        { id: 6, name: 'Lập trình Frontend với ReactJS', duration: 44, status: 'inactive' },
        { id: 7, name: 'Lập trình Backend với Spring Boot', duration: 24, status: 'active' },
        { id: 8, name: 'Lập trình Frontend với VueJS', duration: 44, status: 'inactive' },
        { id: 9, name: 'Lập trình C', duration: 24, status: 'active' },
        { id: 10, name: 'Lập trình Frontend với ReactJS', duration: 44, status: 'inactive' },
        { id: 11, name: 'Lập trình Backend với Spring Boot', duration: 24, status: 'active' },
        { id: 12, name: 'Lập trình Frontend với VueJS', duration: 44, status: 'inactive' },
        { id: 13, name: 'Lập trình C', duration: 24, status: 'active' },
        { id: 14, name: 'Lập trình Frontend với ReactJS', duration: 44, status: 'inactive' },
        { id: 15, name: 'Lập trình Backend với Spring Boot', duration: 24, status: 'active' },
        { id: 16, name: 'Lập trình Frontend với VueJS', duration: 44, status: 'inactive' },
    ];
    let nextLessonId = 17;
    const lessonsPerPage = 5;
    let currentPage = 1;

    function createLessonRow(lesson) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" name="" id="">${lesson.name}</td>
            <td>${lesson.duration}</td>
            <td><span class="${lesson.status}">${lesson.status === 'active' ? '● Đang hoạt động' : '● Ngừng hoạt động'}</span></td>
            <td>
                <button class="delete" data-lesson-id="${lesson.id}"><img src="../Asset/Icon/Button.png" alt=""></button>
                <button class="edit"><img src="../Asset/Icon/pen.png" alt=""></button>
            </td>
        `;
        return row;
    }

    function renderLessons() {
        lessonTableBody.innerHTML = "";
        const startIndex = (currentPage - 1) * lessonsPerPage;
        const endIndex = startIndex + lessonsPerPage;
        const lessonsToRender = lessons.slice(startIndex, endIndex);
        lessonsToRender.forEach(lesson => {
            const row = createLessonRow(lesson);
            lessonTableBody.appendChild(row);
        });
        addDeleteEventListeners();
    }

    function addDeleteEventListeners() {
        const deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const lessonId = this.dataset.lessonId;
                deleteLesson(lessonId);
            });
        });
    }

    function deleteLesson(lessonId) {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                const lessonIndex = lessons.findIndex(lesson => lesson.id == lessonId);
                if (lessonIndex !== -1) {
                    lessons.splice(lessonIndex, 1);
                    renderLessons();
                    renderPagination();
                    Swal.fire(
                        'Đã xóa!',
                        'Bài học đã được xóa.',
                        'success'
                    );
                }
            }
        });
    }

    // Show the modal when the "Add Lesson" button is clicked
    addLessonBtn.addEventListener('click', () => {
        addLessonModal.style.display = 'block';
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener('click', () => {
        addLessonModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target == addLessonModal) {
            addLessonModal.style.display = 'none';
        }
    });

    // Handle form submission
    addLessonForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the form values
        const lessonName = document.getElementById('lesson-name').value;
        const lessonDuration = parseInt(document.getElementById('lesson-duration').value);
        const lessonStatus = document.getElementById('lesson-status').value;

        // Create a new lesson object
        const newLesson = {
            id: nextLessonId++,
            name: lessonName,
            duration: lessonDuration,
            status: lessonStatus,
        };

        // Add the new lesson to the lessons array
        lessons.push(newLesson);

        // Re-render the table
        renderLessons();
        renderPagination();

        // Close the modal
        addLessonModal.style.display = 'none';

        // Reset the form
        addLessonForm.reset();
    });

    //filter
    statusFilter.addEventListener('change', () => {
        const selectedStatus = statusFilter.value;
        filterLessons(selectedStatus);
    });

    function filterLessons(status) {
        currentPage = 1;
        const filteredLessons = status === 'all' ? lessons : lessons.filter(lesson => lesson.status === status);
        renderLessonsByFilter(filteredLessons);
        renderPaginationByFilter(filteredLessons);
    }
    function renderLessonsByFilter(filteredLessons) {
        lessonTableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * lessonsPerPage;
        const endIndex = startIndex + lessonsPerPage;
        const lessonsToRender = filteredLessons.slice(startIndex, endIndex);
        lessonsToRender.forEach(lesson => {
            const row = createLessonRow(lesson);
            lessonTableBody.appendChild(row);
        });
        addDeleteEventListeners();
    }
    function renderPaginationByFilter(filteredLessons) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                renderLessonsByFilter(filteredLessons);
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        updatePaginationButtons();
    }
    function renderPagination() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(lessons.length / lessonsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                renderLessons();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        updatePaginationButtons();
    }

    function updatePaginationButtons() {
        const buttons = paginationContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        buttons[currentPage - 1].classList.add('active');
    }

    // Initial rendering of lessons
    renderLessons();
    renderPagination();
});
