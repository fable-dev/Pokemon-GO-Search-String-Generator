/* =========================================
   1. CONFIGURATION & SELECTORS
   ========================================= */
const CURRENT_VERSION = '1.1'; // Update this to force Modal on new features

// Output & Toggles
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');
const logicToggle = document.getElementById('logic-toggle');   // Checked = AND (&)
const appendToggle = document.getElementById('append-toggle'); // Checked = Append

// Inputs
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

// Grouping for iteration
const checkboxes = document.querySelectorAll('.filter');
const textInputs = [inputName, inputAge, inputYear, inputMove, cpMin, cpMax, distMin, distMax];

// Theme
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Modals & Saved Areas
const savedSection = document.getElementById('saved-section');
const savedList = document.getElementById('saved-list');
const updateModal = document.getElementById('update-modal');


/* =========================================
   2. INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderSavedStrings();
    checkVersion();
});


/* =========================================
   3. EVENT LISTENERS
   ========================================= */

// Theme Toggle
themeToggleBtn.addEventListener('click', toggleTheme);

// Checkboxes (Filter Toggles)
checkboxes.forEach(box => {
    box.addEventListener('change', () => {
        if (appendToggle.checked) {
            // Append Mode: Act like a button
            if (box.checked) {
                addTermToOutput(box.value);
                box.checked = false; 
            }
        } else {
            // Replace Mode: Live update (optional, usually safer to generate fresh)
            generateString();
        }
    });
});

// Text Inputs: Listen for 'Enter' key
textInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEnterKey(input);
        }
    });
});

// Mobile Tooltips (Tap Logic)
const tooltips = document.querySelectorAll('.tooltip-container');
tooltips.forEach(container => {
    const icon = container.querySelector('.info-icon');
    if (!icon) return;
    
    icon.addEventListener('click', (e) => {
        if (window.innerWidth > 600) return; // Desktop uses CSS hover
        e.stopPropagation(); 
        
        // Close others
        tooltips.forEach(t => t.classList.remove('active'));
        // Toggle current
        container.classList.toggle('active');
    });
});

// Close tooltips when clicking background
document.addEventListener('click', () => {
    tooltips.forEach(t => t.classList.remove('active'));
});

// Close Modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === updateModal) closeModal();
});


/* =========================================
   4. CORE GENERATOR LOGIC
   ========================================= */

// Routing function for 'Enter' key on inputs
function handleEnterKey(input) {
    if (input === inputName) triggerAdd('name');
    else if (input === inputAge) triggerAdd('age');
    else if (input === inputYear) triggerAdd('year');
    else if (input === inputMove) triggerAdd('move');
    else if (input === cpMin || input === cpMax) triggerAdd('cp');
    else if (input === distMin || input === distMax) triggerAdd('distance');
}

// Main Logic to Process Input -> String
function triggerAdd(type) {
    let term = "";

    // 1. Determine term based on input type
    if (type === 'name') {
        const val = inputName.value.trim();
        if (val) term = checkFamily.checked ? '+' + val : val;
        inputName.value = "";
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

    if (!term) return; // Exit if empty

    // 2. Output based on Toggle
    if (appendToggle.checked) {
        addTermToOutput(term);
    } else {
        // Replace Mode: Clear and set
        clearAll(false);
        outputBox.value = term;
    }
}

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

// For Replace Mode Checkboxes
function generateString() {
    let terms = [];

    // Note: In Replace Mode, we usually want manual inputs to be distinct actions.
    // But if you want checkboxes to build a string mixed with current text inputs:
    
    // Process Checkboxes
    Array.from(checkboxes).filter(box => box.checked).forEach(box => terms.push(box.value));

    // Join
    const separator = logicToggle.checked ? '&' : ',';
    outputBox.value = terms.join(separator);
}

function applyPreset(presetString) {
    if (appendToggle.checked) {
        addTermToOutput(presetString);
    } else {
        clearAll(false);
        outputBox.value = presetString;
    }
}


/* =========================================
   5. UI UTILITIES
   ========================================= */

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

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.textContent = '☀️';
    }
}

// Modal Handling
function checkVersion() {
    const savedVersion = localStorage.getItem('pogoVersion');
    if (savedVersion !== CURRENT_VERSION) {
        updateModal.style.display = 'flex';
    }
}

function closeModal() {
    updateModal.style.display = 'none';
    localStorage.setItem('pogoVersion', CURRENT_VERSION);
}


/* =========================================
   6. SAVED SEARCHES & IMPORT/EXPORT
   ========================================= */

function renderSavedStrings() {
    const saved = JSON.parse(localStorage.getItem('pogoSavedStrings')) || [];
    
    // Always show section (for Import/Export access)
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
        } catch (err) { 
            alert("Error importing file: Invalid JSON."); 
            console.error(err);
        }
        input.value = ''; // Reset input
    };
    reader.readAsText(file);
}
