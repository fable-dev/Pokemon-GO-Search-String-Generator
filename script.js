// Select DOM elements
const checkboxes = document.querySelectorAll('.filter');
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');
const themeToggleBtn = document.getElementById('theme-toggle');

// --- THEME LOGIC START ---

// 1. Check if user previously selected dark mode
const currentTheme = localStorage.getItem('theme');

// 2. If saved theme is 'dark', apply it immediately
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️'; // Change icon to sun
}

// 3. Listen for click on the toggle button
themeToggleBtn.addEventListener('click', () => {
    // Check current attribute
    let theme = document.documentElement.getAttribute('data-theme');
    
    if (theme === 'dark') {
        // Switch to Light
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙';
    } else {
        // Switch to Dark
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }
});
// --- THEME LOGIC END ---


// Add event listeners to all checkboxes
checkboxes.forEach(box => {
    box.addEventListener('change', generateString);
});

function generateString() {
    const checkedBoxes = Array.from(checkboxes).filter(box => box.checked);
    const values = checkedBoxes.map(box => box.value);
    const searchString = values.join('&');
    outputBox.value = searchString;
}

function copyText() {
    if (!outputBox.value) return; 

    outputBox.select();
    outputBox.setSelectionRange(0, 99999); 

    navigator.clipboard.writeText(outputBox.value).then(() => {
        copyFeedback.style.opacity = '1';
        setTimeout(() => {
            copyFeedback.style.opacity = '0';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function clearAll() {
    checkboxes.forEach(box => box.checked = false);
    outputBox.value = '';
}
