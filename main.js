// main.js - Fixed version

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
    dragArea: document.getElementById("drag-area"),
    resultsCount: document.getElementById("resultsCount"),
    resolutionGrid: document.querySelector('.resolution-grid')
};

let files = [];
let imgs = [];

// Fix for canvas performance warning
const context = DOMElements.canvas.getContext('2d', { willReadFrequently: true });

/**
 * Utility function to show a Bootstrap Toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast (e.g., 'success', 'danger', 'info').
 */
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toastHTML = `
        <div class="toast toast-modern align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'}-fill me-2"></i>
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
    imgs.forEach(img => {
        if (img.src && img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
        }
    });
    files = [];
    imgs = [];
    
    // Fix: Check if element exists before setting innerHTML
    if (DOMElements.imgProp) {
        DOMElements.imgProp.innerHTML = "";
    }
    
    // Fix: Use the resolutionGrid element instead of setDialog
    if (DOMElements.resolutionGrid) {
        DOMElements.resolutionGrid.innerHTML = "";
    }
    
    if (DOMElements.resultsList) {
        DOMElements.resultsList.innerHTML = "";
    }
    
    if (DOMElements.conversionSettings) {
        DOMElements.conversionSettings.style.display = 'none';
    }
    
    if (DOMElements.resultsContainer) {
        DOMElements.resultsContainer.style.display = 'none';
    }
    
    if (DOMElements.generateBtn) {
        DOMElements.generateBtn.disabled = true;
    }
    
    if (DOMElements.originalRes) {
        DOMElements.originalRes.checked = true;
    }
    
    if (DOMElements.resultsCount) {
        DOMElements.resultsCount.textContent = "0 Results";
    }
    
    // Clear selected images preview
    const selectedImagesInfo = document.getElementById('selectedImagesInfo');
    if (selectedImagesInfo) {
        selectedImagesInfo.innerHTML = '';
    }
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

    if (DOMElements.conversionSettings) {
        DOMElements.conversionSettings.style.display = 'block';
    }
    
    if (DOMElements.generateBtn) {
        DOMElements.generateBtn.disabled = false;
    }
    
    let imagesLoadedCount = 0;
    let imagesPreviewHTML = '<div class="selected-images-grid">';
    let customResolutionHTML = '';
    
    files.forEach((file, index) => {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        
        const img = new Image();
        img.onload = function() {
            imagesLoadedCount++;
            
            // Update Original Resolution Info - FIXED: Check if element exists
            if (DOMElements.imgProp) {
                DOMElements.imgProp.innerHTML += `
                    <div class="d-inline-flex align-items-center me-3 mt-2">
                        <img src="${img.src}" alt="${fileName}" width="20" class="rounded-circle me-2 border border-secondary">
                        <span class="small text-muted-modern font-mono">${fileName}: ${img.naturalWidth}x${img.naturalHeight}</span>
                    </div>
                `;
            }
            
            // Add Custom Resolution Inputs
            customResolutionHTML += `
                <div class="resolution-item">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${img.src}" alt="${fileName}" width="24" class="rounded-circle me-2 border border-secondary">
                        <span class="text-white-50 small font-mono">${fileName}</span>
                    </div>
                    <div class="row g-2">
                        <div class="col-6">
                            <label class="form-label small">Width</label>
                            <input type="number" class="form-control form-control-sm setWidth" data-index="${index}" value="32" min="1">
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Height</label>
                            <input type="number" class="form-control form-control-sm setHeight" data-index="${index}" value="32" min="1">
                        </div>
                    </div>
                    ${(index === 0 && files.length > 1) ? 
                        `<div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="setAll">
                            <label class="form-check-label small text-warning" for="setAll">Apply to All</label>
                        </div>` 
                        : ''}
                </div>
            `;

            // Add image preview
            imagesPreviewHTML += `
                <div class="image-preview">
                    <img src="${img.src}" alt="${fileName}">
                    <div class="image-name">${fileName}</div>
                </div>
            `;

            // Only after all images are loaded, show success toast
            if (imagesLoadedCount === files.length) {
                imagesPreviewHTML += '</div>';
                const selectedImagesInfo = document.getElementById('selectedImagesInfo');
                if (selectedImagesInfo) {
                    selectedImagesInfo.innerHTML = imagesPreviewHTML;
                }
                
                // FIXED: Use resolutionGrid element
                if (DOMElements.resolutionGrid) {
                    DOMElements.resolutionGrid.innerHTML = customResolutionHTML;
                    
                    // Add event listener for "Apply to All" checkbox
                    const setAllCheckbox = document.getElementById('setAll');
                    if (setAllCheckbox) {
                        setAllCheckbox.addEventListener('change', handleSetAll);
                    }
                }
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
    if (!DOMElements.setCustomRes || !DOMElements.setDialog || !DOMElements.imgProp) return;
    
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
            // Get values from first input set
            const firstWidth = setWidths[0].value;
            const firstHeight = setHeights[0].value;

            setWidths.forEach((el, index) => {
                if (checked) {
                    // Apply to all inputs
                    el.value = firstWidth;
                    if (index > 0) {
                        el.disabled = true;
                    }
                } else {
                    // Enable all inputs when unchecked
                    el.disabled = false;
                }
            });
            
            setHeights.forEach((el, index) => {
                if (checked) {
                    el.value = firstHeight;
                    if (index > 0) {
                        el.disabled = true;
                    }
                } else {
                    el.disabled = false;
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
    
    if (DOMElements.resultsList) {
        DOMElements.resultsList.innerHTML = ""; // Clear previous results
    }
    
    if (DOMElements.resultsContainer) {
        DOMElements.resultsContainer.style.display = 'block';
    }
    
    showToast(`Starting mask generation for ${files.length} image(s)...`, "info");

    let processedCount = 0;
    
    imgs.forEach((img, index) => {
        let width, height;
        
        try {
            if (DOMElements.setCustomRes && DOMElements.setCustomRes.checked) {
                // Get the specific width/height input elements using the data-index
                const widthInput = document.querySelector(`.setWidth[data-index="${index}"]`);
                const heightInput = document.querySelector(`.setHeight[data-index="${index}"]`);
                
                if (!widthInput || !heightInput) {
                    throw new Error("Custom resolution inputs not found.");
                }
                
                width = parseInt(widthInput.value);
                height = parseInt(heightInput.value);
                
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
            processedCount++;

        } catch (error) {
            showToast(`Skipping ${img.name}: ${error.message || "An error occurred during processing."}`, "danger");
        }
    });

    if (DOMElements.resultsCount) {
        DOMElements.resultsCount.textContent = `${processedCount} Result${processedCount !== 1 ? 's' : ''}`;
    }
    showToast("Generation complete! Check the output data below.", "success");
}

/**
 * Generates the binary mask array from image data.
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
            <div class="result-card">
                <div class="card-body">
                    <div class="result-header">
                        <h5 class="result-title">${name}.txt</h5>
                        <button class="btn btn-sm btn-outline-modern download-btn font-mono" data-url="${downloadURL}" data-name="${name}.txt">
                            <i class="bi bi-download me-1"></i>Download
                        </button>
                    </div>
                    <div class="result-meta">
                        <span><i class="bi bi-aspect-ratio me-1"></i>${width}x${height}</span>
                        <span><i class="bi bi-file-text me-1"></i>${fileSizeKB} KB</span>
                    </div>
                    <pre>${map.substring(0, 300)}...</pre>
                </div>
            </div>
        </div>
    `;
    
    if (DOMElements.resultsList) {
        DOMElements.resultsList.insertAdjacentHTML('beforeend', resultHTML);
    }
    
    // Attach download event listener to the newly created button
    const downloadButtons = document.querySelectorAll('.download-btn');
    const lastDownloadButton = downloadButtons[downloadButtons.length - 1];
    
    if (lastDownloadButton) {
        lastDownloadButton.addEventListener('click', (e) => {
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
        });
    }
}

/**
 * Initializes Drag and Drop handlers.
 */
function setupDragAndDrop() {
    if (!DOMElements.dragArea) return;
    
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
    if (DOMElements.imgFile) {
        DOMElements.imgFile.addEventListener('change', handleFileSelect);
    }
    
    document.addEventListener("click", handleGlobalClick);
    
    const conversionSettings = document.getElementById("conversionSettings");
    if (conversionSettings) {
        conversionSettings.addEventListener('change', handleResolutionChange);
    }
    
    // Use event delegation for the 'setAll' checkbox since it's dynamically added
    if (DOMElements.setDialog) {
        DOMElements.setDialog.addEventListener('change', handleSetAll);
    }

    // Setup drag and drop functionality
    setupDragAndDrop();

    // Initial check for resolution settings
    handleResolutionChange();

    // Update the current year in the footer
    document.querySelector('.current-year').textContent = `© ${new Date().getFullYear()} | MIT License`;
}
