const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("new-task-form");
const input = document.getElementById("task-input");

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

function render(tasks) {
  taskList.replaceChildren();
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task${task.done ? " task--done" : ""}`;
    item.dataset.id = String(task.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task__checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task, checkbox.checked));

    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.className = "task__delete";
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.textContent = "\u00d7";
    remove.addEventListener("click", () => removeTask(task));

    item.append(checkbox, title, remove);
    taskList.append(item);
  }
}

async function loadTasks() {
  render(await api("/api/tasks"));
}

async function toggleTask(task, done) {
  await api(`/api/tasks/${task.id}`, {
    method: "PATCH",
    body: JSON.stringify({ done }),
  });
  await loadTasks();
}

async function removeTask(task) {
  await api(`/api/tasks/${task.id}`, { method: "DELETE" });
  await loadTasks();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  input.value = "";
  input.focus();
  await loadTasks();
});

loadTasks().catch((error) => {
  console.error(error);
  emptyState.hidden = false;
  emptyState.textContent = "Failed to load tasks. Is the server running?";
});
