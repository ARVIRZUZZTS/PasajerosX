const sidebar = document.getElementById("sidebar");
const toggleClose = document.getElementById("toggleClose");
const toggleIcon = document.getElementById("toggleIcon");
const toggleLabel = document.getElementById("toggleLabel");
const themeToggle = document.getElementById("themeToggle");
const notifBtn = document.getElementById("notifBtn");
const navOptions = document.querySelectorAll(".nav-option");
const titleRow = document.querySelector(".title-row");
const chevronDown = document.getElementById("chevronDown");
const accountSection = document.getElementById("accountSection");
const titleText = document.getElementById("titleText");

let isDark = false;
let selectedOption = "Dashboard";
let notifCount = 3;

function applyTheme() {
    if (isDark) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

function toggleTheme() {
    isDark = !isDark;
    applyTheme();
}

function toggleSidebar() {
    sidebar.classList.toggle("collapsed");

    const isCollapsed = sidebar.classList.contains("collapsed");

    if (isCollapsed) {
        toggleIcon.innerHTML = `
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
        `;
        toggleLabel.textContent = "Show";
    } else {
        toggleIcon.innerHTML = `
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
        `;
        toggleLabel.textContent = "Hide";
    }
}

function selectOption(option) {
    selectedOption = option;

    navOptions.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.option === option) {
            btn.classList.add("active");
        }
    });
}

function updateNotifBadge() {
    const salesBadge = document.querySelector('[data-option="Sales"] .nav-badge');
    const membersBadge = document.querySelector('[data-option="Members"] .nav-badge');

    if (salesBadge) {
        salesBadge.textContent = notifCount;
    }

    if (membersBadge) {
        membersBadge.textContent = notifCount * 4;
    }
}

function toggleMobileSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("mobile-open");
    }
}

toggleClose.addEventListener("click", toggleSidebar);
themeToggle.addEventListener("click", toggleTheme);
titleRow.addEventListener("click", toggleSidebar);
chevronDown.addEventListener("click", toggleSidebar);

navOptions.forEach(btn => {
    btn.addEventListener("click", () => {
        selectOption(btn.dataset.option);
        toggleMobileSidebar();
    });
});

notifBtn.addEventListener("click", () => {
    notifCount = notifCount > 0 ? 0 : 3;
    updateNotifBadge();

    const dot = notifBtn.querySelector(".notif-dot");
    if (dot) {
        dot.style.display = notifCount > 0 ? "block" : "none";
    }
});

applyTheme();
updateNotifBadge();
