document.addEventListener("DOMContentLoaded", function () {
    // ... (Giữ nguyên các phần khai báo biến và hàm khác) ...

    let lessonTableBody = document.getElementById("lesson-table-body");
    let addLessonBtn = document.getElementById("add-lesson-btn");
    let addLessonModal = document.getElementById("add-lesson-modal");
    let closeModal = document.querySelector(".close");
    let addLessonForm = document.getElementById("add-lesson-form");
    let statusFilter = document.getElementById("status-filter");
    let paginationContainer = document.getElementById("pagination");
    let searchInput = document.getElementById("search-input");
    let searchIcon = document.getElementById("search-icon");

    // --- LocalStorage Integration ---
    let LESSONS_STORAGE_KEY = 'lessonsData';
    let NEXT_ID_STORAGE_KEY = 'nextLessonId';

    // Function to get lessons from localStorage or use default
    function getLessonsFromStorage() {
        let storedLessons = localStorage.getItem(LESSONS_STORAGE_KEY);
        if (storedLessons) {
            try {
                // Thêm try-catch để xử lý trường hợp JSON không hợp lệ
                let parsedLessons = JSON.parse(storedLessons);
                // Đảm bảo trả về một mảng
                return Array.isArray(parsedLessons) ? parsedLessons : getDefaultLessons();
            } catch (e) {
                console.error("Error parsing lessons from localStorage:", e);
                // Nếu lỗi parse, trả về dữ liệu mặc định và xóa dữ liệu lỗi
                localStorage.removeItem(LESSONS_STORAGE_KEY);
                return getDefaultLessons();
            }
        } else {
            return getDefaultLessons();
        }
    }

    // Function to provide default lessons
    function getDefaultLessons() {
        return [
            { id: 1, subject_id: 1, lesson_name: "Session 01: Tổng quan về HTML", time: 24, status: "complete" },
            { id: 2, subject_id: 2, lesson_name: "Session 02: Thẻ Inline và Block", time: 44, status: "incomplete" },
            { id: 3, subject_id: 3, lesson_name: "Session 03: Thẻ hình ảnh", time: 24, status: "complete" },
            { id: 4, subject_id: 4, lesson_name: "Session 05: Thẻ Semantic", time: 44, status: "incomplete" },
            { id: 5, subject_id: 5, lesson_name: "Session 01: Tổng quan về CSS", time: 24, status: "complete" },
            { id: 6, subject_id: 6, lesson_name: "Session 02: Nhúng CSS vào trang Web", time: 44, status: "incomplete" },
            { id: 7, subject_id: 7, lesson_name: "Session 03: Position", time: 24, status: "complete" },
            { id: 8, subject_id: 8, lesson_name: "Session 05: Flexbox", time: 44, status: "incomplete" },
            { id: 9, subject_id: 9, lesson_name: "Session 01: Tổng quan về JAVASCRIPT", time: 24, status: "complete" },
            { id: 10, subject_id: 10, lesson_name: "Session 02: Khai báo biến", time: 44, status: "incomplete" },
            { id: 11, subject_id: 11, lesson_name: "Session 03: Câu lệnh điều kiện", time: 24, status: "complete" },
            { id: 12, subject_id: 12, lesson_name: "Session 05: Vòng lặp", time: 44, status: "incomplete" },
            { id: 13, subject_id: 13, lesson_name: "Session 01: Tổng quan về JAVA", time: 24, status: "complete" },
            { id: 14, subject_id: 14, lesson_name: "Session 02: Mảng", time: 44, status: "incomplete" },
            { id: 15, subject_id: 15, lesson_name: "Session 03: Animation", time: 24, status: "complete" },
        ];
    }


    // Function to get the next ID from localStorage or calculate it
    function getNextIdFromStorage(currentLessons) {
        let storedNextId = localStorage.getItem(NEXT_ID_STORAGE_KEY);
        if (storedNextId) {
            let nextId = parseInt(storedNextId, 10);
            // Đảm bảo nextId luôn lớn hơn ID lớn nhất hiện có
            let maxId = currentLessons.length > 0 ? Math.max(...currentLessons.map(l => l.id)) : 0;
            return Math.max(nextId, maxId + 1);
        } else {
            // Calculate next ID based on current lessons if not stored
            return currentLessons.length > 0 ? Math.max(...currentLessons.map(l => l.id)) + 1 : 1;
        }
    }

    // Function to save lessons and next ID to localStorage
    function saveToStorage(lessonsToSave, nextIdToSave) {
        try {
            localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessonsToSave));
            localStorage.setItem(NEXT_ID_STORAGE_KEY, nextIdToSave.toString());
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            Swal.fire("Lỗi", "Không thể lưu dữ liệu vào bộ nhớ cục bộ. Bộ nhớ có thể đã đầy.", "error");
        }
    }

    let lessons = getLessonsFromStorage();
    let nextLessonId = getNextIdFromStorage(lessons);
    // Save initial data if it wasn't already in storage
    if (!localStorage.getItem(LESSONS_STORAGE_KEY)) {
        saveToStorage(lessons, nextLessonId);
    }

    // --- End LocalStorage Integration ---

    let lessonsPerPage = 5;
    let currentPage = 1;
    let currentFilter = "all"; // Track current filter
    let currentSearchTerm = ""; // Track current search term

    // --- Helper Function for Creating Table Rows ---
    function createLessonRow(lesson) {
        let row = document.createElement("tr");
        row.dataset.lessonId = lesson.id; // Thêm ID vào row để dễ truy cập sau này

        // Checkbox and Lesson Name
        let cellName = row.insertCell();
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'lesson-select';
        checkbox.value = lesson.id;
        checkbox.style.marginRight = '8px'; // Thêm khoảng cách
        cellName.appendChild(checkbox);
        cellName.appendChild(document.createTextNode(lesson.lesson_name));

        // Time
        let cellTime = row.insertCell();
        cellTime.textContent = `${lesson.time}`;

        // Status
        let cellStatus = row.insertCell();
        let statusSpan = document.createElement('span');
        statusSpan.classList.add(lesson.status === 'complete' ? 'active' : 'inactive');
        statusSpan.textContent = lesson.status === "complete" ? "● Hoàn thành" : "● Chưa hoàn thành";
        cellStatus.appendChild(statusSpan);

        // Actions
        let cellActions = row.insertCell();
        cellActions.style.textAlign = 'center'; // Căn giữa nút

        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.dataset.lessonId = lesson.id;
        deleteButton.innerHTML = '<img src="../Asset/Icon/Icon/Button.png" alt="Delete">';
        deleteButton.title = "Xóa bài học"; // Thêm tooltip

        let editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.dataset.lessonId = lesson.id;
        editButton.innerHTML = '<img src="../Asset/Icon/Icon/pen.png" alt="Edit">';
        editButton.title = "Sửa bài học"; // Thêm tooltip

        cellActions.appendChild(deleteButton);
        cellActions.appendChild(editButton);

        return row;
    }


    // Refactored render function to handle filtering and searching
    function renderTable() {
        lessonTableBody.innerHTML = ""; // Clear existing rows

        // 1. Filter by status
        let filteredLessons = lessons;
        if (currentFilter !== "all") {
            filteredLessons = lessons.filter(lesson => lesson.status === currentFilter);
        }

        // 2. Filter by search term (case-insensitive)
        if (currentSearchTerm) {
            let searchTermLower = currentSearchTerm.toLowerCase();
            filteredLessons = filteredLessons.filter(lesson =>
                lesson.lesson_name.toLowerCase().includes(searchTermLower)
            );
        }

        // 3. Paginate the filtered/searched results
        let totalFilteredLessons = filteredLessons.length;
        let totalPages = Math.ceil(totalFilteredLessons / lessonsPerPage);

        // Adjust currentPage if it's out of bounds after filtering/deleting
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1; // Reset to page 1 if no items
        }

        let startIndex = (currentPage - 1) * lessonsPerPage;
        let endIndex = startIndex + lessonsPerPage;
        let lessonsToRender = filteredLessons.slice(startIndex, endIndex);

        // 4. Render rows or "No data" message
        if (lessonsToRender.length > 0) {
            lessonsToRender.forEach(lesson => {
                let row = createLessonRow(lesson);
                lessonTableBody.appendChild(row);
            });
        } else {
            // Display a message if no lessons match filters/search or if lessons array is empty
            let noDataRow = lessonTableBody.insertRow();
            let cell = noDataRow.insertCell();
            cell.colSpan = 4; // Span across all columns
            cell.textContent = currentSearchTerm || currentFilter !== 'all' ? "Không tìm thấy bài học phù hợp." : "Chưa có bài học nào.";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            cell.style.color = "#666";
        }


        // 5. Add event listeners for delete/edit buttons (using event delegation is better)
        // Removed addTableActionListeners() call here, will use delegation below

        // 6. Render pagination controls based on filtered/searched results
        renderPagination(totalFilteredLessons);
    }

    // --- Event Delegation for Table Actions ---
    // Instead of adding listeners to each button, listen on the table body
    lessonTableBody.addEventListener('click', function(event) {
        let target = event.target;
        let deleteButton = target.closest('button.delete');
        let editButton = target.closest('button.edit');

        if (deleteButton) {
            let lessonId = deleteButton.dataset.lessonId;
            deleteLesson(lessonId);
        } else if (editButton) {
            let lessonId = editButton.dataset.lessonId;
            openEditModal(lessonId); // Call function to handle editing
        }
    });


    // --- Delete Lesson Function ---
    function deleteLesson(lessonId) {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", // Red for delete
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                let lessonIdNum = parseInt(lessonId, 10); // Ensure ID is a number
                let lessonIndex = lessons.findIndex(lesson => lesson.id === lessonIdNum);

                if (lessonIndex !== -1) {
                    lessons.splice(lessonIndex, 1);
                    saveToStorage(lessons, nextLessonId); // Save changes
                    renderTable(); // Re-render the table (handles pagination adjustment)
                    Swal.fire(
                        "Đã xóa!",
                        "Bài học đã được xóa.",
                        "success"
                    );
                } else {
                     Swal.fire(
                        "Lỗi!",
                        "Không tìm thấy bài học để xóa (ID: " + lessonId + ").",
                        "error"
                    );
                }
            }
        });
    }

    // --- Modal Handling ---
    function openModal(title, buttonText, lessonData = null) {
        addLessonForm.reset(); // Reset form fields
        addLessonModal.querySelector('h2').textContent = title;
        addLessonModal.querySelector('button[type="submit"]').textContent = buttonText;

        if (lessonData) {
            // Populate form for editing
            document.getElementById("lesson-name").value = lessonData.lesson_name;
            document.getElementById("lesson-duration").value = lessonData.time;
            let categorySelect = document.querySelector("#add-lesson-form select[name='lesson-category']");
            categorySelect.value = lessonData.subject_id || ""; // Set selected category or default
            // Store the ID of the lesson being edited
            addLessonForm.dataset.editingId = lessonData.id;
        } else {
            // Clear editing ID for adding
            addLessonForm.removeAttribute('data-editing-id');
        }

        addLessonModal.style.display = "block";
    }

    function closeModalHandler() {
        addLessonModal.style.display = "none";
        addLessonForm.removeAttribute('data-editing-id'); // Ensure editing ID is cleared on close
    }

    // Show the modal for ADDING when the "Add Lesson" button is clicked
    addLessonBtn.addEventListener("click", () => {
        openModal("Thêm mới bài học", "Thêm");
    });

    // Function to open modal for EDITING
    function openEditModal(lessonId) {
        let lessonIdNum = parseInt(lessonId, 10);
        let lessonToEdit = lessons.find(lesson => lesson.id === lessonIdNum);
        if (lessonToEdit) {
            openModal("Chỉnh sửa bài học", "Lưu thay đổi", lessonToEdit);
        } else {
            Swal.fire("Lỗi", "Không tìm thấy bài học để sửa.", "error");
        }
    }


    // Close the modal listeners
    closeModal.addEventListener("click", closeModalHandler);
    window.addEventListener("click", (event) => {
        if (event.target == addLessonModal) {
            closeModalHandler();
        }
    });
    // Close modal on ESC key press
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && addLessonModal.style.display === 'block') {
            closeModalHandler();
        }
    });


    // --- Form Submission (Handles BOTH Add and Edit) ---
    addLessonForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        let lessonNameInput = document.getElementById("lesson-name");
        let lessonName = lessonNameInput.value.trim();
        let lessonCategorySelect = document.querySelector("#add-lesson-form select[name='lesson-category']");
        let lessonCategoryId = lessonCategorySelect ? lessonCategorySelect.value : null;
        let lessonDurationInput = document.getElementById("lesson-duration");
        let lessonDuration = parseInt(lessonDurationInput.value, 10); // Always specify radix

        let editingId = addLessonForm.dataset.editingId ? parseInt(addLessonForm.dataset.editingId, 10) : null;

        // --- Validation ---
        if (!lessonName) {
             Swal.fire("Thiếu thông tin", "Vui lòng nhập tên bài học.", "warning");
             lessonNameInput.focus();
             return;
        }
         if (isNaN(lessonDuration) || lessonDuration <= 0) {
             Swal.fire("Dữ liệu không hợp lệ", "Thời gian học phải là một số dương.", "warning");
             lessonDurationInput.focus();
             return;
         }
         // Add validation for category if it's required
         // if (!lessonCategoryId) {
         //     Swal.fire("Thiếu thông tin", "Vui lòng chọn môn học.", "warning");
         //     lessonCategorySelect.focus();
         //     return;
         // }

        // --- Duplicate Name Validation (Improved for Edit) ---
        let lessonNameLower = lessonName.toLowerCase();
        let isDuplicate = lessons.some(lesson =>
            lesson.lesson_name.toLowerCase() === lessonNameLower && lesson.id !== editingId // Exclude the lesson being edited
        );

        if (isDuplicate) {
            Swal.fire("Trùng lặp", "Tên bài học này đã tồn tại. Vui lòng nhập tên khác.", "error");
            lessonNameInput.focus();
            return; // Stop processing
        }
        // --- End Validation ---


        if (editingId !== null) {
            // --- Update Existing Lesson ---
            let lessonIndex = lessons.findIndex(lesson => lesson.id === editingId);
            if (lessonIndex !== -1) {
                // Update lesson properties (keep original status unless changed elsewhere)
                lessons[lessonIndex].lesson_name = lessonName;
                lessons[lessonIndex].time = lessonDuration;
                lessons[lessonIndex].subject_id = lessonCategoryId ? parseInt(lessonCategoryId) : null;
                // Note: Status is not updated via this form in the current setup

                saveToStorage(lessons, nextLessonId); // Save changes
                renderTable(); // Re-render
                closeModalHandler(); // Close modal
                Swal.fire("Thành công!", "Đã cập nhật bài học.", "success");
            } else {
                Swal.fire("Lỗi", "Không tìm thấy bài học để cập nhật.", "error");
            }

        } else {
            // --- Add New Lesson ---
            let newLesson = {
                id: nextLessonId,
                subject_id: lessonCategoryId ? parseInt(lessonCategoryId) : null,
                lesson_name: lessonName,
                time: lessonDuration,
                status: "incomplete", // Default status for new lessons
            };

            lessons.push(newLesson);
            nextLessonId++; // Increment ID for the *next* add

            saveToStorage(lessons, nextLessonId); // Save new lesson and updated next ID

            // Reset filters/search and go to the page with the new lesson
            currentFilter = "all";
            statusFilter.value = "all";
            currentSearchTerm = "";
            searchInput.value = "";
            // Calculate the page where the new item will be
            let totalFiltered = lessons.filter(l => currentFilter === 'all' || l.status === currentFilter)
                                        .filter(l => !currentSearchTerm || l.lesson_name.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                                        .length;
            currentPage = Math.ceil(totalFiltered / lessonsPerPage);


            renderTable(); // Re-render
            closeModalHandler(); // Close modal
            Swal.fire("Thành công!", "Đã thêm bài học mới.", "success");
        }
    });


    // --- Filtering ---
    statusFilter.addEventListener("change", () => {
        currentFilter = statusFilter.value;
        currentPage = 1; // Reset to first page when filter changes
        renderTable();
    });

    // --- Searching ---
    let searchTimeout; // To debounce search input
    function performSearch() {
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1; // Reset to first page
        renderTable();
    }

    searchInput.addEventListener("keyup", function(event) {
        clearTimeout(searchTimeout); // Clear previous timeout
        if (event.key === "Enter") {
            performSearch(); // Search immediately on Enter
        } else {
            // Debounce: Wait 300ms after user stops typing before searching
            searchTimeout = setTimeout(performSearch, 300);
        }
    });

    searchIcon.addEventListener("click", performSearch); // Trigger search on icon click


    // --- Pagination ---
    function renderPagination(totalItems) {
        paginationContainer.innerHTML = ""; // Clear existing buttons
        let totalPages = Math.ceil(totalItems / lessonsPerPage);

        if (totalPages <= 1) {
            return; // No pagination needed
        }

        // Function to create a pagination button
        let createButton = (pageNumber, text = pageNumber, isActive = false, isDisabled = false) => {
            let button = document.createElement("button");
            button.textContent = text;
            button.disabled = isDisabled;
            if (isActive) {
                button.classList.add("active");
            }
            if (!isDisabled) {
                 button.addEventListener("click", () => {
                    currentPage = pageNumber;
                    renderTable();
                });
            }
            return button;
        };

        // Previous Button
        paginationContainer.appendChild(createButton(currentPage - 1, '‹', false, currentPage === 1));


        // Page Number Buttons (simplified logic for many pages)
        let maxVisibleButtons = 5; // Max number buttons shown (excluding prev/next)
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        // Adjust startPage if endPage reaches the limit first
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


        // Next Button
        paginationContainer.appendChild(createButton(currentPage + 1, '›', false, currentPage === totalPages));
    }


    // --- Logout Button ---
    let userLogoutBtn = document.getElementById('user-logout-btn');
    if (userLogoutBtn) {
        userLogoutBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn đăng xuất?',
                text: "Dữ liệu bài học hiện tại sẽ vẫn được lưu trong trình duyệt này.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Đăng xuất',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Optional: Clear app-specific localStorage on logout if desired
                    // localStorage.removeItem(LESSONS_STORAGE_KEY);
                    // localStorage.removeItem(NEXT_ID_STORAGE_KEY);
                    // localStorage.removeItem('categoriesData'); // Example if you store categories
                    window.location.href = './login.html'; // Redirect
                }
            });
        });
    } else {
        console.warn("Logout button ('user-logout-btn') not found.");
    }

    // --- Populate Category Filter/Selects ---
    function populateCategorySelects() {
        // TODO: Fetch actual categories. Using placeholder data for now.
        // Ideally, this data should also come from localStorage or an API.
        let CATEGORIES_STORAGE_KEY = 'categoriesData'; // Example key
        let categories = [];
        let storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

        if (storedCategories) {
             try {
                let parsed = JSON.parse(storedCategories);
                if (Array.isArray(parsed)) {
                    categories = parsed;
                }
             } catch (e) {
                 console.error("Error parsing categories from localStorage:", e);
             }
        }

        // Fallback if no categories loaded
        if (categories.length === 0) {
             console.warn("No categories found in localStorage. Using default examples.");
             categories = [
                { id: 1, name: "HTML" },
                { id: 2, name: "CSS" },
                { id: 3, name: "JavaScript Basic" },
                { id: 4, name: "ReactJS" },
             ];
             // Optionally save default categories back to localStorage
             // localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        }


        let categorySelectModal = document.querySelector("#add-lesson-form select[name='lesson-category']");
        // let categoryFilterSelect = document.getElementById("status-filter"); // This is for STATUS, not category

        // Populate the SELECT inside the modal
        if (categorySelectModal) {
            categorySelectModal.innerHTML = '<option value="">-- Chọn môn học --</option>'; // Default/empty option
            categories.forEach(cat => {
                let option = document.createElement('option');
                option.value = cat.id; // Use category ID as the value
                option.textContent = cat.name; // Display category name
                categorySelectModal.appendChild(option);
            });
        } else {
             console.error("Category select dropdown in modal not found!");
        }

        // Ensure the main STATUS filter dropdown is correctly set up
        let statusFilterSelect = document.getElementById("status-filter");
        if (statusFilterSelect) {
             // Ensure options are correct and set initial value
             statusFilterSelect.innerHTML = `
                <option value="all">Lọc theo trạng thái</option>
                <option value="complete">Hoàn thành</option>
                <option value="incomplete">Chưa hoàn thành</option>
             `;
             statusFilterSelect.value = currentFilter; // Set dropdown to reflect current filter state
        } else {
             console.error("Status filter dropdown not found!");
        }
    }


    // --- Initial Setup ---
    populateCategorySelects(); // Populate dropdowns first
    renderTable(); // Initial render of the table and pagination

}); // End DOMContentLoaded
