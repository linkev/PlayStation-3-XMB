class GradientExtractor {
    constructor() {
        this.months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        
        this.themes = ['rgb', 'night'];
        this.uploadedFiles = new Map();
        this.extractedGradients = new Map();
        this.analysisMode = 'basic'; // 'basic' or 'advanced'
        
        this.initializeUI();
        this.setupEventListeners();
        
        // Test advanced extractor availability
        this.testAdvancedExtractor();
    }

    initializeUI() {
        const uploadGrid = document.getElementById('uploadGrid');
        
        // Create upload slots for each month/theme combination
        this.months.forEach((month, monthIndex) => {
            this.themes.forEach(theme => {
                const uploadItem = this.createUploadItem(month, theme, monthIndex + 1);
                uploadGrid.appendChild(uploadItem);
            });
        });
    }

    createUploadItem(month, theme, monthNumber) {
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.dataset.month = month;
        item.dataset.theme = theme;
        item.dataset.monthNumber = monthNumber;
        
        const monthStr = monthNumber.toString().padStart(2, '0');
        const expectedFilename = `Textures_month_bg_${theme}_${monthStr}.jpg`;
        
        item.innerHTML = `
            <h3>${month.charAt(0).toUpperCase() + month.slice(1)} - ${theme === 'rgb' ? 'Day' : 'Night'}</h3>
            <div class="file-input-wrapper">
                <input type="file" class="file-input" accept=".jpg,.jpeg,.png" 
                       data-expected="${expectedFilename}">
            </div>
            <small>Expected: ${expectedFilename}</small>
        `;

        const fileInput = item.querySelector('.file-input');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e, month, theme));

        return item;
    }

    setupEventListeners() {
        // Bulk upload
        document.getElementById('bulkUpload').addEventListener('change', (e) => {
            this.handleBulkUpload(e.target.files);
        });

        // Analysis buttons
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analysisMode = 'basic';
            this.analyzeAllGradients();
        });

        document.getElementById('advancedAnalyzeBtn').addEventListener('click', () => {
            this.analysisMode = 'advanced';
            this.analyzeAllGradients();
        });

        // Export buttons
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportAsJSON();
        });
        
        document.getElementById('exportJsBtn').addEventListener('click', () => {
            this.exportAsJavaScript();
        });
        
        document.getElementById('exportGlslBtn').addEventListener('click', () => {
            this.exportAsGLSL();
        });
    }

    handleFileUpload(event, month, theme) {
        const file = event.target.files[0];
        if (!file) return;

        const key = `${month}_${theme}`;
        this.uploadedFiles.set(key, file);
        
        // Update UI
        const uploadItem = event.target.closest('.upload-item');
        uploadItem.classList.add('has-file');
        
        // Add file indicator if it doesn't exist
        const existingIndicator = uploadItem.querySelector('.file-uploaded');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'file-uploaded';
        indicator.innerHTML = `✓ ${file.name}`;
        indicator.style.cssText = `
            color: #4CAF50;
            font-size: 0.8rem;
            margin-top: 5px;
            padding: 3px 6px;
            background: rgba(76,175,80,0.1);
            border-radius: 3px;
            border: 1px solid rgba(76,175,80,0.3);
        `;
        uploadItem.appendChild(indicator);
        
        this.updateAnalyzeButton();
    }

    handleBulkUpload(files) {
        let processedCount = 0;
        
        Array.from(files).forEach(file => {
            console.log(`Processing file: ${file.name}`);
            
            // Match the actual filename pattern: Textures_month_bg_(rgb|night)_(\d+).jpg
            const match = file.name.match(/Textures_month_bg_(rgb|night)_(\d+)\.(jpg|jpeg|png)/i);
            
            if (match) {
                const [, theme, monthNum] = match;
                const themeLower = theme.toLowerCase();
                const monthNumber = parseInt(monthNum, 10);
                
                // Convert month number to month name
                if (monthNumber >= 1 && monthNumber <= 12) {
                    const monthName = this.months[monthNumber - 1]; // months array is 0-indexed
                    console.log(`Matched: ${monthName} ${themeLower} (file: ${monthNum})`);
                    
                    const key = `${monthName}_${themeLower}`;
                    this.uploadedFiles.set(key, file);
                    
                    // Update corresponding upload item
                    const uploadItem = document.querySelector(`[data-month="${monthName}"][data-theme="${themeLower}"]`);
                    if (uploadItem) {
                        uploadItem.classList.add('has-file');
                        const fileInput = uploadItem.querySelector('.file-input');
                        
                        // Create a more visible indicator that file was uploaded
                        const existingIndicator = uploadItem.querySelector('.file-uploaded');
                        if (!existingIndicator) {
                            const indicator = document.createElement('div');
                            indicator.className = 'file-uploaded';
                            indicator.innerHTML = `✓ ${file.name}`;
                            indicator.style.cssText = `
                                color: #4CAF50;
                                font-size: 0.8rem;
                                margin-top: 5px;
                                padding: 3px 6px;
                                background: rgba(76,175,80,0.1);
                                border-radius: 3px;
                                border: 1px solid rgba(76,175,80,0.3);
                            `;
                            uploadItem.appendChild(indicator);
                        }
                        
                        // Try to set the file on the input (may not work in all browsers, but we'll track it separately)
                        try {
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            fileInput.files = dt.files;
                                                                          } catch (e) {
                             // Fallback: just update our internal tracking
                             console.log(`File set for ${monthName} ${themeLower}: ${file.name}`);
                         }
                     }
                     processedCount++;
                 }
             } else {
                 console.log(`No match for file: ${file.name}`);
             }
        });
        
        // Show feedback message
        this.showBulkUploadFeedback(processedCount, files.length);
        this.updateAnalyzeButton();
    }

    updateAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const advancedAnalyzeBtn = document.getElementById('advancedAnalyzeBtn');
        const uploadedCount = this.uploadedFiles.size;
        
        const isDisabled = uploadedCount === 0;
        analyzeBtn.disabled = isDisabled;
        advancedAnalyzeBtn.disabled = isDisabled;
        
        analyzeBtn.textContent = `Basic Analysis (${uploadedCount}/24)`;
        advancedAnalyzeBtn.textContent = `Advanced Analysis (${uploadedCount}/24)`;
    }

    showBulkUploadFeedback(processedCount, totalCount) {
        // Remove any existing feedback
        const existingFeedback = document.querySelector('.bulk-upload-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Create feedback message
        const feedback = document.createElement('div');
        feedback.className = 'bulk-upload-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(76,175,80,0.9);
            color: white;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        const skippedCount = totalCount - processedCount;
        let message = `✓ Successfully processed ${processedCount} files`;
        if (skippedCount > 0) {
            message += `\n⚠ ${skippedCount} files skipped (incorrect naming or format)`;
            feedback.style.background = 'rgba(255,152,0,0.9)';
        }
        
        feedback.textContent = message;
        feedback.style.whiteSpace = 'pre-line';
        document.body.appendChild(feedback);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.opacity = '0';
                feedback.style.transform = 'translateX(100%)';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 4000);
    }

    async analyzeAllGradients() {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultsContainer = document.getElementById('results');
        
        progressSection.style.display = 'block';
        resultsContainer.innerHTML = '';
        
        const totalFiles = this.uploadedFiles.size;
        let processedFiles = 0;
        
        for (const [key, file] of this.uploadedFiles) {
            const [month, theme] = key.split('_');
            
            const modeText = this.analysisMode === 'advanced' ? 'Advanced analyzing' : 'Analyzing';
            progressText.textContent = `${modeText} ${month} ${theme}...`;
            progressFill.style.width = `${(processedFiles / totalFiles) * 100}%`;
            
            try {
                const gradientData = await this.analyzeGradient(file, month, theme);
                this.extractedGradients.set(key, gradientData);
                
                // Create result display
                this.createResultDisplay(month, theme, gradientData);
            } catch (error) {
                console.error(`Error analyzing ${key}:`, error);
                // Create error display
                this.createErrorDisplay(month, theme, error);
            }
            
            processedFiles++;
            
            // Small delay to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = `${this.analysisMode === 'advanced' ? 'Advanced analysis' : 'Analysis'} complete!`;
        
        // Enable export buttons
        document.getElementById('exportJsonBtn').disabled = false;
        document.getElementById('exportJsBtn').disabled = false;
        document.getElementById('exportGlslBtn').disabled = false;
        
        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 2000);
    }

    async analyzeGradient(file, month, theme) {
        return new Promise(async (resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = async () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                let gradientData;
                
                if (this.analysisMode === 'advanced' && typeof AdvancedGradientExtractor !== 'undefined') {
                    // Use advanced extraction
                    const advancedExtractor = new AdvancedGradientExtractor();
                    gradientData = await advancedExtractor.extractAccurateGradient(file, month, theme);
                } else {
                    // Use basic extraction
                    gradientData = this.extractGradientFromCanvas(canvas, month, theme);
                }
                
                // Ensure consistent data structure
                gradientData = this.normalizeGradientData(gradientData, month, theme);
                resolve(gradientData);
            };
            
            img.onerror = () => {
                resolve(this.createFallbackGradientData(month, theme));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    normalizeGradientData(gradientData, month, theme) {
        // Handle advanced extractor output
        if (gradientData.shaderData) {
            return {
                month: gradientData.month || month,
                theme: gradientData.theme || theme,
                type: gradientData.shaderData.type || 'linear',
                direction: gradientData.dominantDirection || gradientData.shaderData.direction || [1, 0],
                colors: gradientData.shaderData.colorStops || [
                    { position: 0, color: [0.2, 0.2, 0.3] },
                    { position: 1, color: [0.1, 0.1, 0.2] }
                ],
                mathRepresentation: {
                    type: gradientData.shaderData.type || 'linear',
                    direction: gradientData.dominantDirection || gradientData.shaderData.direction || [1, 0],
                    colorStops: gradientData.shaderData.colorStops || [],
                    glslFunction: gradientData.shaderData.glslFunction || this.generateFallbackMathRepresentation().glslFunction
                },
                previewGradient: this.generatePreviewFromAdvanced(gradientData.shaderData),
                originalDimensions: { width: 512, height: 512 },
                quality: gradientData.quality || 0.85,
                analysisMode: this.analysisMode,
                complexity: gradientData.complexity,
                textureData: gradientData.textureData
            };
        }
        
        // Handle basic extractor output (existing code)
        return {
            month: gradientData.month || month,
            theme: gradientData.theme || theme,
            type: gradientData.type || 'linear',
            direction: gradientData.direction || [1, 0],
            colors: gradientData.colors || gradientData.colorStops || [
                { position: 0, color: [0.2, 0.2, 0.3] },
                { position: 1, color: [0.1, 0.1, 0.2] }
            ],
            mathRepresentation: gradientData.mathRepresentation || this.generateFallbackMathRepresentation(),
            previewGradient: gradientData.previewGradient || 'linear-gradient(90deg, #333 0%, #222 100%)',
            originalDimensions: gradientData.originalDimensions || { width: 512, height: 512 },
            quality: gradientData.quality || 0.5,
            analysisMode: this.analysisMode
        };
    }

    generatePreviewFromAdvanced(shaderData) {
        if (!shaderData || !shaderData.colorStops) {
            return 'linear-gradient(90deg, #333 0%, #222 100%)';
        }

        const colorStops = shaderData.colorStops;
        const stops = colorStops.map(stop => {
            const color = `rgb(${Math.round(stop.color[0] * 255)}, ${Math.round(stop.color[1] * 255)}, ${Math.round(stop.color[2] * 255)})`;
            return `${color} ${Math.round(stop.position * 100)}%`;
        }).join(', ');

        if (shaderData.type === 'radial') {
            return `radial-gradient(circle at center, ${stops})`;
        } else if (shaderData.type === 'complex') {
            // For complex gradients, create a simplified linear preview
            return `linear-gradient(45deg, ${stops})`;
        } else {
            // Linear gradient
            const direction = shaderData.direction || [1, 0];
            const angle = Math.atan2(direction[1], direction[0]) * 180 / Math.PI;
            return `linear-gradient(${angle}deg, ${stops})`;
        }
    }

    createFallbackGradientData(month, theme) {
        return {
            month,
            theme,
            type: 'linear',
            direction: [1, 0],
            colors: [
                { position: 0, color: [0.2, 0.2, 0.3] },
                { position: 1, color: [0.1, 0.1, 0.2] }
            ],
            mathRepresentation: this.generateFallbackMathRepresentation(),
            previewGradient: 'linear-gradient(90deg, #333 0%, #222 100%)',
            originalDimensions: { width: 512, height: 512 },
            quality: 0.3,
            analysisMode: this.analysisMode,
            error: 'Failed to load image'
        };
    }

    generateFallbackMathRepresentation() {
        return {
            type: 'linear',
            angle: 90,
            direction: [1, 0],
            colorStops: [
                { position: 0, color: [0.2, 0.2, 0.3] },
                { position: 1, color: [0.1, 0.1, 0.2] }
            ],
            glslFunction: `vec3 getGradientColor(vec2 uv) {
    float t = dot(uv, vec2(1.0, 0.0));
    t = clamp(t, 0.0, 1.0);
    return mix(vec3(0.2, 0.2, 0.3), vec3(0.1, 0.1, 0.2), t);
}`
        };
    }

    createErrorDisplay(month, theme, error) {
        const resultsContainer = document.getElementById('results');
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item error-result';
        
        const displayName = `${month.charAt(0).toUpperCase() + month.slice(1)} - ${theme === 'rgb' ? 'Day' : 'Night'}`;
        
        resultItem.innerHTML = `
            <div class="result-header">
                <div class="result-title">${displayName}</div>
                <div class="quality-indicator error">Error</div>
            </div>
            
            <div class="gradient-info">
                <h4 style="color: #f44336;">Analysis Failed</h4>
                <div><strong>Error:</strong> ${error.message}</div>
                <div><strong>Mode:</strong> ${this.analysisMode}</div>
                <p style="color: #ff9800; margin-top: 10px;">
                    Try using a different image format or check the file integrity.
                </p>
            </div>
        `;
        
        resultItem.style.border = '2px solid #f44336';
        resultsContainer.appendChild(resultItem);
    }

    extractGradientFromCanvas(canvas, month, theme) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Sample points for gradient analysis
        const samplePoints = this.generateSamplePoints(width, height);
        const colors = [];
        
        // Extract colors from sample points
        samplePoints.forEach(point => {
            const index = (point.y * width + point.x) * 4;
            const r = data[index] / 255;
            const g = data[index + 1] / 255;
            const b = data[index + 2] / 255;
            
            colors.push({
                position: point,
                color: [r, g, b],
                normalizedX: point.x / width,
                normalizedY: point.y / height
            });
        });
        
        // Detect gradient type and direction
        const gradientAnalysis = this.analyzeGradientPattern(colors, width, height);
        
        // Generate mathematical representation
        const mathRepresentation = this.generateMathRepresentation(gradientAnalysis);
        
        // Create preview gradient
        const previewGradient = this.generatePreviewGradient(gradientAnalysis);
        
        return {
            month,
            theme,
            type: gradientAnalysis.type,
            direction: gradientAnalysis.direction,
            colors: gradientAnalysis.colorStops,
            mathRepresentation,
            previewGradient,
            originalDimensions: { width, height },
            quality: gradientAnalysis.quality
        };
    }

    generateSamplePoints(width, height) {
        const points = [];
        const sampleSize = 50; // Adjust for quality vs performance
        
        // Grid sampling for comprehensive coverage
        for (let i = 0; i < sampleSize; i++) {
            for (let j = 0; j < sampleSize; j++) {
                points.push({
                    x: Math.floor((i / (sampleSize - 1)) * (width - 1)),
                    y: Math.floor((j / (sampleSize - 1)) * (height - 1))
                });
            }
        }
        
        // Add edge and corner samples for better gradient detection
        const edgePoints = [
            { x: 0, y: 0 }, { x: width - 1, y: 0 },
            { x: 0, y: height - 1 }, { x: width - 1, y: height - 1 },
            { x: Math.floor(width / 2), y: 0 }, { x: Math.floor(width / 2), y: height - 1 },
            { x: 0, y: Math.floor(height / 2) }, { x: width - 1, y: Math.floor(height / 2) }
        ];
        
        return [...points, ...edgePoints];
    }

    analyzeGradientPattern(colors, width, height) {
        // Calculate color variations along different axes
        const horizontalVariation = this.calculateAxisVariation(colors, 'x');
        const verticalVariation = this.calculateAxisVariation(colors, 'y');
        const diagonalVariation = this.calculateDiagonalVariation(colors);
        const radialVariation = this.calculateRadialVariation(colors, width, height);
        
        // Determine gradient type
        let type = 'linear';
        let direction = [1, 0]; // Default horizontal
        let quality = 0;
        
        const variations = {
            horizontal: horizontalVariation,
            vertical: verticalVariation,
            diagonal: diagonalVariation,
            radial: radialVariation
        };
        
        // Find dominant variation pattern
        const maxVariation = Math.max(...Object.values(variations));
        
        if (variations.radial === maxVariation && variations.radial > 0.3) {
            type = 'radial';
            direction = [0.5, 0.5]; // Center point
            quality = variations.radial;
        } else if (variations.diagonal === maxVariation && variations.diagonal > 0.2) {
            type = 'linear';
            direction = this.calculateDiagonalDirection(colors);
            quality = variations.diagonal;
        } else if (variations.vertical > variations.horizontal) {
            type = 'linear';
            direction = [0, 1]; // Vertical
            quality = variations.vertical;
        } else {
            type = 'linear';
            direction = [1, 0]; // Horizontal
            quality = variations.horizontal;
        }
        
        // Extract color stops based on gradient type
        const colorStops = this.extractColorStops(colors, type, direction);
        
        return {
            type,
            direction,
            colorStops,
            quality,
            variations
        };
    }

    calculateAxisVariation(colors, axis) {
        const sorted = colors.slice().sort((a, b) => 
            axis === 'x' ? a.normalizedX - b.normalizedX : a.normalizedY - b.normalizedY
        );
        
        let totalVariation = 0;
        for (let i = 1; i < sorted.length; i++) {
            const colorDiff = this.calculateColorDistance(sorted[i].color, sorted[i-1].color);
            totalVariation += colorDiff;
        }
        
        return totalVariation / sorted.length;
    }

    calculateDiagonalVariation(colors) {
        const sorted = colors.slice().sort((a, b) => 
            (a.normalizedX + a.normalizedY) - (b.normalizedX + b.normalizedY)
        );
        
        let totalVariation = 0;
        for (let i = 1; i < sorted.length; i++) {
            const colorDiff = this.calculateColorDistance(sorted[i].color, sorted[i-1].color);
            totalVariation += colorDiff;
        }
        
        return totalVariation / sorted.length;
    }

    calculateRadialVariation(colors, width, height) {
        const centerX = 0.5;
        const centerY = 0.5;
        
        const sorted = colors.slice().sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.normalizedX - centerX, 2) + Math.pow(a.normalizedY - centerY, 2));
            const distB = Math.sqrt(Math.pow(b.normalizedX - centerX, 2) + Math.pow(b.normalizedY - centerY, 2));
            return distA - distB;
        });
        
        let totalVariation = 0;
        for (let i = 1; i < sorted.length; i++) {
            const colorDiff = this.calculateColorDistance(sorted[i].color, sorted[i-1].color);
            totalVariation += colorDiff;
        }
        
        return totalVariation / sorted.length;
    }

    calculateColorDistance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    calculateDiagonalDirection(colors) {
        // Analyze the primary diagonal direction
        const topLeft = colors.find(c => c.normalizedX < 0.1 && c.normalizedY < 0.1);
        const bottomRight = colors.find(c => c.normalizedX > 0.9 && c.normalizedY > 0.9);
        const topRight = colors.find(c => c.normalizedX > 0.9 && c.normalizedY < 0.1);
        const bottomLeft = colors.find(c => c.normalizedX < 0.1 && c.normalizedY > 0.9);
        
        if (topLeft && bottomRight) {
            const diff1 = this.calculateColorDistance(topLeft.color, bottomRight.color);
            if (topRight && bottomLeft) {
                const diff2 = this.calculateColorDistance(topRight.color, bottomLeft.color);
                if (diff1 > diff2) {
                    return [1, 1]; // Top-left to bottom-right
                } else {
                    return [1, -1]; // Top-right to bottom-left
                }
            }
            return [1, 1];
        }
        
        return [1, 1]; // Default diagonal
    }

    extractColorStops(colors, type, direction) {
        const stops = [];
        
        if (type === 'radial') {
            // Sort by distance from center
            const centerX = 0.5;
            const centerY = 0.5;
            
            const sorted = colors.slice().sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a.normalizedX - centerX, 2) + Math.pow(a.normalizedY - centerY, 2));
                const distB = Math.sqrt(Math.pow(b.normalizedX - centerX, 2) + Math.pow(b.normalizedY - centerY, 2));
                return distA - distB;
            });
            
            // Sample key points
            const sampleIndices = [0, Math.floor(sorted.length * 0.25), Math.floor(sorted.length * 0.5), 
                                   Math.floor(sorted.length * 0.75), sorted.length - 1];
            
            sampleIndices.forEach((index, i) => {
                if (index < sorted.length) {
                    const point = sorted[index];
                    const distance = Math.sqrt(Math.pow(point.normalizedX - centerX, 2) + Math.pow(point.normalizedY - centerY, 2));
                    stops.push({
                        position: distance,
                        color: point.color
                    });
                }
            });
        } else {
            // Linear gradient
            let sorted;
            if (direction[0] === 1 && direction[1] === 0) {
                // Horizontal
                sorted = colors.slice().sort((a, b) => a.normalizedX - b.normalizedX);
            } else if (direction[0] === 0 && direction[1] === 1) {
                // Vertical
                sorted = colors.slice().sort((a, b) => a.normalizedY - b.normalizedY);
            } else {
                // Diagonal
                sorted = colors.slice().sort((a, b) => {
                    const projA = a.normalizedX * direction[0] + a.normalizedY * direction[1];
                    const projB = b.normalizedX * direction[0] + b.normalizedY * direction[1];
                    return projA - projB;
                });
            }
            
            // Sample key points along the gradient
            const sampleIndices = [0, Math.floor(sorted.length * 0.25), Math.floor(sorted.length * 0.5), 
                                   Math.floor(sorted.length * 0.75), sorted.length - 1];
            
            sampleIndices.forEach((index, i) => {
                if (index < sorted.length) {
                    stops.push({
                        position: i / (sampleIndices.length - 1),
                        color: sorted[index].color
                    });
                }
            });
        }
        
        return stops;
    }

    generateMathRepresentation(gradientAnalysis) {
        const { type, direction, colorStops } = gradientAnalysis;
        
        if (type === 'radial') {
            return {
                type: 'radial',
                center: [0.5, 0.5],
                radius: 0.7,
                colorStops: colorStops.map(stop => ({
                    position: stop.position,
                    color: stop.color
                })),
                glslFunction: this.generateRadialGLSL(colorStops)
            };
        } else {
            const angle = Math.atan2(direction[1], direction[0]) * 180 / Math.PI;
            return {
                type: 'linear',
                angle: angle,
                direction: direction,
                colorStops: colorStops.map(stop => ({
                    position: stop.position,
                    color: stop.color
                })),
                glslFunction: this.generateLinearGLSL(direction, colorStops)
            };
        }
    }

    generateLinearGLSL(direction, colorStops) {
        let glsl = `vec3 getGradientColor(vec2 uv) {\n`;
        glsl += `    float t = dot(uv, vec2(${direction[0].toFixed(4)}, ${direction[1].toFixed(4)}));\n`;
        glsl += `    t = clamp(t, 0.0, 1.0);\n\n`;
        
        if (colorStops.length === 2) {
            const start = colorStops[0].color;
            const end = colorStops[1].color;
            glsl += `    return mix(vec3(${start[0].toFixed(4)}, ${start[1].toFixed(4)}, ${start[2].toFixed(4)}), `;
            glsl += `vec3(${end[0].toFixed(4)}, ${end[1].toFixed(4)}, ${end[2].toFixed(4)}), t);\n`;
        } else {
            glsl += `    vec3 color;\n`;
            for (let i = 0; i < colorStops.length - 1; i++) {
                const current = colorStops[i];
                const next = colorStops[i + 1];
                const condition = i === 0 ? `if (t <= ${next.position.toFixed(4)})` : 
                                 i === colorStops.length - 2 ? `else` : 
                                 `else if (t <= ${next.position.toFixed(4)})`;
                
                glsl += `    ${condition} {\n`;
                glsl += `        float localT = (t - ${current.position.toFixed(4)}) / ${(next.position - current.position).toFixed(4)};\n`;
                glsl += `        color = mix(vec3(${current.color[0].toFixed(4)}, ${current.color[1].toFixed(4)}, ${current.color[2].toFixed(4)}), `;
                glsl += `vec3(${next.color[0].toFixed(4)}, ${next.color[1].toFixed(4)}, ${next.color[2].toFixed(4)}), localT);\n`;
                glsl += `    }\n`;
            }
            glsl += `    return color;\n`;
        }
        
        glsl += `}`;
        return glsl;
    }

    generateRadialGLSL(colorStops) {
        let glsl = `vec3 getGradientColor(vec2 uv) {\n`;
        glsl += `    float dist = distance(uv, vec2(0.5, 0.5));\n`;
        glsl += `    dist = clamp(dist / 0.7, 0.0, 1.0);\n\n`;
        
        if (colorStops.length === 2) {
            const inner = colorStops[0].color;
            const outer = colorStops[1].color;
            glsl += `    return mix(vec3(${inner[0].toFixed(4)}, ${inner[1].toFixed(4)}, ${inner[2].toFixed(4)}), `;
            glsl += `vec3(${outer[0].toFixed(4)}, ${outer[1].toFixed(4)}, ${outer[2].toFixed(4)}), dist);\n`;
        } else {
            glsl += `    vec3 color;\n`;
            for (let i = 0; i < colorStops.length - 1; i++) {
                const current = colorStops[i];
                const next = colorStops[i + 1];
                const condition = i === 0 ? `if (dist <= ${next.position.toFixed(4)})` : 
                                 i === colorStops.length - 2 ? `else` : 
                                 `else if (dist <= ${next.position.toFixed(4)})`;
                
                glsl += `    ${condition} {\n`;
                glsl += `        float localT = (dist - ${current.position.toFixed(4)}) / ${(next.position - current.position).toFixed(4)};\n`;
                glsl += `        color = mix(vec3(${current.color[0].toFixed(4)}, ${current.color[1].toFixed(4)}, ${current.color[2].toFixed(4)}), `;
                glsl += `vec3(${next.color[0].toFixed(4)}, ${next.color[1].toFixed(4)}, ${next.color[2].toFixed(4)}), localT);\n`;
                glsl += `    }\n`;
            }
            glsl += `    return color;\n`;
        }
        
        glsl += `}`;
        return glsl;
    }

    generatePreviewGradient(gradientAnalysis) {
        const { type, direction, colorStops } = gradientAnalysis;
        
        if (type === 'radial') {
            const stops = colorStops.map(stop => {
                const color = `rgb(${Math.round(stop.color[0] * 255)}, ${Math.round(stop.color[1] * 255)}, ${Math.round(stop.color[2] * 255)})`;
                return `${color} ${Math.round(stop.position * 100)}%`;
            }).join(', ');
            
            return `radial-gradient(circle at center, ${stops})`;
        } else {
            const angle = Math.atan2(direction[1], direction[0]) * 180 / Math.PI;
            const stops = colorStops.map(stop => {
                const color = `rgb(${Math.round(stop.color[0] * 255)}, ${Math.round(stop.color[1] * 255)}, ${Math.round(stop.color[2] * 255)})`;
                return `${color} ${Math.round(stop.position * 100)}%`;
            }).join(', ');
            
            return `linear-gradient(${angle}deg, ${stops})`;
        }
    }

    createResultDisplay(month, theme, gradientData) {
        const resultsContainer = document.getElementById('results');
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const displayName = `${month.charAt(0).toUpperCase() + month.slice(1)} - ${theme === 'rgb' ? 'Day' : 'Night'}`;
        
        // Ensure direction is always an array
        const direction = Array.isArray(gradientData.direction) ? gradientData.direction : [1, 0];
        const colors = Array.isArray(gradientData.colors) ? gradientData.colors : [];
        
        // Advanced analysis specific displays
        const isAdvanced = gradientData.analysisMode === 'advanced';
        const complexityInfo = isAdvanced && gradientData.complexity !== undefined ? 
            `<div><strong>Complexity:</strong> ${(gradientData.complexity * 100).toFixed(1)}%</div>` : '';
        const textureInfo = isAdvanced && gradientData.textureData ? 
            `<div><strong>Texture Generated:</strong> ${gradientData.textureData.width}x${gradientData.textureData.height}</div>` : '';
        
        resultItem.innerHTML = `
            <div class="result-header">
                <div class="result-title">${displayName}</div>
                <div class="quality-indicator">Quality: ${Math.round((gradientData.quality || 0) * 100)}%</div>
                <div class="analysis-mode">${gradientData.analysisMode || 'basic'}</div>
            </div>
            
            <div class="comparison">
                <div class="comparison-item">
                    <h4>Original Image</h4>
                    <canvas class="gradient-preview original-preview" 
                            data-month="${month}" data-theme="${theme}"></canvas>
                </div>
                <div class="comparison-item">
                    <h4>Reconstructed Gradient</h4>
                    <div class="gradient-preview" 
                         style="background: ${gradientData.previewGradient || 'linear-gradient(90deg, #333, #222)'}"></div>
                </div>
            </div>
            
            <div class="gradient-info">
                <h4>Gradient Properties</h4>
                <div><strong>Type:</strong> ${gradientData.type || 'linear'}</div>
                <div><strong>Direction:</strong> [${direction.map(d => (d || 0).toFixed(3)).join(', ')}]</div>
                <div><strong>Color Stops:</strong> ${colors.length}</div>
                <div><strong>Analysis Mode:</strong> ${gradientData.analysisMode || 'basic'}</div>
                ${complexityInfo}
                ${textureInfo}
                ${gradientData.error ? `<div style="color: #ff9800;"><strong>Warning:</strong> ${gradientData.error}</div>` : ''}
                
                <div class="code-block">${JSON.stringify(gradientData.mathRepresentation || {}, null, 2)}</div>
            </div>
        `;
        
        resultsContainer.appendChild(resultItem);
        
        // Draw original image preview
        this.drawOriginalPreview(month, theme, resultItem.querySelector('.original-preview'));
        
        // If texture data exists, add texture preview
        if (isAdvanced && gradientData.textureData && gradientData.textureData.dataURL) {
            this.addTexturePreview(resultItem, gradientData.textureData);
        }
    }

    addTexturePreview(resultItem, textureData) {
        const textureSection = document.createElement('div');
        textureSection.className = 'texture-section';
        textureSection.innerHTML = `
            <h4>Generated WebGL Texture</h4>
            <img src="${textureData.dataURL}" class="texture-preview" style="width: 150px; height: 150px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2);">
            <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.8;">High-resolution texture for complex gradients</p>
        `;
        
        const gradientInfo = resultItem.querySelector('.gradient-info');
        gradientInfo.appendChild(textureSection);
    }

    async drawOriginalPreview(month, theme, canvas) {
        const key = `${month}_${theme}`;
        const file = this.uploadedFiles.get(key);
        if (!file) return;
        
        const img = new Image();
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            canvas.width = 240; // Fixed preview size
            canvas.height = 150;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        
        img.src = URL.createObjectURL(file);
    }

    exportAsJSON() {
        const exportData = {
            metadata: {
                version: '1.0',
                extractedAt: new Date().toISOString(),
                totalGradients: this.extractedGradients.size
            },
            gradients: {}
        };
        
        for (const [key, gradientData] of this.extractedGradients) {
            exportData.gradients[key] = {
                month: gradientData.month,
                theme: gradientData.theme,
                type: gradientData.type,
                direction: gradientData.direction,
                colorStops: gradientData.colors,
                quality: gradientData.quality,
                mathRepresentation: gradientData.mathRepresentation
            };
        }
        
        this.downloadFile('ps3-xmb-gradients.json', JSON.stringify(exportData, null, 2));
    }

    exportAsJavaScript() {
        let jsContent = `// PS3 XMB Background Gradients
// Auto-generated on ${new Date().toISOString()}

export const PS3_XMB_GRADIENTS = {\n`;
        
        for (const [key, gradientData] of this.extractedGradients) {
            jsContent += `  "${key}": {\n`;
            jsContent += `    month: "${gradientData.month}",\n`;
            jsContent += `    theme: "${gradientData.theme}",\n`;
            jsContent += `    type: "${gradientData.type}",\n`;
            jsContent += `    direction: [${gradientData.direction.map(d => d.toFixed(4)).join(', ')}],\n`;
            jsContent += `    colorStops: [\n`;
            
            gradientData.colors.forEach(stop => {
                jsContent += `      { position: ${stop.position.toFixed(4)}, color: [${stop.color.map(c => c.toFixed(4)).join(', ')}] },\n`;
            });
            
            jsContent += `    ],\n`;
            jsContent += `    quality: ${gradientData.quality.toFixed(4)},\n`;
            jsContent += `    glslFunction: \`${gradientData.mathRepresentation.glslFunction}\`\n`;
            jsContent += `  },\n`;
        }
        
        jsContent += `};\n\n`;
        jsContent += `// Helper function to get gradient data by month and theme\n`;
        jsContent += `export function getGradient(month, theme) {\n`;
        jsContent += `  const key = \`\${month}_\${theme}\`;\n`;
        jsContent += `  return PS3_XMB_GRADIENTS[key] || null;\n`;
        jsContent += `}\n\n`;
        jsContent += `// Get all available months\n`;
        jsContent += `export const AVAILABLE_MONTHS = [${this.months.map(m => `"${m}"`).join(', ')}];\n\n`;
        jsContent += `// Get all available themes\n`;
        jsContent += `export const AVAILABLE_THEMES = ["rgb", "night"];\n`;
        
        this.downloadFile('ps3-xmb-gradients.js', jsContent);
    }

    exportAsGLSL() {
        let glslContent = `// PS3 XMB Background Gradients - GLSL Functions
// Auto-generated on ${new Date().toISOString()}

`;
        
        for (const [key, gradientData] of this.extractedGradients) {
            const functionName = `getGradient_${gradientData.month}_${gradientData.theme}`;
            glslContent += `// ${gradientData.month.charAt(0).toUpperCase() + gradientData.month.slice(1)} ${gradientData.theme === 'rgb' ? 'Day' : 'Night'}\n`;
            glslContent += gradientData.mathRepresentation.glslFunction.replace('getGradientColor', functionName) + '\n\n';
        }
        
        // Add a master function
        glslContent += `// Master gradient function\n`;
        glslContent += `vec3 getPS3Gradient(vec2 uv, int month, int theme) {\n`;
        
        let caseCount = 0;
        for (const [key, gradientData] of this.extractedGradients) {
            const monthIndex = this.months.indexOf(gradientData.month);
            const themeIndex = gradientData.theme === 'rgb' ? 0 : 1;
            const caseValue = monthIndex * 2 + themeIndex;
            
            if (caseCount === 0) {
                glslContent += `    if (month == ${monthIndex} && theme == ${themeIndex}) {\n`;
            } else {
                glslContent += `    } else if (month == ${monthIndex} && theme == ${themeIndex}) {\n`;
            }
            
            const functionName = `getGradient_${gradientData.month}_${gradientData.theme}`;
            glslContent += `        return ${functionName}(uv);\n`;
            caseCount++;
        }
        
        glslContent += `    } else {\n`;
        glslContent += `        return vec3(0.145, 0.349, 0.702); // Default PS3 blue\n`;
        glslContent += `    }\n`;
        glslContent += `}\n`;
        
        this.downloadFile('ps3-xmb-gradients.glsl', glslContent);
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    testAdvancedExtractor() {
        if (typeof AdvancedGradientExtractor !== 'undefined') {
            console.log('✅ Advanced Gradient Extractor is available');
            try {
                const testExtractor = new AdvancedGradientExtractor();
                console.log('✅ Advanced Gradient Extractor initialized successfully');
            } catch (error) {
                console.warn('⚠️ Advanced Gradient Extractor failed to initialize:', error);
            }
        } else {
            console.warn('⚠️ Advanced Gradient Extractor not found - only basic analysis will be available');
            // Disable advanced button if extractor is not available
            setTimeout(() => {
                const advancedBtn = document.getElementById('advancedAnalyzeBtn');
                if (advancedBtn) {
                    advancedBtn.disabled = true;
                    advancedBtn.textContent = 'Advanced Analysis (Not Available)';
                    advancedBtn.style.opacity = '0.5';
                }
            }, 100);
        }
    }
}

// Initialize the gradient extractor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GradientExtractor();
});