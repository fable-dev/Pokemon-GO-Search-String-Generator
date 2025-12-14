// DOM Elements
const checkboxes = document.querySelectorAll('.filter');
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');
const logicToggle = document.getElementById('logic-toggle'); // Checked = AND (&)
const appendToggle = document.getElementById('append-toggle'); // Checked = Append

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

const textInputs = [inputName, inputAge, inputYear, inputMove, cpMin, cpMax, distMin, distMax, checkFamily];

// --- THEME LOGIC (Fixed) ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Initialize theme on load
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
} else {
    updateThemeIcon('light');
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    }
});


// --- GENERATOR LOGIC ---
// Add listeners
checkboxes.forEach(box => box.addEventListener('change', () => generateString()));
textInputs.forEach(input => input.addEventListener('input', () => generateString()));
logicToggle.addEventListener('change', () => generateString());

// Main generating function (for manual inputs)
function generateString(isPreset = false) {
    // If this is triggered by a manual input/click, and Append mode is ON,
    // we don't want to regenerate the whole string from scratch.
    // The user is likely trying to build a string piece by piece.
    // So, if append is ON, we only generate if it's NOT a preset click.
    if (appendToggle.checked && !isPreset) {
       // For now, manual inputs will just append to the end. 
       // A more complex system would be needed to edit existing parts.
       // Let's keep it simple: Manual inputs clear and restart unless append is off.
    }

    let terms = [];

    // 1. Process Text Inputs
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

    // 2. Process Checkboxes
    Array.from(checkboxes).filter(box => box.checked).forEach(box => terms.push(box.value));

    // 3. Join logic
    const separator = logicToggle.checked ? '&' : ',';
    outputBox.value = terms.join(separator);
}

// --- PRESET LOGIC (Smarter) ---
function applyPreset(presetString) {
    const shouldAppend = appendToggle.checked;
    const currentText = outputBox.value.trim();

    if (shouldAppend && currentText.length > 0) {
        // APPEND MODE: Add to existing text using selected logic
        const separator = logicToggle.checked ? '&' : ',';
        outputBox.value = currentText + separator + presetString;
    } else {
        // REPLACE MODE: Clear everything and set new text
        clearAll(false); // Don't clear outputbox yet
        outputBox.value = presetString;
    }

    // Visual feedback
    outputBox.style.borderColor = 'var(--primary)';
    setTimeout(() => outputBox.style.borderColor = 'var(--border)', 300);
}


// --- UTILITY FUNCTIONS ---
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
    textInputs.forEach(input => {
        if(input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });
    if (clearOutput) outputBox.value = '';
}


// --- SAVED STRINGS LOGIC ---
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
    if (saved.length === 0) { savedSection.style.display = 'none'; return; }

    savedSection.style.display = 'block';
    savedList.innerHTML = '';
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

// --- TOOLTIP LOGIC (Mobile Tap vs Desktop Hover) ---
const tooltips = document.querySelectorAll('.tooltip-container');

tooltips.forEach(container => {
    const icon = container.querySelector('.info-icon');
    if (!icon) return;

    icon.addEventListener('click', (e) => {
        // CHECK: If screen is wider than 600px (Desktop/Tablet), IGNORE CLICKS.
        // This ensures desktop only uses CSS :hover.
        if (window.innerWidth > 600) return;

        // Mobile Logic:
        e.stopPropagation(); // Stop click from bubbling
        
        // Close other tooltips first
        tooltips.forEach(t => t.classList.remove('active'));

        // Toggle this one
        container.classList.toggle('active');
    });
});

// Close tooltips if tapping background (Mobile only)
document.addEventListener('click', () => {
    tooltips.forEach(t => t.classList.remove('active'));
});

// --- IMPORT / EXPORT LOGIC ---

function exportData() {
    const saved = localStorage.getItem('pogoSavedStrings');
    if (!saved || JSON.parse(saved).length === 0) {
        alert("No saved searches to export!");
        return;
    }

    // Create a Blob from the data
    const blob = new Blob([saved], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `pogo-search-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function triggerImport() {
    document.getElementById('import-file').click();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Basic Validation: Must be an array
            if (!Array.isArray(importedData)) {
                throw new Error("Invalid format");
            }

            // Merge logic: Ask user? Or just Append?
            // Let's Append safely (checking for duplicates)
            let currentData = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
            
            let addedCount = 0;
            importedData.forEach(newItem => {
                // Check if string already exists to avoid duplicates
                const exists = currentData.some(existing => existing.string === newItem.string);
                if (!exists && newItem.name && newItem.string) {
                    currentData.push(newItem);
                    addedCount++;
                }
            });

            // Save back
            localStorage.setItem('pogoSavedStrings', JSON.stringify(currentData));
            renderSavedStrings();
            
            alert(`Successfully imported ${addedCount} new searches!`);

        } catch (err) {
            alert("Error importing file: Invalid JSON format.");
            console.error(err);
        }
        
        // Reset input so you can import the same file again if needed
        input.value = '';
    };
    reader.readAsText(file);
}
