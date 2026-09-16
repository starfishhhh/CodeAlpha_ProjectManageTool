const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// Protect page
if (!token) {
    window.location.href = "login.html";
}


// Get project ID from URL
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");


// If no project ID
if (!projectId) {
    window.location.href = "projects.html";
}


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// Back to projects
function goBack() {
    window.location.href = "projects.html";
}


// Show task form
document.getElementById("showTaskFormBtn").addEventListener("click", () => {
    document
        .getElementById("taskFormContainer")
        .classList.remove("hidden");
});


// Cancel task form
document.getElementById("cancelTaskBtn").addEventListener("click", () => {
    document
        .getElementById("taskFormContainer")
        .classList.add("hidden");
});


// Load project information
async function loadProject() {

    try {

        const response = await fetch(`${API_URL}/projects`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const projects = await response.json();

        const project = projects.find(
            p => p._id === projectId
        );

        if (!project) {
            alert("Project not found");
            window.location.href = "projects.html";
            return;
        }

        document.getElementById("projectName").textContent =
            project.name;

        document.getElementById("projectDescription").textContent =
            project.description || "No description";

        // Add project members to dropdown
        const assignedTo = document.getElementById("assignedTo");

        project.members.forEach(member => {

            const option = document.createElement("option");

            option.value = member._id;
            option.textContent = member.name;

            assignedTo.appendChild(option);
        });

    } catch (error) {

        console.error("Failed to load project:", error);

    }
}


// Create task
document.getElementById("taskForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const assignedTo = document.getElementById("assignedTo").value;

    try {

        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                title,
                description,
                projectId,
                assignedTo: assignedTo || undefined
            })
        });

        const data = await response.json();

        document.getElementById("taskMessage").textContent =
            data.message;

        if (response.ok) {

            document.getElementById("taskForm").reset();

            document
                .getElementById("taskFormContainer")
                .classList.add("hidden");

            loadTasks();
        }

    } catch (error) {

        document.getElementById("taskMessage").textContent =
            "Unable to connect to server.";

    }

});


// Load tasks
async function loadTasks() {

    try {

        const response = await fetch(
            `${API_URL}/tasks/project/${projectId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const tasks = await response.json();

        const todo = document.getElementById("todoTasks");
        const progress = document.getElementById("progressTasks");
        const done = document.getElementById("doneTasks");

        todo.innerHTML = "";
        progress.innerHTML = "";
        done.innerHTML = "";

        tasks.forEach(task => {

            const card = document.createElement("div");

            card.className = "task-card";

            card.innerHTML = `
                <h3>${task.title}</h3>

                <p>
                    ${task.description || "No description"}
                </p>

                <small>
                    Assigned to:
                    ${task.assignedTo
                        ? task.assignedTo.name
                        : "Unassigned"}
                </small>

                <select onchange="updateStatus('${task._id}', this.value)">

                    <option value="To Do"
                        ${task.status === "To Do" ? "selected" : ""}>
                        To Do
                    </option>

                    <option value="In Progress"
                        ${task.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Done"
                        ${task.status === "Done" ? "selected" : ""}>
                        Done
                    </option>

                </select>

                <button onclick="openComments('${task._id}')">
                    Comments
                </button>
            `;

            if (task.status === "To Do") {
                todo.appendChild(card);
            }

            else if (task.status === "In Progress") {
                progress.appendChild(card);
            }

            else {
                done.appendChild(card);
            }

        });

    } catch (error) {

        console.error("Failed to load tasks:", error);

    }
}


// Update task status
async function updateStatus(taskId, status) {

    try {

        await fetch(
            `${API_URL}/tasks/${taskId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    status
                })
            }
        );

        loadTasks();

    } catch (error) {

        console.error("Failed to update status:", error);

    }
}


// Comments page
function openComments(taskId) {

    window.location.href =
        `comments.html?taskId=${taskId}&projectId=${projectId}`;

}


// Initial loading
loadProject();
loadTasks();
