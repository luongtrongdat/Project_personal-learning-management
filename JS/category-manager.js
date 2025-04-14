document.addEventListener('DOMContentLoaded', function () {
    let categoryTableBody = document.getElementById('category-table-body');
    let addCategoryBtn = document.getElementById('add-category-btn');
    let addCategoryModal = document.getElementById('add-category-modal');
    let closeModal = addCategoryModal.querySelector('.close');
    let addCategoryForm = document.getElementById('add-category-form');
    let paginationContainer = document.getElementById('pagination');
    let statusFilter = document.getElementById('status-filter');
    let editCategoryModal = document.getElementById('edit-category-modal');
    let closeEditModal = editCategoryModal.querySelector('.close-edit');
    let editCategoryForm = document.getElementById('edit-category-form');
    let searchInput = document.getElementById('search-input');
    let arrowDownBtn = document.getElementById('arrow-down'); 
    let currentSearchTerm = '';
    let sortDirection = 'none'; 

    function loadCategoriesFromLocalStorage() {
        let storedCategories = localStorage.getItem('categories');
        let subjects = [
            { id: 1, name: 'Lập trình C', status: 'active' },
            { id: 2, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
            { id: 3, name: 'Lập trình Backend với Spring Boot', status: 'active' },
            { id: 4, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
            { id: 5, name: 'Lập trình C++', status: 'active' },
            { id: 6, name: 'Lập trình Java', status: 'inactive' },
            { id: 7, name: 'Cơ sở dữ liệu SQL', status: 'active' },
            { id: 8, name: 'Thiết kế Web', status: 'inactive' },
            { id: 9, name: 'Python cơ bản', status: 'active' },
            { id: 10, name: 'Node.js', status: 'inactive' },
            { id: 11, name: 'Kiểm thử phần mềm', status: 'active' },
            { id: 12, name: 'Quản lý dự án Agile', status: 'inactive' },
            { id: 13, name: 'An toàn thông tin', status: 'active' },
            { id: 14, name: 'Điện toán đám mây', status: 'inactive' },
            { id: 15, name: 'Khoa học dữ liệu', status: 'active' },
            { id: 16, name: 'Trí tuệ nhân tạo', status: 'inactive' },
        ];
        if (storedCategories) {
            return JSON.parse(storedCategories);
        } else {
            localStorage.setItem('categories', JSON.stringify(subjects));
            return subjects;
        }
    }

    function loadNextCategoryId() {
        let storedId = localStorage.getItem('nextCategoryId');
        if (storedId) {
            return parseInt(storedId, 10);
        } else {
            let initialSubjects = [
                { id: 1, name: 'Lập trình C', status: 'active' },
                { id: 2, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
                { id: 3, name: 'Lập trình Backend với Spring Boot', status: 'active' },
                { id: 4, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
                { id: 5, name: 'Lập trình C++', status: 'active' },
                { id: 6, name: 'Lập trình Java', status: 'inactive' },
                { id: 7, name: 'Cơ sở dữ liệu SQL', status: 'active' },
                { id: 8, name: 'Thiết kế Web', status: 'inactive' },
                { id: 9, name: 'Python cơ bản', status: 'active' },
                { id: 10, name: 'Node.js', status: 'inactive' },
                { id: 11, name: 'Kiểm thử phần mềm', status: 'active' },
                { id: 12, name: 'Quản lý dự án Agile', status: 'inactive' },
                { id: 13, name: 'An toàn thông tin', status: 'active' },
                { id: 14, name: 'Điện toán đám mây', status: 'inactive' },
                { id: 15, name: 'Khoa học dữ liệu', status: 'active' },
                { id: 16, name: 'Trí tuệ nhân tạo', status: 'inactive' },
            ];
            let maxId = initialSubjects.reduce((max, cat) => Math.max(max, cat.id), 0);
            if (categories && categories.length > 0) {
                maxId = categories.reduce((max, cat) => Math.max(max, cat.id), 0);
            }
            let initialNextId = maxId + 1;
            localStorage.setItem('nextCategoryId', initialNextId.toString());
            return initialNextId;
        }
    }
    function saveToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('nextCategoryId', nextCategoryId.toString());
    }

    let categories = loadCategoriesFromLocalStorage();
    let nextCategoryId = loadNextCategoryId();
    let categoriesPerPage = 5;
    let currentPage = 1;
    let currentFilter = 'all';

    function createCategoryRow(category) {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        nameCell.textContent = category.name;

        let statusCell = document.createElement('td');
        let statusSpan = document.createElement('span');
        statusSpan.className = category.status;
        statusSpan.textContent = category.status === 'active' ? '● Đang hoạt động' : '● Ngừng hoạt động';
        statusCell.appendChild(statusSpan);

        let actionsCell = document.createElement('td');
        actionsCell.innerHTML =
            `
                <button class="delete" data-category-id="${category.id}" title="Xóa"><img src="../Asset/Icon/Icon/Button.png" alt="Delete"></button>
                <button class="edit" data-category-id="${category.id}" title="Sửa"><img src="../Asset/Icon/Icon/pen.png" alt="Edit"></button>
            `;

        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        return row;
    }

    function sortCategories() {
        if (sortDirection === 'asc') {
            categories.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
        } 
        // else if (sortDirection === 'desc') {
        //     categories.sort((a, b) => b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' }));
        // }
    }

    function getFilteredCategories() {
        let filtered = [...categories]; 

        // lọc theo trạng thái
        if (currentFilter !== 'all') {
            filtered = filtered.filter(category => category.status === currentFilter);
        }

        // lọc theo tìm kiếm
        if (currentSearchTerm) {
            let searchTermLower = currentSearchTerm.toLowerCase().trim();
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(searchTermLower)
            );
        }
        return filtered;
    }

    function renderCategories() {
        sortCategories(); 

        categoryTableBody.innerHTML = '';
        let filteredCategories = getFilteredCategories();
        let totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0 && currentPage > 1) {
             currentPage = 1;
        } else if (totalPages === 0) {
            currentPage = 1;
        }

        let startIndex = (currentPage - 1) * categoriesPerPage;
        let endIndex = startIndex + categoriesPerPage;
        let categoriesToRender = filteredCategories.slice(startIndex, endIndex);

        if (categoriesToRender.length === 0 && filteredCategories.length === 0) {
            let row = categoryTableBody.insertRow();
            let cell = row.insertCell();
            cell.colSpan = 3;
            // cell.textContent = 'Không có môn học nào phù hợp.'; 
            // cell.style.textAlign = 'center';
        } else {
            categoriesToRender.forEach(category => {
                let row = createCategoryRow(category);
                categoryTableBody.appendChild(row);
            });
        }

        addDeleteEventListeners();
        addEditEventListeners();
        renderPagination();
    }

    function addEditEventListeners() {
        categoryTableBody.querySelectorAll('.edit').forEach(button => {
            let newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function () {
                let categoryId = parseInt(this.dataset.categoryId, 10);
                openEditModal(categoryId);
            });
        });
    }

    function openEditModal(categoryId) {
        let category = categories.find(c => c.id === categoryId);
        if (category) {
            document.getElementById('edit-category-id').value = category.id;
            document.getElementById('edit-category-name').value = category.name;
            if (category.status === 'active') {
                document.getElementById('edit-category-status-active').checked = true;
            } else {
                document.getElementById('edit-category-status-inactive').checked = true;
            }
            editCategoryModal.style.display = 'block';
            document.getElementById('edit-category-name').focus();
        }
        // else {
        //     console.error("Category not found for editing:", categoryId);
        //      Swal.fire('Lỗi', 'Không tìm thấy môn học để chỉnh sửa.', 'error');
        // }
    }

     function updateCategory(categoryId, newName, newStatus) {
        let categoryIndex = categories.findIndex(category => category.id === categoryId);
        if (categoryIndex !== -1) {
            let trimmedNewName = newName.trim();
            let isDuplicate = categories.some((cat, index) =>
                index !== categoryIndex && cat.name.toLowerCase() === trimmedNewName.toLowerCase()
            );

            if (isDuplicate) {
                Swal.fire('Lỗi', 'Tên môn học đã tồn tại.', 'error');
                document.getElementById('edit-category-name').focus();
                return;
            }
            categories[categoryIndex].name = trimmedNewName;
            categories[categoryIndex].status = newStatus;
            saveToLocalStorage();
            renderCategories();
            Swal.fire({
                title: 'Cập nhật môn học thành công!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
        // else {
        //      console.error("Category not found for updating:", categoryId);
        //      Swal.fire('Lỗi', 'Không tìm thấy môn học để cập nhật.', 'error');
        // }
    }

     function addDeleteEventListeners() {
        categoryTableBody.querySelectorAll('.delete').forEach(button => {
            let newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function () {
                let categoryId = parseInt(this.dataset.categoryId, 10);
                deleteCategory(categoryId);
            });
        });
    }

    function deleteCategory(categoryId) {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                let categoryIndex = categories.findIndex(category => category.id === categoryId);
                if (categoryIndex !== -1) {
                    categories.splice(categoryIndex, 1);
                    saveToLocalStorage();
                    let filteredCount = getFilteredCategories().length;
                    let totalPages = Math.ceil(filteredCount / categoriesPerPage);
                    if (currentPage > totalPages && totalPages > 0) {
                        currentPage = totalPages;
                    } else if (currentPage > 1 && filteredCount % categoriesPerPage === 0 && categoryTableBody.rows.length === 1) {
                        // currentPage--;
                    }
                    renderCategories();
                    Swal.fire(
                        'Đã xóa!',
                        'Môn học đã được xóa.',
                        'success'
                    );
                }
                // else {
                //     console.error("Category not found for deletion:", categoryId);
                //     Swal.fire('Lỗi', 'Không tìm thấy môn học để xóa.', 'error');
                // }
            }
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        addCategoryForm.reset();
        // document.getElementById('category-status-active').checked = true; 
        addCategoryModal.style.display = 'block';
        document.getElementById('category-name').focus();
    });

    closeModal.addEventListener('click', () => {
        addCategoryModal.style.display = 'none';
    });

    closeEditModal.addEventListener('click', () => {
        editCategoryModal.style.display = 'none';
    });

    // chức năng bấm thoát khỏi modal khi click ra ngoài modal
    // window.addEventListener('click', (event) => {
    //     if (event.target == addCategoryModal) {
    //         addCategoryModal.style.display = 'none';
    //     }
    //     if (event.target == editCategoryModal) {
    //         editCategoryModal.style.display = 'none';
    //     }
    // });
    addCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let categoryNameInput = document.getElementById('category-name');
        let categoryName = categoryNameInput.value.trim();
        // if (!categoryName) {
        //      Swal.fire('Lỗi', 'Tên môn học không được để trống.', 'error');
        //      categoryNameInput.focus();
        //      return;
        // }

        let isDuplicate = categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (isDuplicate) {
            Swal.fire('Lỗi', 'Tên môn học đã tồn tại.', 'error');
            categoryNameInput.focus();
            return;
        }
        let categoryStatusInput = document.querySelector('input[name="category-status"]:checked');
        if (!categoryStatusInput) {
             Swal.fire('Lỗi', 'Vui lòng chọn trạng thái.', 'error');
             return;
        }
        let categoryStatus = categoryStatusInput.value;
        let newCategory = {
            id: nextCategoryId++,
            name: categoryName,
            status: categoryStatus,
        };

        categories.push(newCategory);
        saveToLocalStorage();
        // sortDirection = 'none';
        currentPage = Math.ceil(getFilteredCategories().length / categoriesPerPage);
        renderCategories();
        addCategoryModal.style.display = 'none';

         Swal.fire({
            title: 'Thêm môn học thành công!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    });
    editCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let categoryId = parseInt(document.getElementById('edit-category-id').value, 10);
        let categoryNameInput = document.getElementById('edit-category-name');
        let categoryName = categoryNameInput.value.trim();
        let categoryStatusInput = document.querySelector('input[name="edit-category-status"]:checked');

        if (!categoryName) {
             Swal.fire('Lỗi', 'Tên môn học không được để trống.', 'error');
             categoryNameInput.focus();
             return;
        }
        if (!categoryStatusInput) {
             Swal.fire('Lỗi', 'Vui lòng chọn trạng thái.', 'error');
             return;
        }
        let categoryStatus = categoryStatusInput.value;

        updateCategory(categoryId, categoryName, categoryStatus);
        editCategoryModal.style.display = 'none';
    });

    statusFilter.addEventListener('change', () => {
        currentFilter = statusFilter.value;
        currentPage = 1;
        renderCategories();
    });

    searchInput.addEventListener('input', () => {
        currentSearchTerm = searchInput.value;
        currentPage = 1;
        renderCategories();
    });

    arrowDownBtn.addEventListener('click', () => {
        if (sortDirection === 'none' || sortDirection === 'desc') {
            sortDirection = 'asc';
            // arrowDownBtn.style.transform = 'rotate(180deg)';
        } else {
            sortDirection = 'desc';
            // arrowDownBtn.style.transform = 'rotate(0deg)';
        }
        currentPage = 1;
        renderCategories(); 
    });

    function renderPagination() {
        paginationContainer.innerHTML = '';
        let filteredCategories = getFilteredCategories(); 
        let totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

        if (totalPages <= 1) {
            return;
        }
        let prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCategories();
            }
        });
        paginationContainer.appendChild(prevButton);
        let maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

         if (endPage === totalPages && totalPages >= maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }


        if (startPage > 1) {
            let firstButton = document.createElement('button');
            firstButton.textContent = '1';
            firstButton.addEventListener('click', () => {
                currentPage = 1;
                renderCategories();
            });
            paginationContainer.appendChild(firstButton);
            if (startPage > 2) {
                 let ellipsis = document.createElement('span');
                 ellipsis.textContent = '...';
                 ellipsis.style.margin = '0 5px';
                 paginationContainer.appendChild(ellipsis);
            }
        }


        for (let i = startPage; i <= endPage; i++) {
            let button = document.createElement('button');
            button.textContent = i;
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                renderCategories();
            });
            paginationContainer.appendChild(button);
        }

         if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                 let ellipsis = document.createElement('span');
                 ellipsis.textContent = '...';
                 ellipsis.style.margin = '0 5px';
                 paginationContainer.appendChild(ellipsis);
            }
             let lastButton = document.createElement('button');
            lastButton.textContent = totalPages;
            lastButton.addEventListener('click', () => {
                currentPage = totalPages;
                renderCategories();
            });
            paginationContainer.appendChild(lastButton);
        }

        let nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCategories();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    renderCategories();
    let userLogoutBtn = document.getElementById('user-logout-btn');
    if (userLogoutBtn) {
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
                    // localStorage.removeItem('categories');
                    // localStorage.removeItem('nextCategoryId');
                    // localStorage.removeItem('userToken');
                    window.location.href = './login.html';
                }
            });
        });
    } 
    // else {
    //     console.warn("Logout button ('user-logout-btn') not found.");
    // }

});
