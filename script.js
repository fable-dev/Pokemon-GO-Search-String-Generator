// DOM Elements
const checkboxes = document.querySelectorAll('.filter');
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');
const logicToggle = document.getElementById('logic-toggle'); // Checked = AND (&), Unchecked = OR (,)

// Input Fields
const inputName = document.getElementById('input-name');
const checkFamily = document.getElementById('check-family');
const inputAge = document.getElementById('input-age');
const inputYear = document.getElementById('input-year');
const inputMove = document.getElementById('input-move');
const cpMin = document.getElementById('cp-min');
const cpMax = document.getElementById('cp-max');
const distMin = document.getElementById('dist-min');
const distMax = document.getElementById('dist-max');

// All input fields group for easy event listener adding
const textInputs = [inputName, inputAge, inputYear, inputMove, cpMin, cpMax, distMin, distMax, checkFamily];

// --- THEME LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
}
themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }
});

// --- GENERATOR LOGIC ---

// Add listeners to everything
checkboxes.forEach(box => box.addEventListener('change', generateString));
textInputs.forEach(input => input.addEventListener('input', generateString));
logicToggle.addEventListener('change', generateString);

// Initialize toggle to "AND" (Checked) by default for better utility
logicToggle.checked = true;

function generateString() {
    let terms = [];

    // 1. Process Text Inputs
    
    // Name (e.g. "+Pikachu" or "Pikachu")
    if (inputName.value.trim()) {
        let val = inputName.value.trim();
        if (checkFamily.checked) val = '+' + val;
        terms.push(val);
    }

    // Age (e.g. "age0")
    if (inputAge.value) {
        terms.push(`age${inputAge.value}`);
    }

    // Year (e.g. "year2016")
    if (inputYear.value) {
        terms.push(`year${inputYear.value}`);
    }

    // Move (e.g. "@Psychic")
    if (inputMove.value.trim()) {
        terms.push(inputMove.value.trim());
    }

    // CP Range (e.g. "cp1500-2500", "cp-1500", "cp1500-")
    if (cpMin.value || cpMax.value) {
        let min = cpMin.value || '';
        let max = cpMax.value || '';
        terms.push(`cp${min}-${max}`);
    }

    // Distance Range (e.g. "distance100-")
    if (distMin.value || distMax.value) {
        let min = distMin.value || '';
        let max = distMax.value || '';
        terms.push(`distance${min}-${max}`);
    }

    // 2. Process Checkboxes
    const checkedBoxes = Array.from(checkboxes).filter(box => box.checked);
    checkedBoxes.forEach(box => {
        terms.push(box.value);
    });

    // 3. Join logic
    // If Toggle is CHECKED -> Use AND (&)
    // If Toggle is UNCHECKED -> Use OR (,)
    const separator = logicToggle.checked ? '&' : ',';
    
    outputBox.value = terms.join(separator);
}

function copyText() {
    if (!outputBox.value) return; 
    outputBox.select();
    outputBox.setSelectionRange(0, 99999); 
    navigator.clipboard.writeText(outputBox.value).then(() => {
        copyFeedback.style.opacity = '1';
        setTimeout(() => copyFeedback.style.opacity = '0', 2000);
    });
}

function clearAll() {
    checkboxes.forEach(box => box.checked = false);
    textInputs.forEach(input => {
        if(input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });
    outputBox.value = '';
}
