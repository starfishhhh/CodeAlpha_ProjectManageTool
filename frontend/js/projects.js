const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));


// Protect page
if (!token) {
    window.location.href = "login.html";
}


// Show username
if (user) {
    document.getElementById("welcomeUser").textContent =
        `Hi, ${user.name}`;
}


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// Show project form
document.getElementById("showProjectFormBtn").addEventListener("click", () => {
    document
        .getElementById("projectFormContainer")
        .classList.remove("hidden");
});


// Cancel project form
document.getElementById("cancelProjectBtn").addEventListener("click", () => {
    document
        .getElementById("projectFormContainer")
        .classList.add("hidden");
});


// Create project
document.getElementById("projectForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("projectName").value;
    const description = document.getElementById("projectDescription").value;

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description
            })
        });

        const data = await response.json();

        document.getElementById("projectMessage").textContent =
            data.message;

        if (response.ok) {
            document.getElementById("projectForm").reset();

            document
                .getElementById("projectFormContainer")
                .classList.add("hidden");

            loadProjects();
        }

    } catch (error) {
        document.getElementById("projectMessage").textContent =
            "Unable to connect to server.";
    }
});


// Load projects
async function loadProjects() {

    try {

        const response = await fetch(`${API_URL}/projects`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const projects = await response.json();

        const projectsList = document.getElementById("projectsList");

        if (!projects.length) {
            projectsList.innerHTML =
                "<p>No projects yet. Create your first project!</p>";
            return;
        }

        projectsList.innerHTML = projects.map(project => `
            <div class="project-card">

                <h2>${project.name}</h2>

                <p>
                    ${project.description || "No description"}
                </p>

                <p>
                    <strong>Members:</strong>
                    ${project.members.length}
                </p>

                <button
                    onclick="openProject('${project._id}')"
                >
                    Open Project
                </button>

            </div>
        `).join("");

    } catch (error) {

        document.getElementById("projectsList").innerHTML =
            "<p>Failed to load projects.</p>";

    }
}


// Open project
function openProject(projectId) {
    window.location.href = `project.html?id=${projectId}`;
}


// Initial load
loadProjects();
