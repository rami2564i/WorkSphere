// ---- ELEMENTS ----
const addBtn = document.getElementById("addWorkerBtn");
const modal = document.getElementById("workerModal");
const workerForm = document.getElementById("worker-form");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photo-preview");
const experiencesContainer = document.getElementById("experiences-container");
const addExpBtn = document.getElementById("add-experience-btn");
const workerList = document.querySelector(".unassigned-list");
const zones = document.querySelectorAll(".zone");

// ---- OPEN / CLOSE MODAL ----
addBtn.onclick = () => modal.style.display = "flex";
modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ---- PHOTO PREVIEW ----
photoInput.addEventListener("input", () => {
    const url = photoInput.value.trim();
    photoPreview.innerHTML = url ?
        `<img src="${url}" style="width:80px;height:80px;border-radius:50%;">` :
        '';
});

// ---- ADD EXPERIENCE ----
addExpBtn.addEventListener("click", () => {
    const expDiv = document.createElement("div");
    expDiv.classList.add("experience");

    expDiv.innerHTML = `
        <input type="text" class="job-title" placeholder="Job Title">
        <input type="date" class="start-date">
        <input type="date" class="end-date">
        <button type="button" class="remove-exp">Remove</button>
    `;

    expDiv.querySelector(".remove-exp").onclick = () => expDiv.remove();
    experiencesContainer.appendChild(expDiv);
});

// ---- VALIDATION ----
function isNotEmpty(v) { return v.trim() !== ""; }

function isValidName(v) { return /^[A-Za-z\s]+$/.test(v); }

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

// ---- MAKE DRAGGABLE ----
function makeDraggable(card) {
    card.setAttribute("draggable", "true");

    card.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", e.target.id);
    });
}

// ---- ADD REMOVE BUTTON ----
function addRemoveButton(emp) {
    const removeBtn = document.createElement("button");
    removeBtn.innerText = "X";
    removeBtn.classList.add("remove-btn");

    removeBtn.onclick = () => {
        workerList.appendChild(emp);
    };

    emp.appendChild(removeBtn);
}

// ---- SUBMIT FORM ----
workerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    const photo = photoInput.value.trim();

    if (!isNotEmpty(name) || !isNotEmpty(email) || !isNotEmpty(role))
        return alert("Please fill all required fields.");
    if (!isValidName(name)) return alert("Name must contain only letters.");
    if (!isValidEmail(email)) return alert("Invalid email format.");

    const finalPhoto = photo !== "" ? photo : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const experiences = [];
    document.querySelectorAll(".experience").forEach(exp => {
        const title = exp.querySelector(".job-title").value.trim();
        const start = exp.querySelector(".start-date").value;
        const end = exp.querySelector(".end-date").value;

        if (title || start || end) {
            if (!title || !start || !end)
                return alert("Fill all experience fields or remove.");
            if (new Date(start) > new Date(end))
                return alert("Start date cannot be after end date.");
            experiences.push({ title, start, end });
        }
    });

    // ---- CREATE EMPLOYEE CARD ----
    const card = document.createElement("li");
    card.classList.add("employee-card");
    card.id = "emp-" + Date.now();
    card.innerHTML = `
        <img src="${finalPhoto}" alt="Profile">
        <span>${name}</span>
        <span class="role">${role}</span>
    `;

    makeDraggable(card);
    addRemoveButton(card);
    workerList.appendChild(card);

    // ---- RESET FORM ----
    workerForm.reset();
    photoPreview.innerHTML = "";
    experiencesContainer.innerHTML = "";
    modal.style.display = "none";
}); // Allow dropping in zones
zones.forEach(zone => {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();

        const empId = e.dataTransfer.getData("text/plain");
        const employee = document.getElementById(empId);

        if (!employee) return;

        const empRole = employee.querySelector(".role").innerText.trim();

        // Get allowed roles from data-allow attribute
        const allowedRoles = zone.dataset.allow.split(",").map(r => r.trim());

        // If the zone allows all roles ("*"), always allow
        if (allowedRoles.includes("*") || allowedRoles.includes(empRole)) {
            // Append employee to the employees container inside the zone
            zone.querySelector(".employees").appendChild(employee);
        } else {
            alert(`
                Role "${empRole}"
                is not allowed in this zone.`);
        }
    });
});