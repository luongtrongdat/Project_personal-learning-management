document.addEventListener("DOMContentLoaded", function () {
    let lessonTableBody = document.getElementById("lesson-table-body");
    let addLessonBtn = document.getElementById("add-lesson-btn");
    let addLessonModal = document.getElementById("add-lesson-modal");
    let closeModal = document.querySelector(".close");
    let addLessonForm = document.getElementById("add-lesson-form");
    let statusFilter = document.getElementById("status-filter");
    let paginationContainer = document.getElementById("pagination");

    let lessons = [
        { id: 1, name: "Lập trình C", duration: 24, status: "active" },
        { id: 2, name: "Lập trình Frontend với ReactJS", duration: 44, status: "inactive" },
        { id: 3, name: "Lập trình Backend với Spring Boot", duration: 24, status: "active" },
        { id: 4, name: "Lập trình Frontend với VueJS", duration: 44, status: "inactive" },
        { id: 5, name: "Lập trình C", duration: 24, status: "active" },
        { id: 6, name: "Lập trình Frontend với ReactJS", duration: 44, status: "inactive" },
        { id: 7, name: "Lập trình Backend với Spring Boot", duration: 24, status: "active" },
        { id: 8, name: "Lập trình Frontend với VueJS", duration: 44, status: "inactive" },
        { id: 9, name: "Lập trình C", duration: 24, status: "active" },
        { id: 10, name: "Lập trình Frontend với ReactJS", duration: 44, status: "inactive" },
        { id: 11, name: "Lập trình Backend với Spring Boot", duration: 24, status: "active" },
        { id: 12, name: "Lập trình Frontend với VueJS", duration: 44, status: "inactive" },
        { id: 13, name: "Lập trình C", duration: 24, status: "active" },
        { id: 14, name: "Lập trình Frontend với ReactJS", duration: 44, status: "inactive" },
        { id: 15, name: "Lập trình Backend với Spring Boot", duration: 24, status: "active" },
        { id: 16, name: "Lập trình Frontend với VueJS", duration: 44, status: "inactive" },
    ];
    let nextLessonId = 17;
    let lessonsPerPage = 5;
    let currentPage = 1;

    function createLessonRow(lesson) {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" name="" id="">${lesson.name}</td>
            <td>${lesson.duration}</td>
            <td><span class="${lesson.status}">${lesson.status === "active" ? "● Đang hoạt động" : "● Ngừng hoạt động"}</span></td>
            <td>
                <button class="delete" data-lesson-id="${lesson.id}"><img src="../Asset/Icon/Icon/Button.png" alt=""></button>
                <button class="edit"><img src="../Asset/Icon/Icon/pen.png" alt=""></button>
            </td>
        `;
        return row;
    }
    function renderLessons() {
        lessonTableBody.innerHTML = "";
        let startIndex = (currentPage - 1) * lessonsPerPage;
        let endIndex = startIndex + lessonsPerPage;
        let lessonsToRender = lessons.slice(startIndex, endIndex);
        lessonsToRender.forEach(lesson => {
            let row = createLessonRow(lesson);
            lessonTableBody.appendChild(row);
        });
        addDeleteEventListeners();
    }

    function addDeleteEventListeners() {
        let deleteButtons = document.querySelectorAll(".delete");
        deleteButtons.forEach(button => {
            button.addEventListener("click", function () {
                let lessonId = this.dataset.lessonId;
                deleteLesson(lessonId);
            });
        });
    }

    function deleteLesson(lessonId) {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                let lessonIndex = lessons.findIndex(lesson => lesson.id == lessonId);
                if (lessonIndex !== -1) {
                    lessons.splice(lessonIndex, 1);
                    renderLessons();
                    renderPagination();
                    Swal.fire(
                        "Đã xóa!",
                        "Bài học đã được xóa.",
                        "success"
                    );
                }
            }
        });
    }

    // Show the modal when the "Add Lesson" button is clicked
    addLessonBtn.addEventListener("click", () => {
        addLessonModal.style.display = "block";
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener("click", () => {
        addLessonModal.style.display = "none";
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener("click", (event) => {
        if (event.target == addLessonModal) {
            addLessonModal.style.display = "none";
        }
    });

    // Handle form submission
    addLessonForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the form values
        let lessonName = document.getElementById("lesson-name").value;
        let lessonDuration = parseInt(document.getElementById("lesson-duration").value);
        let lessonStatus = document.getElementById("lesson-status").value;

        // Create a new lesson object
        let newLesson = {
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
        addLessonModal.style.display = "none";

        // Reset the form
        addLessonForm.reset();
    });

    //filter
    statusFilter.addEventListener("change", () => {
        let selectedStatus = statusFilter.value;
        filterLessons(selectedStatus);
    });

    function filterLessons(status) {
        currentPage = 1;
        let filteredLessons = status === "all" ? lessons : lessons.filter(lesson => lesson.status === status);
        renderLessonsByFilter(filteredLessons);
        renderPaginationByFilter(filteredLessons);
    }
    function renderLessonsByFilter(filteredLessons) {
        lessonTableBody.innerHTML = "";
        let startIndex = (currentPage - 1) * lessonsPerPage;
        let endIndex = startIndex + lessonsPerPage;
        let lessonsToRender = filteredLessons.slice(startIndex, endIndex);
        lessonsToRender.forEach(lesson => {
            let row = createLessonRow(lesson);
            lessonTableBody.appendChild(row);
        });
        addDeleteEventListeners();
    }
    function renderPaginationByFilter(filteredLessons) {
        paginationContainer.innerHTML = "";
        let totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement("button");
            button.textContent = i;
            button.addEventListener("click", () => {
                currentPage = i;
                renderLessonsByFilter(filteredLessons);
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        updatePaginationButtons();
    }
    function renderPagination() {
        paginationContainer.innerHTML = "";
        let totalPages = Math.ceil(lessons.length / lessonsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement("button");
            button.textContent = i;
            button.addEventListener("click", () => {
                currentPage = i;
                renderLessons();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        updatePaginationButtons();
    }

    function updatePaginationButtons() {
        let buttons = paginationContainer.querySelectorAll("button");
        buttons.forEach(button => {
            button.classList.remove("active");
        });
        buttons[currentPage - 1].classList.add("active");
    }

    // Initial rendering of lessons
    renderLessons();
    renderPagination();
});
