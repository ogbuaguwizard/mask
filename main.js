// main.js

document.addEventListener('DOMContentLoaded', initApp);

const DOMElements = {
    canvas: document.getElementById("canvas"),
    imgFile: document.getElementById("imgFile"),
    setCustomRes: document.getElementById("setCustomRes"),
    originalRes: document.getElementById("originalRes"),
    chooseBtn: document.getElementById("choose"),
    generateBtn: document.getElementById("gen"),
    setDialog: document.getElementById("setDialog"),
    imgProp: document.getElementById("imgProp"),
    conversionSettings: document.getElementById("conversionSettings"),
    resultsContainer: document.getElementById("resultsContainer"),
    resultsList: document.getElementById("resultsList"),
    dragArea: document.getElementById("drag-area"), // New
};

let files = [];
let imgs = [];
const context = DOMElements.canvas.getContext('2d');

/**
 * Utility function to show a Bootstrap Toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast (e.g., 'success', 'danger', 'info').
 */
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toastHTML = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    
    // Remove toast element after it's hidden to prevent DOM clutter
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/**
 * Clears previous image data and DOM elements.
 */
function resetState() {
    imgs.forEach(img => URL.revokeObjectURL(img.src));
    files = [];
    imgs = [];
    DOMElements.imgProp.innerHTML = "";
    DOMElements.setDialog.innerHTML = "";
    DOMElements.resultsList.innerHTML = "";
    DOMElements.conversionSettings.style.display = 'none';
    DOMElements.resultsContainer.style.display = 'none';
    DOMElements.generateBtn.disabled = true;
    DOMElements.originalRes.checked = true; // Default to original resolution
}

/**
 * Processes the list of file objects, regardless of source (input or drag/drop).
 * @param {FileList | Array<File>} fileList - The list of files to process.
 */
function processFiles(fileList) {
    resetState(); // Clear previous selection

    // Filter to ensure only images are processed
    files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) {
        showToast("No valid image file selected.", "warning");
        return;
    }

    DOMElements.conversionSettings.style.display = 'block';
    DOMElements.generateBtn.disabled = false;
    
    let imagesLoadedCount = 0;
    
    files.forEach((file, index) => {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        
        const img = new Image();
        img.onload = function() {
            imagesLoadedCount++;
            
            // Update Original Resolution Info
            DOMElements.imgProp.innerHTML += `
                <div class="d-inline-flex align-items-center me-3 mt-2">
                    <img src="${img.src}" alt="${fileName}" width="20" class="rounded-circle me-2 border border-secondary">
                    <span class="small text-muted font-monospace">${fileName}: ${img.naturalWidth}x${img.naturalHeight}</span>
                </div>
            `;
            
            // Add Custom Resolution Inputs
            const setDialogHTML = `
                <div class="d-flex align-items-center mb-2">
                    <img src="${img.src}" alt="${fileName}" width="20" class="rounded-circle me-2 border border-secondary">
                    <span class="text-white-50 small me-3 font-monospace">${fileName}</span>
                    <label class="small me-2">W:</label>
                    <input type="number" class="form-control form-control-sm setWidth me-3" data-index="${index}" value="32" style="width: 70px;">
                    <label class="small me-2">H:</label>
                    <input type="number" class="form-control form-control-sm setHeight" data-index="${index}" value="32" style="width: 70px;">
                    ${(index === 0 && files.length > 1) ? 
                        `<div class="form-check ms-3">
                            <input class="form-check-input" type="checkbox" id="setAll">
                            <label class="form-check-label small text-warning" for="setAll">Apply to All</label>
                        </div>` 
                        : ''}
                </div>
            `;
            DOMElements.setDialog.innerHTML += setDialogHTML;

            // Only after all images are loaded, show success toast
            if (imagesLoadedCount === files.length) {
                showToast(`${files.length} image(s) loaded successfully. Ready to generate.`, "success");
            }
        };

        img.onerror = () => showToast(`Error loading image: ${fileName}`, "danger");
        
        img.src = window.URL.createObjectURL(file);
        img.name = fileName; // Use the cleaned filename
        imgs.push(img);
    });
}

/**
 * Handles the file selection process from the input field.
 */
function handleFileSelect() {
    processFiles(DOMElements.imgFile.files);
}

/**
 * Handles click events for Choose Img and Generate.
 * @param {Event} e 
 */
function handleGlobalClick(e) {
    if (e.target === DOMElements.chooseBtn) {
        // Trigger the hidden file input
        DOMElements.imgFile.click(); 
    } else if (e.target === DOMElements.generateBtn) {
        generateMasks();
    }
}

/**
 * Toggles the visibility of the custom resolution dialog.
 */
function handleResolutionChange() {
    const isCustom = DOMElements.setCustomRes.checked;
    DOMElements.setDialog.style.display = isCustom ? 'block' : 'none';
    DOMElements.imgProp.style.display = isCustom ? 'none' : 'block';
    
    // Prevent selecting custom resolution if no files are loaded
    if (isCustom && files.length === 0) {
        DOMElements.setCustomRes.checked = false;
        DOMElements.originalRes.checked = true;
        DOMElements.setDialog.style.display = 'none';
        DOMElements.imgProp.style.display = 'block';
        showToast("Please select an image first to set custom resolution.", "warning");
    }
}

/**
 * Applies the first custom width/height to all inputs if 'Apply to All' is checked.
 */
function handleSetAll(e) {
    if (e.target.id === 'setAll') {
        const setWidths = Array.from(document.querySelectorAll('.setWidth'));
        const setHeights = Array.from(document.querySelectorAll('.setHeight'));
        const checked = e.target.checked;

        if (setWidths.length > 0 && setHeights.length > 0) {
            // The 'set all' checkbox is usually near the first set of inputs
            // Let's rely on the first input's value for the master setting
            const firstWidth = setWidths[0].value;
            const firstHeight = setHeights[0].value;

            setWidths.forEach((el, index) => {
                if (index > 0 || checked) { // Apply to all if checked, including the master itself
                    el.value = firstWidth;
                    el.disabled = checked;
                }
            });
            setHeights.forEach((el, index) => {
                 if (index > 0 || checked) {
                    el.value = firstHeight;
                    el.disabled = checked;
                }
            });
        }
    }
}

/**
 * Processes all loaded images to generate binary masks.
 */
function generateMasks() {
    if (files.length === 0) {
        showToast("No images selected.", "danger");
        return;
    }
    
    DOMElements.resultsList.innerHTML = ""; // Clear previous results
    DOMElements.resultsContainer.style.display = 'block';
    showToast(`Starting mask generation for ${files.length} image(s)...`, "info");

    imgs.forEach((img, index) => {
        let width, height;
        
        try {
            if (DOMElements.setCustomRes.checked) {
                // Get the specific width/height input elements using the data-index
                width = parseInt(document.querySelector(`.setWidth[data-index="${index}"]`).value);
                height = parseInt(document.querySelector(`.setHeight[data-index="${index}"]`).value);
                
                if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                    throw new Error("Invalid custom resolution.");
                }
            } else {
                width = img.naturalWidth;
                height = img.naturalHeight;
            }

            // Set canvas to the required size for the current image
            DOMElements.canvas.width = width;
            DOMElements.canvas.height = height;

            // Draw and get image data
            context.clearRect(0, 0, width, height);
            context.drawImage(img, 0, 0, width, height);
            const imageData = context.getImageData(0, 0, width, height);
            
            const mask = generateBinaryMask(imageData.data, width, height);
            
            // Display result and create download option
            displayResult(img.name, mask, width, height);

        } catch (error) {
            showToast(`Skipping ${img.name}: ${error.message || "An error occurred during processing."}`, "danger");
        }
    });

    showToast("Generation complete! Check the output data below.", "success");
}

/**
 * Generates the binary mask array from image data.
 * (Functionality remains the same, ensuring core logic is preserved)
 */
function generateBinaryMask(data, width, height) {
    const mask = [];
    for (let i = 0; i < height; i++) {
        mask[i] = [];
        for (let j = 0; j < width; j++) {
            // Alpha channel is at index ( (j + i * width) * 4 ) + 3
            const alphaIndex = (j + i * width) * 4 + 3;
            // The mask is 1 (visible/opaque) if alpha is not 0, and 0 (transparent) if alpha is 0.
            mask[i][j] = (data[alphaIndex] !== 0) ? 1 : 0;
        }
    }
    return mask;
}

/**
 * Creates the formatted text for the mask and sets up the download option.
 */
function displayResult(name, mask, width, height) {
    // Stringify and format the 2D array for readability in the text file
    let map = JSON.stringify(mask);
    // Add newlines after each inner array for better text file formatting
    map = map.replace(/\],/g, '],\n'); 
    map = map.replace(/\[\[/g, '[\n['); // Newline after the opening outer bracket

    // Create a Blob for the file
    const fileBlob = new Blob([map], {type: "text/plain"});
    const downloadURL = URL.createObjectURL(fileBlob);
    const fileSizeKB = (fileBlob.size / 1024).toFixed(2);

    const resultHTML = `
        <div class="col-md-6 col-lg-4">
            <div class="card result-card">
                <div class="card-body">
                    <h5 class="card-title text-info font-monospace">${name}.txt</h5>
                    <p class="card-text small text-muted">Resolution: ${width}x${height}</p>
                    <p class="card-text small text-muted">Data Size: ${fileSizeKB} KB</p>
                    <button class="btn btn-sm btn-outline-warning download-btn font-monospace" data-url="${downloadURL}" data-name="${name}.txt">
                        <i class="bi bi-download"></i> Download Map
                    </button>
                    <pre class="p-2 mt-3 rounded small overflow-auto" style="max-height: 120px;">${map.substring(0, 300)}...</pre>
                </div>
            </div>
        </div>
    `;
    DOMElements.resultsList.insertAdjacentHTML('beforeend', resultHTML);
    
    // Attach download event listener to the newly created button
    const lastResultCard = DOMElements.resultsList.lastElementChild;
    const downloadButton = lastResultCard.querySelector('.download-btn');
    downloadButton.addEventListener('click', (e) => {
        const btn = e.target.closest('.download-btn');
        const url = btn.getAttribute('data-url');
        const fileName = btn.getAttribute('data-name');
        
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the Blob URL immediately
        showToast(`'${fileName}' downloaded successfully!`, "success");
        // Remove the result card after download (optional, but good for cleanup)
        btn.closest('.col-md-6').remove();
    });
}

/**
 * Initializes Drag and Drop handlers.
 */
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        DOMElements.dragArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        DOMElements.dragArea.addEventListener(eventName, () => DOMElements.dragArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        DOMElements.dragArea.addEventListener(eventName, () => DOMElements.dragArea.classList.remove('drag-over'), false);
    });

    DOMElements.dragArea.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const droppedFiles = dt.files;
        processFiles(droppedFiles);
    }
}

/**
 * Initializes all event listeners.
 */
function initApp() {
    // Initial canvas setup
    DOMElements.canvas.width = 1;
    DOMElements.canvas.height = 1;

    // Event listeners
    DOMElements.imgFile.addEventListener('change', handleFileSelect);
    document.addEventListener("click", handleGlobalClick);
    document.getElementById("conversionSettings").addEventListener('change', handleResolutionChange);
    // Use event delegation for the 'setAll' checkbox since it's dynamically added
    DOMElements.setDialog.addEventListener('change', handleSetAll);

    // Setup drag and drop functionality
    setupDragAndDrop();

    // Initial check for resolution settings
    handleResolutionChange();
}
