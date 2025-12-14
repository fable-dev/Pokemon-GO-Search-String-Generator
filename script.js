// --- DOM ELEMENTS ---
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');
const logicToggle = document.getElementById('logic-toggle');   // Checked = AND (&)
const appendToggle = document.getElementById('append-toggle'); // Checked = Append
const checkboxes = document.querySelectorAll('.filter');

// Text Inputs
const inputName = document.getElementById('input-name');
const checkFamily = document.getElementById('check-family');
const inputAge = document.getElementById('input-age');
const inputYear = document.getElementById('input-year');
const inputMove = document.getElementById('input-move');
// Ranges
const cpMin = document.getElementById('cp-min');
const cpMax = document.getElementById('cp-max');
const distMin = document.getElementById('dist-min');
const distMax = document.getElementById('dist-max');

// Group text inputs for easier handling
const textInputs = [inputName, inputAge, inputYear, inputMove, cpMin, cpMax, distMin, distMax];

// --- THEME LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
// Initial Load
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.style.backgroundColor = "rgba(255,255,255,0.3)";
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});


// --- CORE GENERATOR LOGIC ---

// 1. Checkboxes (Keep these auto-updating for Append/Replace)
checkboxes.forEach(box => {
    box.addEventListener('change', (e) => {
        if (appendToggle.checked) {
            if (box.checked) {
                addTermToOutput(box.value);
                box.checked = false; 
            }
        } else {
            // In Replace mode, checkboxes still toggle logic on/off in the big string? 
            // Actually, based on your request, you likely want full manual control.
            // But usually checkboxes are instant. Let's keep checkboxes instant for now.
            generateString();
        }
    });
});

// 2. Text Inputs: REMOVE 'input' listeners. ONLY use Enter key.
textInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop form submission if any
            
            // Identify which type of input this is based on ID
            if (input === inputName) triggerAdd('name');
            else if (input === inputAge) triggerAdd('age');
            else if (input === inputYear) triggerAdd('year');
            else if (input === inputMove) triggerAdd('move');
            else if (input === cpMin || input === cpMax) triggerAdd('cp');
            else if (input === distMin || input === distMax) triggerAdd('distance');
        }
    });
});


// --- MANUAL TRIGGER FUNCTION (The + Button) ---
function triggerAdd(type) {
    let term = "";

    // 1. Determine the search term based on type
    if (type === 'name') {
        const val = inputName.value.trim();
        if (val) term = checkFamily.checked ? '+' + val : val;
        inputName.value = ""; // Clear after add
    } 
    else if (type === 'age') {
        if (inputAge.value) {
            term = `age${inputAge.value}`;
            inputAge.value = "";
        }
    } 
    else if (type === 'year') {
        if (inputYear.value) {
            term = `year${inputYear.value}`;
            inputYear.value = "";
        }
    } 
    else if (type === 'move') {
        if (inputMove.value.trim()) {
            term = inputMove.value.trim();
            inputMove.value = "";
        }
    } 
    else if (type === 'cp') {
        if (cpMin.value || cpMax.value) {
            term = `cp${cpMin.value}-${cpMax.value}`;
            cpMin.value = ""; cpMax.value = "";
        }
    } 
    else if (type === 'distance') {
        if (distMin.value || distMax.value) {
            term = `distance${distMin.value}-${distMax.value}`;
            distMin.value = ""; distMax.value = "";
        }
    }

    if (!term) return; // Do nothing if empty

    // 2. Add to Output (Respecting Toggle)
    if (appendToggle.checked) {
        addTermToOutput(term);
    } else {
        // Replace Mode:
        // If the user manually clicks "+", they probably expect it to 
        // become the *only* thing in the box (Replace).
        clearAll(false);
        outputBox.value = term;
    }
}


// --- GENERATOR FUNCTIONS ---

// Adds a single term to the existing string (Append Mode)
function addTermToOutput(term) {
    const currentText = outputBox.value.trim();
    const separator = logicToggle.checked ? '&' : ',';
    
    if (currentText.length > 0) {
        outputBox.value = currentText + separator + term;
    } else {
        outputBox.value = term;
    }
    
    // Visual Feedback
    outputBox.style.borderColor = 'var(--primary)';
    setTimeout(() => outputBox.style.borderColor = 'var(--border)', 300);
}

// Regenerates the entire string from scratch (Replace Mode)
function generateString() {
    let terms = [];

    // Text Inputs
    if (inputName.value.trim()) {
        let val = inputName.value.trim();
        if (checkFamily.checked) val = '+' + val;
        terms.push(val);
    }
    if (inputAge.value) terms.push(`age${inputAge.value}`);
    if (inputYear.value) terms.push(`year${inputYear.value}`);
    if (inputMove.value.trim()) terms.push(inputMove.value.trim());
    if (cpMin.value || cpMax.value) terms.push(`cp${cpMin.value || ''}-${cpMax.value || ''}`);
    if (distMin.value || distMax.value) terms.push(`distance${distMin.value || ''}-${distMax.value || ''}`);

    // Checkboxes
    Array.from(checkboxes).filter(box => box.checked).forEach(box => terms.push(box.value));

    // Join
    const separator = logicToggle.checked ? '&' : ',';
    outputBox.value = terms.join(separator);
}

// --- PRESET LOGIC ---
function applyPreset(presetString) {
    if (appendToggle.checked) {
        addTermToOutput(presetString);
    } else {
        clearAll(false);
        outputBox.value = presetString;
    }
}

// --- UTILITIES ---
function copyText() {
    if (!outputBox.value) return; 
    outputBox.select();
    outputBox.setSelectionRange(0, 99999); 
    navigator.clipboard.writeText(outputBox.value).then(() => {
        copyFeedback.style.opacity = '1';
        setTimeout(() => copyFeedback.style.opacity = '0', 2000);
    });
}

function clearAll(clearOutput = true) {
    checkboxes.forEach(box => box.checked = false);
    textInputs.forEach(input => input.value = '');
    checkFamily.checked = false;
    if (clearOutput) outputBox.value = '';
}


// --- SAVED SEARCHES & IMPORT/EXPORT ---
const savedSection = document.getElementById('saved-section');
const savedList = document.getElementById('saved-list');

document.addEventListener('DOMContentLoaded', renderSavedStrings);

function saveCurrentString() {
    const currentString = outputBox.value.trim();
    if (!currentString) { alert("Create a search string first!"); return; }
    const name = prompt("Name this search (e.g. 'Trade Cleanup'):");
    if (!name) return;

    let saved = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
    saved.push({ name: name, string: currentString });
    localStorage.setItem('pogoSavedStrings', JSON.stringify(saved));
    renderSavedStrings();
}

function renderSavedStrings() {
    const saved = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
    savedSection.style.display = 'block';
    savedList.innerHTML = '';

    if (saved.length === 0) {
        savedList.innerHTML = `<p style="text-align: center; font-style: italic; opacity: 0.6; font-size: 0.85rem; margin: 10px 0;">No saved searches yet.</p>`;
        return;
    }

    saved.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerHTML = `
            <span class="saved-name" onclick="applyPreset('${item.string}')">${item.name}</span>
            <button class="delete-btn" onclick="deleteSavedString(${index})">×</button>
        `;
        savedList.appendChild(div);
    });
}

function deleteSavedString(index) {
    let saved = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
    saved.splice(index, 1);
    localStorage.setItem('pogoSavedStrings', JSON.stringify(saved));
    renderSavedStrings();
}

function exportData() {
    const saved = localStorage.getItem('pogoSavedStrings');
    if (!saved || JSON.parse(saved).length === 0) { alert("No saved searches to export!"); return; }
    const blob = new Blob([saved], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pogo-search-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function triggerImport() { document.getElementById('import-file').click(); }

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) throw new Error("Invalid format");
            let currentData = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
            let addedCount = 0;
            importedData.forEach(newItem => {
                const exists = currentData.some(existing => existing.string === newItem.string);
                if (!exists && newItem.name && newItem.string) {
                    currentData.push(newItem);
                    addedCount++;
                }
            });
            localStorage.setItem('pogoSavedStrings', JSON.stringify(currentData));
            renderSavedStrings();
            alert(`Successfully imported ${addedCount} new searches!`);
        } catch (err) { alert("Error importing file: Invalid JSON."); }
        input.value = '';
    };
    reader.readAsText(file);
}


// --- TOOLTIP LOGIC (Mobile Tap vs Desktop Hover) ---
const tooltips = document.querySelectorAll('.tooltip-container');
tooltips.forEach(container => {
    const icon = container.querySelector('.info-icon');
    if (!icon) return;
    icon.addEventListener('click', (e) => {
        if (window.innerWidth > 600) return; // Desktop uses CSS hover
        e.stopPropagation(); 
        tooltips.forEach(t => t.classList.remove('active'));
        container.classList.toggle('active');
    });
});
document.addEventListener('click', () => {
    tooltips.forEach(t => t.classList.remove('active'));
});
