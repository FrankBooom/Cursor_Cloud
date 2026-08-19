let nextId = 1;
let tasks = [];

export function reset(seed = []) {
  tasks = [];
  nextId = 1;
  for (const title of seed) {
    createTask(title);
  }
  return listTasks();
}

export function listTasks() {
  return tasks.map((task) => ({ ...task }));
}

export function createTask(title) {
  const trimmed = typeof title === "string" ? title.trim() : "";
  if (!trimmed) {
    const error = new Error("Task title is required");
    error.status = 400;
    throw error;
  }
  const task = {
    id: nextId++,
    title: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return { ...task };
}

export function updateTask(id, changes) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }
  if (typeof changes.done === "boolean") {
    task.done = changes.done;
  }
  if (typeof changes.title === "string" && changes.title.trim()) {
    task.title = changes.title.trim();
  }
  return { ...task };
}

export function deleteTask(id) {
  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }
  const [removed] = tasks.splice(index, 1);
  return { ...removed };
}
