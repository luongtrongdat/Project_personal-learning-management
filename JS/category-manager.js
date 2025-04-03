document.addEventListener('DOMContentLoaded', function () {
    let categoryTableBody = document.getElementById('category-table-body');
    let addCategoryBtn = document.getElementById('add-category-btn');
    let addCategoryModal = document.getElementById('add-category-modal');
    let closeModal = document.querySelector('.close');
    let addCategoryForm = document.getElementById('add-category-form');
    let paginationContainer = document.getElementById('pagination');
    let statusFilter = document.getElementById('status-filter');
    //edit
    let editCategoryModal = document.getElementById('edit-category-modal');
    let closeEditModal = document.querySelector('.close-edit');
    let editCategoryForm = document.getElementById('edit-category-form');

    let categories = [
        { id: 1, name: 'Lập trình C', status: 'active' },
        { id: 2, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
        { id: 3, name: 'Lập trình Backend với Spring Boot', status: 'active' },
        { id: 4, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
        { id: 5, name: 'Lập trình C', status: 'active' },
        { id: 6, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
        { id: 7, name: 'Lập trình Backend với Spring Boot', status: 'active' },
        { id: 8, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
        { id: 9, name: 'Lập trình C', status: 'active' },
        { id: 10, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
        { id: 11, name: 'Lập trình Backend với Spring Boot', status: 'active' },
        { id: 12, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
        { id: 13, name: 'Lập trình C', status: 'active' },
        { id: 14, name: 'Lập trình Frontend với ReactJS', status: 'inactive' },
        { id: 15, name: 'Lập trình Backend với Spring Boot', status: 'active' },
        { id: 16, name: 'Lập trình Frontend với VueJS', status: 'inactive' },
    ];
    let nextCategoryId = 17;
    let categoriesPerPage = 5;
    let currentPage = 1;

    function createCategoryRow(category) {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td><span class="${category.status}">${category.status === 'active' ? '● Đang hoạt động' : '● Ngừng hoạt động'}</span></td>
            <td>
                <button class="delete" data-category-id="${category.id}"><img src="../Asset/Icon/Button.png" alt=""></button>
                <button class="edit" data-category-id="${category.id}"><img src="../Asset/Icon/pen.png" alt=""></button>
            </td>
        `;
        return row;
    }

    function renderCategories() {
        categoryTableBody.innerHTML = '';
        let startIndex = (currentPage - 1) * categoriesPerPage;
        let endIndex = startIndex + categoriesPerPage;
        let categoriesToRender = categories.slice(startIndex, endIndex);
        categoriesToRender.forEach(category => {
            let row = createCategoryRow(category);
            categoryTableBody.appendChild(row);
        });
        addDeleteEventListeners();
        addEditEventListeners();
    }
    //edit
    function addEditEventListeners() {
        let editButtons = document.querySelectorAll('.edit');
        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                let categoryId = this.dataset.categoryId;
                openEditModal(categoryId);
            });
        });
    }
    function openEditModal(categoryId) {
        let category = categories.find(c => c.id == categoryId);
        if (category) {
            document.getElementById('edit-category-id').value = category.id;
            document.getElementById('edit-category-name').value = category.name;
            if (category.status === 'active') {
                document.getElementById('edit-category-status-active').checked = true;
            } else {
                document.getElementById('edit-category-status-inactive').checked = true;
            }
            editCategoryModal.style.display = 'block';
        }
    }
    function updateCategory(categoryId, newName, newStatus) {
        let categoryIndex = categories.findIndex(category => category.id == categoryId);
        if (categoryIndex !== -1) {
            categories[categoryIndex].name = newName;
            categories[categoryIndex].status = newStatus;
            renderCategories();
            renderPagination();
            Swal.fire({
                title: 'Cập nhật môn học thành công!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
    function addDeleteEventListeners() {
        let deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                let categoryId = this.dataset.categoryId;
                deleteCategory(categoryId);
            });
        });
    }

    function deleteCategory(categoryId) {
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
                let categoryIndex = categories.findIndex(category => category.id == categoryId);
                if (categoryIndex !== -1) {
                    categories.splice(categoryIndex, 1);
                    renderCategories();
                    renderPagination();
                    Swal.fire(
                        'Đã xóa!',
                        'Môn học đã được xóa.',
                        'success'
                    );
                }
            }
        });
    }
    addCategoryBtn.addEventListener('click', () => {
        addCategoryModal.style.display = 'block';
    });
    closeModal.addEventListener('click', () => {
        addCategoryModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == addCategoryModal) {
            addCategoryModal.style.display = 'none';
        }
    });
    addCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let categoryName = document.getElementById('category-name').value;
        let categoryStatus = document.querySelector('input[name="category-status"]:checked').value;

        let newCategory = {
            id: nextCategoryId++,
            name: categoryName,
            status: categoryStatus,
        };

        categories.push(newCategory);
        renderCategories();
        renderPagination();
        addCategoryModal.style.display = 'none';
        addCategoryForm.reset();
    });
    //edit
    closeEditModal.addEventListener('click', () => {
        editCategoryModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == editCategoryModal) {
            editCategoryModal.style.display = 'none';
        }
    });
    editCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let categoryId = document.getElementById('edit-category-id').value;
        let categoryName = document.getElementById('edit-category-name').value;
        let categoryStatus = document.querySelector('input[name="edit-category-status"]:checked').value;
        updateCategory(categoryId, categoryName, categoryStatus);
        editCategoryModal.style.display = 'none';
    });
    //filter
    statusFilter.addEventListener('change', () => {
        let selectedStatus = statusFilter.value;
        filterCategories(selectedStatus);
    });

    function filterCategories(status) {
        currentPage = 1;
        let filteredCategories = status === 'all' ? categories : categories.filter(category => category.status === status);
        renderCategoriesByFilter(filteredCategories);
        renderPaginationByFilter(filteredCategories);
    }
    function renderCategoriesByFilter(filteredCategories) {
        categoryTableBody.innerHTML = '';
        let startIndex = (currentPage - 1) * categoriesPerPage;
        let endIndex = startIndex + categoriesPerPage;
        let categoriesToRender = filteredCategories.slice(startIndex, endIndex);
        categoriesToRender.forEach(category => {
            let row = createCategoryRow(category);
            categoryTableBody.appendChild(row);
        });
        addDeleteEventListeners();
        addEditEventListeners();
    }
    function renderPaginationByFilter(filteredCategories) {
        paginationContainer.innerHTML = '';
        let totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
        let prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCategoriesByFilter(filteredCategories);
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(prevButton);
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                renderCategoriesByFilter(filteredCategories);
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        let nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCategoriesByFilter(filteredCategories);
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(nextButton);
        updatePaginationButtons();
    }
    function renderPagination() {
        paginationContainer.innerHTML = '';
        let totalPages = Math.ceil(categories.length / categoriesPerPage);
        let prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCategories();
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(prevButton);
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                renderCategories();
                updatePaginationButtons();
            });
            paginationContainer.appendChild(button);
        }
        let nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCategories();
                updatePaginationButtons();
            }
        });
        paginationContainer.appendChild(nextButton);
        updatePaginationButtons();
    }

    function updatePaginationButtons() {
        let buttons = paginationContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        buttons[currentPage].classList.add('active');
    }

    renderCategories();
    renderPagination();
});
