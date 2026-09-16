const API_URL = "https://codealpha-project-management-api.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("taskId");
const projectId = urlParams.get("projectId");

const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const commentMessage = document.getElementById("commentMessage");
const commentsList = document.getElementById("commentsList");


// Load comments
async function loadComments() {

    if (!taskId) {
        commentsList.innerHTML = "<p>Task not found.</p>";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/comments/task/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            commentsList.innerHTML = `<p>${data.message || "Failed to load comments."}</p>`;
            return;
        }

        if (data.length === 0) {
            commentsList.innerHTML = "<p>No comments yet.</p>";
            return;
        }

        commentsList.innerHTML = "";

        data.forEach(comment => {

            const commentCard = document.createElement("div");

            commentCard.className = "project-card";

            commentCard.innerHTML = `
                <h3>${comment.user?.name || "User"}</h3>
                <p>${comment.text}</p>
            `;

            commentsList.appendChild(commentCard);
        });

    } catch (error) {
        console.error(error);
        commentsList.innerHTML = "<p>Server error. Please try again.</p>";
    }
}


// Add comment
commentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const text = commentText.value.trim();

    if (!text) {
        commentMessage.textContent = "Please write a comment.";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/comments`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                text: text,
                task: taskId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            commentMessage.textContent =
                data.message || "Failed to add comment.";
            return;
        }

        commentMessage.textContent = "Comment added successfully.";

        commentText.value = "";

        loadComments();

    } catch (error) {

        console.error(error);

        commentMessage.textContent =
            "Server error. Please try again.";
    }
});


// Back to project board
document.getElementById("backBtn").addEventListener("click", () => {

    if (projectId) {
        window.location.href = `project.html?id=${projectId}`;
    } else {
        window.location.href = "projects.html";
    }

});


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

});


// Initial load
loadComments();
