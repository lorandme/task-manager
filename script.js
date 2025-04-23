const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskInputError = document.getElementById('task-input-error');
const taskPriority = document.getElementById('task-priority');
const taskCategory = document.getElementById('task-category');
const taskDueDate = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const noTasksElement = document.getElementById('no-tasks');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const filterCategory = document.getElementById('filter-category');

taskDueDate.value = 'none';

let tasks = [];
let editingTaskId = null;

function init() {
    loadTasks();
    renderTasks();
    updateTaskCount();

    form.addEventListener('submit', handleTaskSubmit);
    searchInput.addEventListener('input', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
    filterPriority.addEventListener('change', applyFilters);
    filterCategory.addEventListener('change', applyFilters);
}

function loadTasks() {
    const savedTasks = localStorage.getItem('taskManagerProTasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error('Error parsing tasks from localStorage', e);
            tasks = [];
        }
    }
}

function saveTasks() {
    localStorage.setItem('taskManagerProTasks', JSON.stringify(tasks));
}

function handleTaskSubmit(e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();

    if (!taskText) {
        showFormError('Please enter a task');
        return;
    }

    if (taskText.length < 3) {
        showFormError('Task must contain at least 3 characters');
        return;
    }

    clearFormError();

    const taskData = {
        id: editingTaskId || Date.now().toString(),
        text: taskText,
        priority: taskPriority.value,
        category: taskCategory.value,
        dueDate: taskDueDate.value ? new Date(taskDueDate.value).toISOString() : null,
        completed: editingTaskId ? tasks.find(task => task.id === editingTaskId)?.completed || false : false,
        createdAt: editingTaskId ? tasks.find(task => task.id === editingTaskId)?.createdAt : new Date().toISOString()
    };

    if (editingTaskId) {
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = taskData;
        }
        editingTaskId = null;
        form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    } else {
        tasks.push(taskData);
    }

    saveTasks();
    renderTasks();
    updateTaskCount();

    form.reset();
    taskDueDate.value = "none"
}

function showFormError(message) {
    taskInputError.textContent = message;
    taskInput.classList.add('error');
}

function clearFormError() {
    taskInputError.textContent = '';
    taskInput.classList.remove('error');
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        noTasksElement.style.display = 'block';
    } else {
        noTasksElement.style.display = 'none';
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `priority-${task.priority}`;
        if (task.completed) {
            li.classList.add('task-completed');
        }

        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'task-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        checkboxDiv.appendChild(checkbox);

        const content = document.createElement('div');
        content.className = 'task-content';

        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';

        const categoryBadge = document.createElement('span');
        categoryBadge.className = `category-badge ${task.category}`;
        categoryBadge.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);

        if (task.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const taskDate = document.createElement('div');
            taskDate.className = 'task-date';

            const icon = document.createElement('i');
            icon.className = 'fas fa-calendar-alt';

            const dateText = document.createElement('span');
            dateText.textContent = formatDate(dueDate);

            if (!task.completed && dueDate < today) {
                taskDate.classList.add('task-overdue');
                dateText.textContent += ' (Overdue)';
            }

            taskDate.appendChild(icon);
            taskDate.appendChild(dateText);
            taskMeta.appendChild(taskDate);
        }

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        content.appendChild(taskText);
        content.appendChild(taskMeta);
        taskMeta.appendChild(categoryBadge);

        taskItem.appendChild(checkboxDiv);
        taskItem.appendChild(content);
        taskItem.appendChild(taskActions);

        li.appendChild(taskItem);
        taskList.appendChild(li);
    });
}

function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    editingTaskId = id;

    taskInput.value = task.text;
    taskPriority.value = task.priority;
    taskCategory.value = task.category;
    taskDueDate.value = task.dueDate ? formatDateForInput(new Date(task.dueDate)) : '';

    form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Task';

    taskInput.focus();

    form.scrollIntoView({ behavior: 'smooth' });
}

function deleteTask(id) {
    if (editingTaskId === id) {
        form.reset();
        editingTaskId = null;
        form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
        taskDueDate.value = formatDateForInput(tomorrow);
    }

    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function getFilteredTasks() {
    return tasks.filter(task => {
        if (filterStatus.value === 'active' && task.completed) return false;
        if (filterStatus.value === 'completed' && !task.completed) return false;

        if (filterPriority.value !== 'all' && task.priority !== filterPriority.value) return false;

        if (filterCategory.value !== 'all' && task.category !== filterCategory.value) return false;

        const searchTerm = searchInput.value.toLowerCase().trim();
        return !searchTerm || task.text.toLowerCase().includes(searchTerm);
    });
}

function applyFilters() {
    renderTasks();
}

function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    taskCount.textContent = `(${totalTasks} total, ${completedTasks} completed)`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

init();