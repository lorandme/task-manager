const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        };

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = input.value.trim();
    if (taskText) {
        tasks.push(taskText);
        saveTasks();
        renderTasks();
        input.value = '';
    }
});

renderTasks();
