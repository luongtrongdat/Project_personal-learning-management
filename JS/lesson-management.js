document.addEventListener("DOMContentLoaded", function () {
    let lessonTableBody = document.getElementById("lesson-table-body");
    let addLessonBtn = document.getElementById("add-lesson-btn");
    let addLessonModal = document.getElementById("add-lesson-modal");
    let closeModalBtn = document.querySelector(".modal .close");
    let addLessonForm = document.getElementById("add-lesson-form");
    let categoryFilterSelect = document.getElementById("category-filter");
    let statusFilterSelect = document.getElementById("status-filter"); 
    let paginationContainer = document.getElementById("pagination");
    let searchInput = document.getElementById("search-input");
    let searchIcon = document.getElementById("search-icon");
    let lessonCategoryModalSelect = document.getElementById("lesson-category-modal"); 
    let LESSONS_STORAGE_KEY = 'lessonsData';
    let NEXT_ID_STORAGE_KEY = 'nextLessonId';
    let CATEGORIES_STORAGE_KEY = 'categoriesData';

    let lessons = [];
    let categories = [];
    let nextLessonId = 1;
    let lessonsPerPage = 5;
    let currentPage = 1;
    let currentCategoryFilter = "all";
    let currentStatusFilter = "all"; 
    let currentSearchTerm = ""; 
    let searchTimeout; 

    function loadCategoriesFromStorage() {
        let storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (storedCategories) {
            try {
                let parsed = JSON.parse(storedCategories);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.error("Error parsing categories from localStorage:", e);
            }
        }
        console.warn("No valid categories found in localStorage. Using default examples.");
        let defaultCategories = [
            { id: 1, name: "HTML" },
            { id: 2, name: "CSS" },
            { id: 3, name: "JavaScript Basic" },
            { id: 4, name: "ReactJS" },
            { id: 5, name: "JAVA" },
        ];
        return defaultCategories;
    }

    // function saveCategoriesToStorage(categoriesToSave) {
    //      try {
    //         localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    //     } catch (e) {
    //         console.error("Error saving categories to localStorage:", e);
    //     }
    // }


    function getLessonsFromStorage() {
        let storedLessons = localStorage.getItem(LESSONS_STORAGE_KEY);
        if (storedLessons) {
            try {
                let parsedLessons = JSON.parse(storedLessons);
                return Array.isArray(parsedLessons) ? parsedLessons : getDefaultLessons();
            } catch (e) {
                console.error("Error parsing lessons from localStorage:", e);
                localStorage.removeItem(LESSONS_STORAGE_KEY);
                return getDefaultLessons();
            }
        } else {
            return getDefaultLessons();
        }
    }

    function getDefaultLessons() {
        return [
            { id: 1, subject_id: 1, lesson_name: "Session 01: Tổng quan về HTML", time: 24, status: "complete" },
            { id: 2, subject_id: 1, lesson_name: "Session 02: Thẻ Inline và Block", time: 44, status: "incomplete" }, // HTML
            { id: 3, subject_id: 1, lesson_name: "Session 03: Thẻ hình ảnh", time: 24, status: "complete" }, // HTML
            { id: 4, subject_id: 1, lesson_name: "Session 05: Thẻ Semantic", time: 44, status: "incomplete" }, // HTML
            { id: 5, subject_id: 2, lesson_name: "Session 01: Tổng quan về CSS", time: 24, status: "complete" },
            { id: 6, subject_id: 2, lesson_name: "Session 02: Nhúng CSS vào trang Web", time: 44, status: "incomplete" }, // CSS
            { id: 7, subject_id: 2, lesson_name: "Session 03: Position", time: 24, status: "complete" }, // CSS
            { id: 8, subject_id: 2, lesson_name: "Session 05: Flexbox", time: 44, status: "incomplete" }, // CSS
            { id: 9, subject_id: 3, lesson_name: "Session 01: Tổng quan về JAVASCRIPT", time: 24, status: "complete" },
            { id: 10, subject_id: 3, lesson_name: "Session 02: Khai báo biến", time: 44, status: "incomplete" }, // JS
            { id: 11, subject_id: 3, lesson_name: "Session 03: Câu lệnh điều kiện", time: 24, status: "complete" }, // JS
            { id: 12, subject_id: 3, lesson_name: "Session 05: Vòng lặp", time: 44, status: "incomplete" }, // JS
            { id: 13, subject_id: 5, lesson_name: "Session 01: Tổng quan về JAVA", time: 24, status: "complete" }, // JAVA
            { id: 14, subject_id: 5, lesson_name: "Session 02: Mảng", time: 44, status: "incomplete" }, // JAVA
            { id: 15, subject_id: 2, lesson_name: "Session 03: Animation", time: 24, status: "complete" }, // CSS (Example)
        ];
    }

    function getNextIdFromStorage(currentLessons) {
        let storedNextId = localStorage.getItem(NEXT_ID_STORAGE_KEY);
        if (storedNextId) {
            let nextId = parseInt(storedNextId, 10);
            let maxId = currentLessons.length > 0 ? Math.max(...currentLessons.map(l => l.id)) : 0;
            return Math.max(nextId, maxId + 1);
        } else {
            return currentLessons.length > 0 ? Math.max(...currentLessons.map(l => l.id)) + 1 : 1;
        }
    }

    function saveToStorage(lessonsToSave, nextIdToSave) {
        try {
            localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessonsToSave));
            localStorage.setItem(NEXT_ID_STORAGE_KEY, nextIdToSave.toString());
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            Swal.fire("Lỗi", "Không thể lưu dữ liệu vào bộ nhớ cục bộ. Bộ nhớ có thể đã đầy.", "error");
        }
    }


    function createLessonRow(lesson) {
        let row = document.createElement("tr");
        row.dataset.lessonId = lesson.id;

        let cellName = row.insertCell();
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'lesson-select';
        checkbox.value = lesson.id;
        checkbox.style.marginRight = '8px';
        cellName.appendChild(checkbox);
        cellName.appendChild(document.createTextNode(lesson.lesson_name));

        let cellCategory = row.insertCell();
        let category = categories.find(cat => cat.id === lesson.subject_id);
        cellCategory.textContent = category ? category.name : 'N/A'; 

        let cellTime = row.insertCell();
        cellTime.textContent = `${lesson.time} phút`; 

        let cellStatus = row.insertCell();
        let statusSpan = document.createElement('span');
        statusSpan.classList.add(lesson.status === 'complete' ? 'active' : 'inactive');
        statusSpan.textContent = lesson.status === "complete" ? "● Hoàn thành" : "● Chưa hoàn thành";
        cellStatus.appendChild(statusSpan);

        let cellActions = row.insertCell();
        cellActions.style.textAlign = 'center';

        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.dataset.lessonId = lesson.id;
        deleteButton.innerHTML = '<img src="../Asset/Icon/Icon/Button.png" alt="Delete">';
        deleteButton.title = "Xóa bài học";

        let editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.dataset.lessonId = lesson.id;
        editButton.innerHTML = '<img src="../Asset/Icon/Icon/pen.png" alt="Edit">';
        editButton.title = "Sửa bài học";

        cellActions.appendChild(deleteButton);
        cellActions.appendChild(editButton);

        return row;
    }

    function renderTable() {
        lessonTableBody.innerHTML = "";

        let filteredLessons = lessons;
        if (currentCategoryFilter !== "all") {
            let categoryIdFilter = parseInt(currentCategoryFilter, 10);
            filteredLessons = filteredLessons.filter(lesson => lesson.subject_id === categoryIdFilter);
        }

        if (currentStatusFilter !== "all") {
            filteredLessons = filteredLessons.filter(lesson => lesson.status === currentStatusFilter);
        }

        if (currentSearchTerm) {
            let searchTermLower = currentSearchTerm.toLowerCase();
            filteredLessons = filteredLessons.filter(lesson =>
                lesson.lesson_name.toLowerCase().includes(searchTermLower)
            );
        }

        let totalFilteredLessons = filteredLessons.length;
        let totalPages = Math.ceil(totalFilteredLessons / lessonsPerPage);

        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }

        let startIndex = (currentPage - 1) * lessonsPerPage;
        let endIndex = startIndex + lessonsPerPage;
        let lessonsToRender = filteredLessons.slice(startIndex, endIndex);

        if (lessonsToRender.length > 0) {
            let thead = lessonTableBody.closest('table').querySelector('thead tr');
            if (thead && thead.children.length === 4) { 
                 let thCategory = document.createElement('th');
                 thCategory.textContent = 'Môn học';
                 thead.insertBefore(thCategory, thead.children[1]);

                 let arrow1 = document.getElementById('arrow-down');
                 let arrow2 = document.getElementById('arrow_down');
                 if(arrow1) arrow1.style.left = '/* New position */'; 
                 if(arrow2) arrow2.style.left = '/* New position */'; 
            }


            lessonsToRender.forEach(lesson => {
                let row = createLessonRow(lesson);
                lessonTableBody.appendChild(row);
            });
        } else {
             let thead = lessonTableBody.closest('table').querySelector('thead tr');
             if (thead && thead.children.length === 4) {
                 let thCategory = document.createElement('th');
                 thCategory.textContent = 'Môn học';
                 thead.insertBefore(thCategory, thead.children[1]);
             }

            let noDataRow = lessonTableBody.insertRow();
            let cell = noDataRow.insertCell();
            cell.colSpan = 5; 
            cell.textContent = "Không tìm thấy bài học phù hợp.";
            if (!currentSearchTerm && currentCategoryFilter === 'all' && currentStatusFilter === 'all' && lessons.length === 0) {
                 cell.textContent = "Chưa có bài học nào.";
            }
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            cell.style.color = "#666";
        }

        renderPagination(totalFilteredLessons);
    }

    function renderPagination(totalItems) {
        paginationContainer.innerHTML = "";
        let totalPages = Math.ceil(totalItems / lessonsPerPage);

        if (totalPages <= 1) return;

        let createButton = (pageNumber, text = pageNumber, isActive = false, isDisabled = false) => {
            let button = document.createElement("button");
            button.textContent = text;
            button.disabled = isDisabled;
            if (isActive) button.classList.add("active");
            if (!isDisabled) {
                button.addEventListener("click", () => {
                    currentPage = pageNumber;
                    renderTable();
                });
            }
            return button;
        };

        paginationContainer.appendChild(createButton(currentPage - 1, '‹', false, currentPage === 1));

        let maxVisibleButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - maxVisibleButtons + 1);
        }

        if (startPage > 1) {
            paginationContainer.appendChild(createButton(1));
            if (startPage > 2) {
                let ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationContainer.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.appendChild(createButton(i, i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                let ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationContainer.appendChild(ellipsis);
            }
            paginationContainer.appendChild(createButton(totalPages));
        }

        paginationContainer.appendChild(createButton(currentPage + 1, '›', false, currentPage === totalPages));
    }


    function handleDeleteLesson(lessonId) {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                let lessonIdNum = parseInt(lessonId, 10);
                let lessonIndex = lessons.findIndex(lesson => lesson.id === lessonIdNum);

                if (lessonIndex !== -1) {
                    lessons.splice(lessonIndex, 1);
                    saveToStorage(lessons, nextLessonId);
                    renderTable(); 
                    Swal.fire("Đã xóa!", "Bài học đã được xóa.", "success");
                } else {
                    Swal.fire("Lỗi!", `Không tìm thấy bài học để xóa (ID: ${lessonId}).`, "error");
                }
            }
        });
    }

    function openModal(title, buttonText, lessonData = null) {
        addLessonForm.reset();
        addLessonModal.querySelector('h2').textContent = title;
        addLessonModal.querySelector('button[type="submit"]').textContent = buttonText;
        populateCategorySelects(lessonCategoryModalSelect); 

        if (lessonData) {
            document.getElementById("lesson-name").value = lessonData.lesson_name;
            document.getElementById("lesson-duration").value = lessonData.time;
            lessonCategoryModalSelect.value = lessonData.subject_id || "";
            addLessonForm.dataset.editingId = lessonData.id;
        } else {
            addLessonForm.removeAttribute('data-editing-id');
        }

        addLessonModal.style.display = "block";
    }

    function closeModalHandler() {
        addLessonModal.style.display = "none";
        addLessonForm.removeAttribute('data-editing-id');
    }

    function handleOpenAddModal() {
        openModal("Thêm mới bài học", "Thêm");
    }

    function handleOpenEditModal(lessonId) {
        let lessonIdNum = parseInt(lessonId, 10);
        let lessonToEdit = lessons.find(lesson => lesson.id === lessonIdNum);
        if (lessonToEdit) {
            openModal("Chỉnh sửa bài học", "Lưu thay đổi", lessonToEdit);
        } else {
            Swal.fire("Lỗi", "Không tìm thấy bài học để sửa.", "error");
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        let lessonNameInput = document.getElementById("lesson-name");
        let lessonName = lessonNameInput.value.trim();
        let lessonCategoryValue = lessonCategoryModalSelect.value;
        let lessonDurationInput = document.getElementById("lesson-duration");
        let lessonDuration = parseInt(lessonDurationInput.value, 10);

        let editingId = addLessonForm.dataset.editingId ? parseInt(addLessonForm.dataset.editingId, 10) : null;

        if (!lessonName) {
            Swal.fire("Thiếu thông tin", "Vui lòng nhập tên bài học.", "warning").then(() => lessonNameInput.focus());
            return;
        }
        if (!lessonCategoryValue) { 
             Swal.fire("Thiếu thông tin", "Vui lòng chọn môn học.", "warning").then(() => lessonCategoryModalSelect.focus());
             return;
        }
        let lessonCategoryId = parseInt(lessonCategoryValue, 10); 

        if (isNaN(lessonDuration) || lessonDuration <= 0) {
            Swal.fire("Dữ liệu không hợp lệ", "Thời gian học phải là một số dương.", "warning").then(() => lessonDurationInput.focus());
            return;
        }

        let lessonNameLower = lessonName.toLowerCase();
        let isDuplicate = lessons.some(lesson =>
            lesson.lesson_name.toLowerCase() === lessonNameLower && lesson.id !== editingId
        );

        if (isDuplicate) {
            Swal.fire("Trùng lặp", "Tên bài học này đã tồn tại.", "error").then(() => lessonNameInput.focus());
            return;
        }

        if (editingId !== null) {
            let lessonIndex = lessons.findIndex(lesson => lesson.id === editingId);
            if (lessonIndex !== -1) {
                lessons[lessonIndex].lesson_name = lessonName;
                lessons[lessonIndex].time = lessonDuration;
                lessons[lessonIndex].subject_id = lessonCategoryId;

                saveToStorage(lessons, nextLessonId);
                renderTable();
                closeModalHandler();
                Swal.fire("Thành công!", "Đã cập nhật bài học.", "success");
            } else {
                Swal.fire("Lỗi", "Không tìm thấy bài học để cập nhật.", "error");
            }
        } else {
            let newLesson = {
                id: nextLessonId,
                subject_id: lessonCategoryId, 
                lesson_name: lessonName,
                time: lessonDuration,
                status: "incomplete", 
            };

            lessons.push(newLesson);
            nextLessonId++;

            saveToStorage(lessons, nextLessonId);

            currentCategoryFilter = "all"; 
            currentStatusFilter = "all";
            currentSearchTerm = "";
            categoryFilterSelect.value = "all";
            statusFilterSelect.value = "all";
            searchInput.value = "";

            currentPage = Math.ceil(lessons.length / lessonsPerPage);

            renderTable();
            closeModalHandler();
            Swal.fire("Thành công!", "Đã thêm bài học mới.", "success");
        }
    }

    function handleCategoryFilterChange() {
        currentCategoryFilter = categoryFilterSelect.value;
        currentPage = 1;
        renderTable();
    }

    function handleStatusFilterChange() {
        currentStatusFilter = statusFilterSelect.value;
        currentPage = 1;
        renderTable();
    }

    function performSearch() {
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1;
        renderTable();
    }

    function handleSearchInput(event) {
        clearTimeout(searchTimeout);
        if (event.key === "Enter") {
            performSearch();
        } else {
            searchTimeout = setTimeout(performSearch, 300);
        }
    }

    function handleLogout() {
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
    }


    function populateCategorySelects(selectElement, addAllOption = false) {
        if (!selectElement) return;

        let currentValue = selectElement.value;

        selectElement.innerHTML = ''; 

        if (addAllOption) {
            let allOption = document.createElement('option');
            allOption.value = "all";
            allOption.textContent = "Tất cả môn học";
            selectElement.appendChild(allOption);
        } else {
             let defaultOption = document.createElement('option');
             defaultOption.value = ""; 
             defaultOption.textContent = "-- Chọn môn học --";
             defaultOption.disabled = true; 
             defaultOption.selected = true; 
             selectElement.appendChild(defaultOption);
        }


        categories.forEach(cat => {
            let option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectElement.appendChild(option);
        });

        if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
             selectElement.value = currentValue;
        } else if (!addAllOption && !currentValue) {
             selectElement.value = "";
        } else if (addAllOption && !currentValue) {
             selectElement.value = "all"; 
        }
    }

    function initializeApp() {
        categories = loadCategoriesFromStorage();
        lessons = getLessonsFromStorage();
        nextLessonId = getNextIdFromStorage(lessons);

        if (!localStorage.getItem(LESSONS_STORAGE_KEY)) {
            saveToStorage(lessons, nextLessonId);
        }
         if (!localStorage.getItem(CATEGORIES_STORAGE_KEY)) {
             
         }

        populateCategorySelects(categoryFilterSelect, true); 
        populateCategorySelects(lessonCategoryModalSelect, false); 
        categoryFilterSelect.value = currentCategoryFilter; 
        statusFilterSelect.value = currentStatusFilter;  

        lessonTableBody.addEventListener('click', function(event) {
            let target = event.target;
            let deleteButton = target.closest('button.delete');
            let editButton = target.closest('button.edit');

            if (deleteButton) {
                handleDeleteLesson(deleteButton.dataset.lessonId);
            } else if (editButton) {
                handleOpenEditModal(editButton.dataset.lessonId);
            }
        });

        addLessonBtn.addEventListener("click", handleOpenAddModal);
        closeModalBtn.addEventListener("click", closeModalHandler);
        window.addEventListener("click", (event) => {
            if (event.target == addLessonModal) closeModalHandler();
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && addLessonModal.style.display === 'block') closeModalHandler();
        });
        addLessonForm.addEventListener("submit", handleFormSubmit);
        categoryFilterSelect.addEventListener("change", handleCategoryFilterChange);
        statusFilterSelect.addEventListener("change", handleStatusFilterChange);  
        searchInput.addEventListener("keyup", handleSearchInput);
        searchIcon.addEventListener("click", performSearch);

        let userLogoutBtn = document.getElementById('user-logout-btn');
        if (userLogoutBtn) {
            userLogoutBtn.addEventListener('click', handleLogout);
        } else {
            console.warn("Logout button ('user-logout-btn') not found.");
        }

        renderTable();
    }

    initializeApp();

});
