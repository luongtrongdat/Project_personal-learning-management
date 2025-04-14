document.addEventListener("DOMContentLoaded", function () {
    // Get DOM Elements
    let lessonTableBody = document.getElementById("lesson-table-body");
    let addLessonBtn = document.getElementById("add-lesson-btn");
    let addLessonModal = document.getElementById("add-lesson-modal");
    let closeModalBtn = document.querySelector(".modal .close"); // More specific selector
    let addLessonForm = document.getElementById("add-lesson-form");
    let categoryFilterSelect = document.getElementById("category-filter"); // New category filter
    let statusFilterSelect = document.getElementById("status-filter"); // Renamed for clarity
    let paginationContainer = document.getElementById("pagination");
    let searchInput = document.getElementById("search-input");
    let searchIcon = document.getElementById("search-icon");
    let lessonCategoryModalSelect = document.getElementById("lesson-category-modal"); // Modal category select

    // --- LocalStorage Keys ---
    const LESSONS_STORAGE_KEY = 'lessonsData';
    const NEXT_ID_STORAGE_KEY = 'nextLessonId';
    const CATEGORIES_STORAGE_KEY = 'categoriesData'; // Define category key

    // --- State Variables ---
    let lessons = [];
    let categories = [];
    let nextLessonId = 1;
    let lessonsPerPage = 5;
    let currentPage = 1;
    let currentCategoryFilter = "all"; // Track current category filter
    let currentStatusFilter = "all";   // Track current status filter
    let currentSearchTerm = "";      // Track current search term
    let searchTimeout; // To debounce search input

    // --- Data Loading and Saving ---

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
        // Fallback/Default categories if none in storage or error
        console.warn("No valid categories found in localStorage. Using default examples.");
        const defaultCategories = [
            { id: 1, name: "HTML" },
            { id: 2, name: "CSS" },
            { id: 3, name: "JavaScript Basic" },
            { id: 4, name: "ReactJS" },
            { id: 5, name: "JAVA" }, // Added Java to match default lessons
        ];
        // Optionally save default categories back to localStorage
        // saveCategoriesToStorage(defaultCategories);
        return defaultCategories;
    }

    function saveCategoriesToStorage(categoriesToSave) {
         try {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
        } catch (e) {
            console.error("Error saving categories to localStorage:", e);
        }
    }


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
        // Assign subject_id based on default categories if possible
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

    // --- UI Rendering ---

    function createLessonRow(lesson) {
        let row = document.createElement("tr");
        row.dataset.lessonId = lesson.id;

        // Checkbox and Lesson Name
        let cellName = row.insertCell();
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'lesson-select';
        checkbox.value = lesson.id;
        checkbox.style.marginRight = '8px';
        cellName.appendChild(checkbox);
        cellName.appendChild(document.createTextNode(lesson.lesson_name));

        // Category Name (Find from categories array)
        let cellCategory = row.insertCell();
        let category = categories.find(cat => cat.id === lesson.subject_id);
        cellCategory.textContent = category ? category.name : 'N/A'; // Display category name or N/A

        // Time
        let cellTime = row.insertCell();
        cellTime.textContent = `${lesson.time} phút`; // Add unit

        // Status
        let cellStatus = row.insertCell();
        let statusSpan = document.createElement('span');
        statusSpan.classList.add(lesson.status === 'complete' ? 'active' : 'inactive');
        statusSpan.textContent = lesson.status === "complete" ? "● Hoàn thành" : "● Chưa hoàn thành";
        cellStatus.appendChild(statusSpan);

        // Actions
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
        lessonTableBody.innerHTML = ""; // Clear existing rows

        // 1. Filter by category
        let filteredLessons = lessons;
        if (currentCategoryFilter !== "all") {
            // Convert filter value to number for comparison
            const categoryIdFilter = parseInt(currentCategoryFilter, 10);
            filteredLessons = filteredLessons.filter(lesson => lesson.subject_id === categoryIdFilter);
        }

        // 2. Filter by status (on the already category-filtered list)
        if (currentStatusFilter !== "all") {
            filteredLessons = filteredLessons.filter(lesson => lesson.status === currentStatusFilter);
        }

        // 3. Filter by search term (on the already filtered list)
        if (currentSearchTerm) {
            let searchTermLower = currentSearchTerm.toLowerCase();
            filteredLessons = filteredLessons.filter(lesson =>
                lesson.lesson_name.toLowerCase().includes(searchTermLower)
            );
        }

        // 4. Paginate the final filtered results
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

        // 5. Render rows or "No data" message
        if (lessonsToRender.length > 0) {
            // Update table header to include Category column
            const thead = lessonTableBody.closest('table').querySelector('thead tr');
            if (thead && thead.children.length === 4) { // Check if category header is missing
                 const thCategory = document.createElement('th');
                 thCategory.textContent = 'Môn học';
                 // Insert Category header before Time header
                 thead.insertBefore(thCategory, thead.children[1]);

                 // Adjust arrow positions if needed (or remove absolute positioning from CSS)
                 // This might require removing the arrow images or rethinking their placement
                 const arrow1 = document.getElementById('arrow-down');
                 const arrow2 = document.getElementById('arrow_down');
                 if(arrow1) arrow1.style.left = '/* New position */'; // Adjust as needed
                 if(arrow2) arrow2.style.left = '/* New position */'; // Adjust as needed
            }


            lessonsToRender.forEach(lesson => {
                let row = createLessonRow(lesson);
                lessonTableBody.appendChild(row);
            });
        } else {
             // Update table header even if no data (to maintain structure)
             const thead = lessonTableBody.closest('table').querySelector('thead tr');
             if (thead && thead.children.length === 4) {
                 const thCategory = document.createElement('th');
                 thCategory.textContent = 'Môn học';
                 thead.insertBefore(thCategory, thead.children[1]);
             }

            let noDataRow = lessonTableBody.insertRow();
            let cell = noDataRow.insertCell();
            cell.colSpan = 5; // Span across 5 columns now
            cell.textContent = "Không tìm thấy bài học phù hợp.";
            if (!currentSearchTerm && currentCategoryFilter === 'all' && currentStatusFilter === 'all' && lessons.length === 0) {
                 cell.textContent = "Chưa có bài học nào.";
            }
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            cell.style.color = "#666";
        }

        // 6. Render pagination controls
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

    // --- Event Handlers ---

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
                    renderTable(); // Re-render handles pagination adjustment
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
        populateCategorySelects(lessonCategoryModalSelect); // Ensure modal select is populated

        if (lessonData) {
            document.getElementById("lesson-name").value = lessonData.lesson_name;
            document.getElementById("lesson-duration").value = lessonData.time;
            // Use the correct ID for the modal select
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
        // Use the correct ID for the modal select
        let lessonCategoryValue = lessonCategoryModalSelect.value;
        let lessonDurationInput = document.getElementById("lesson-duration");
        let lessonDuration = parseInt(lessonDurationInput.value, 10);

        let editingId = addLessonForm.dataset.editingId ? parseInt(addLessonForm.dataset.editingId, 10) : null;

        // Validation
        if (!lessonName) {
            Swal.fire("Thiếu thông tin", "Vui lòng nhập tên bài học.", "warning").then(() => lessonNameInput.focus());
            return;
        }
        if (!lessonCategoryValue) { // Check if a category is selected
             Swal.fire("Thiếu thông tin", "Vui lòng chọn môn học.", "warning").then(() => lessonCategoryModalSelect.focus());
             return;
        }
        let lessonCategoryId = parseInt(lessonCategoryValue, 10); // Convert selected value to number

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
            // Update Existing Lesson
            let lessonIndex = lessons.findIndex(lesson => lesson.id === editingId);
            if (lessonIndex !== -1) {
                lessons[lessonIndex].lesson_name = lessonName;
                lessons[lessonIndex].time = lessonDuration;
                lessons[lessonIndex].subject_id = lessonCategoryId; // Assign the parsed category ID
                // Status is not changed here

                saveToStorage(lessons, nextLessonId);
                renderTable();
                closeModalHandler();
                Swal.fire("Thành công!", "Đã cập nhật bài học.", "success");
            } else {
                Swal.fire("Lỗi", "Không tìm thấy bài học để cập nhật.", "error");
            }
        } else {
            // Add New Lesson
            let newLesson = {
                id: nextLessonId,
                subject_id: lessonCategoryId, // Assign the parsed category ID
                lesson_name: lessonName,
                time: lessonDuration,
                status: "incomplete", // Default status
            };

            lessons.push(newLesson);
            nextLessonId++;

            saveToStorage(lessons, nextLessonId);

            // Go to the page where the new item will be, considering current filters
            currentCategoryFilter = "all"; // Optionally reset filters after adding
            currentStatusFilter = "all";
            currentSearchTerm = "";
            categoryFilterSelect.value = "all";
            statusFilterSelect.value = "all";
            searchInput.value = "";

            // Calculate page based on *all* items since we reset filters
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
                // Optional: Clear specific storage items on logout
                // localStorage.removeItem(LESSONS_STORAGE_KEY);
                // localStorage.removeItem(NEXT_ID_STORAGE_KEY);
                // localStorage.removeItem(CATEGORIES_STORAGE_KEY);
                window.location.href = './login.html'; // Redirect
            }
        });
    }

    // --- Initialization ---

    function populateCategorySelects(selectElement, addAllOption = false) {
        if (!selectElement) return;

        // Store current value if editing/filtering
        const currentValue = selectElement.value;

        selectElement.innerHTML = ''; // Clear existing options

        if (addAllOption) {
            let allOption = document.createElement('option');
            allOption.value = "all";
            allOption.textContent = "Tất cả môn học";
            selectElement.appendChild(allOption);
        } else {
             // Add default prompt for modal select
             let defaultOption = document.createElement('option');
             defaultOption.value = ""; // Empty value for prompt
             defaultOption.textContent = "-- Chọn môn học --";
             defaultOption.disabled = true; // Optional: disable it
             defaultOption.selected = true; // Select it by default
             selectElement.appendChild(defaultOption);
        }


        categories.forEach(cat => {
            let option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectElement.appendChild(option);
        });

        // Restore previously selected value if it exists
        if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
             selectElement.value = currentValue;
        } else if (!addAllOption && !currentValue) {
             // Ensure the prompt is selected if no value was previously set in modal
             selectElement.value = "";
        } else if (addAllOption && !currentValue) {
             selectElement.value = "all"; // Default to 'all' for filter dropdown
        }
    }

    function initializeApp() {
        // Load data
        categories = loadCategoriesFromStorage();
        lessons = getLessonsFromStorage();
        nextLessonId = getNextIdFromStorage(lessons);

        // Save initial default data if storage was empty
        if (!localStorage.getItem(LESSONS_STORAGE_KEY)) {
            saveToStorage(lessons, nextLessonId);
        }
         if (!localStorage.getItem(CATEGORIES_STORAGE_KEY)) {
             // Only save default categories if they were loaded because storage was empty
             // saveCategoriesToStorage(categories); // Uncomment if you want to save defaults
         }


        // Populate UI elements
        populateCategorySelects(categoryFilterSelect, true); // Populate filter dropdown
        populateCategorySelects(lessonCategoryModalSelect, false); // Populate modal dropdown
        categoryFilterSelect.value = currentCategoryFilter; // Set initial filter value
        statusFilterSelect.value = currentStatusFilter;   // Set initial status filter value

        // Add Event Listeners using event delegation where possible
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
        categoryFilterSelect.addEventListener("change", handleCategoryFilterChange); // Listener for category filter
        statusFilterSelect.addEventListener("change", handleStatusFilterChange);     // Listener for status filter
        searchInput.addEventListener("keyup", handleSearchInput);
        searchIcon.addEventListener("click", performSearch);

        let userLogoutBtn = document.getElementById('user-logout-btn');
        if (userLogoutBtn) {
            userLogoutBtn.addEventListener('click', handleLogout);
        } else {
            console.warn("Logout button ('user-logout-btn') not found.");
        }

        // Initial Render
        renderTable();
    }

    // Start the application
    initializeApp();

}); // End DOMContentLoaded
