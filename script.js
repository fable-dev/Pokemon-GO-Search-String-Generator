// Select DOM elements
const checkboxes = document.querySelectorAll('.filter');
const outputBox = document.getElementById('search-string');
const copyFeedback = document.getElementById('copy-feedback');

// Add event listeners to all checkboxes
checkboxes.forEach(box => {
    box.addEventListener('change', generateString);
});

// Function to generate the search string
function generateString() {
    // 1. Get all checked checkboxes
    const checkedBoxes = Array.from(checkboxes).filter(box => box.checked);
    
    // 2. Map them to their value (e.g., "shiny", "legendary")
    const values = checkedBoxes.map(box => box.value);
    
    // 3. Join them with '&' (The AND operator in PoGo)
    // Example: "shiny&legendary&!traded"
    const searchString = values.join('&');
    
    // 4. Update the textarea
    outputBox.value = searchString;
}

// Function to copy text to clipboard
function copyText() {
    if (!outputBox.value) return; // Don't copy empty text

    // Select the text field
    outputBox.select();
    outputBox.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text
    navigator.clipboard.writeText(outputBox.value).then(() => {
        // Show feedback message
        copyFeedback.style.opacity = '1';
        setTimeout(() => {
            copyFeedback.style.opacity = '0';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Function to clear all selections
function clearAll() {
    checkboxes.forEach(box => box.checked = false);
    outputBox.value = '';
}
