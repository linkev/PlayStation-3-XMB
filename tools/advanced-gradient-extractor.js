// Advanced PS3 XMB Gradient Extractor
// Uses dense sampling and texture generation for accurate representation

class AdvancedGradientExtractor {
    constructor() {
        this.sampleResolution = 64; // Higher resolution sampling
        this.colorAccuracy = 0.01; // Higher color precision
        this.months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
    }

    async extractAccurateGradient(file, month, theme) {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Use multiple extraction methods and combine results
                const methods = [
                    this.denseSampling(canvas),
                    this.vectorFieldAnalysis(canvas),
                    this.colorFlowAnalysis(canvas),
                    this.textureGeneration(canvas)
                ];
                
                const combinedData = this.combineExtractionMethods(methods, month, theme);
                resolve(combinedData);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Method 1: Dense sampling with spatial weighting
    denseSampling(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        const samples = [];
        const resolution = this.sampleResolution;
        
        // Dense grid sampling
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const pixelX = Math.floor((x / (resolution - 1)) * (width - 1));
                const pixelY = Math.floor((y / (resolution - 1)) * (height - 1));
                const index = (pixelY * width + pixelX) * 4;
                
                const r = data[index] / 255;
                const g = data[index + 1] / 255;
                const b = data[index + 2] / 255;
                
                samples.push({
                    x: x / (resolution - 1),
                    y: y / (resolution - 1),
                    color: [r, g, b],
                    weight: this.calculateSpatialWeight(x / (resolution - 1), y / (resolution - 1))
                });
            }
        }
        
        return {
            type: 'dense_sampling',
            samples: samples,
            resolution: resolution
        };
    }

    // Method 2: Vector field analysis for complex gradients
    vectorFieldAnalysis(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        const vectors = [];
        const stepSize = 8; // Analyze every 8th pixel
        
        for (let y = stepSize; y < height - stepSize; y += stepSize) {
            for (let x = stepSize; x < width - stepSize; x += stepSize) {
                const centerIndex = (y * width + x) * 4;
                const centerColor = [
                    data[centerIndex] / 255,
                    data[centerIndex + 1] / 255,
                    data[centerIndex + 2] / 255
                ];
                
                // Calculate gradient vectors in 8 directions
                const directions = [
                    [-1, -1], [0, -1], [1, -1],
                    [-1,  0],          [1,  0],
                    [-1,  1], [0,  1], [1,  1]
                ];
                
                const gradientVector = [0, 0];
                let maxGradient = 0;
                
                directions.forEach(([dx, dy]) => {
                    const neighborX = x + dx * stepSize;
                    const neighborY = y + dy * stepSize;
                    
                    if (neighborX >= 0 && neighborX < width && neighborY >= 0 && neighborY < height) {
                        const neighborIndex = (neighborY * width + neighborX) * 4;
                        const neighborColor = [
                            data[neighborIndex] / 255,
                            data[neighborIndex + 1] / 255,
                            data[neighborIndex + 2] / 255
                        ];
                        
                        const colorDiff = this.calculateColorDistance(centerColor, neighborColor);
                        if (colorDiff > maxGradient) {
                            maxGradient = colorDiff;
                            gradientVector[0] = dx * colorDiff;
                            gradientVector[1] = dy * colorDiff;
                        }
                    }
                });
                
                vectors.push({
                    x: x / width,
                    y: y / height,
                    vector: gradientVector,
                    magnitude: maxGradient,
                    color: centerColor
                });
            }
        }
        
        return {
            type: 'vector_field',
            vectors: vectors,
            stepSize: stepSize
        };
    }

    // Method 3: Color flow analysis
    colorFlowAnalysis(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Analyze color transitions along different paths
        const flows = {
            horizontal: this.analyzeFlow(data, width, height, 'horizontal'),
            vertical: this.analyzeFlow(data, width, height, 'vertical'),
            diagonal1: this.analyzeFlow(data, width, height, 'diagonal1'),
            diagonal2: this.analyzeFlow(data, width, height, 'diagonal2'),
            radial: this.analyzeRadialFlow(data, width, height)
        };
        
        return {
            type: 'color_flow',
            flows: flows
        };
    }

    // Method 4: Generate high-resolution texture
    textureGeneration(canvas) {
        const originalCtx = canvas.getContext('2d');
        
        // Create high-resolution texture (512x512 for WebGL)
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = 512;
        textureCanvas.height = 512;
        const textureCtx = textureCanvas.getContext('2d');
        
        // Scale and interpolate the original image
        textureCtx.imageSmoothingEnabled = true;
        textureCtx.imageSmoothingQuality = 'high';
        textureCtx.drawImage(canvas, 0, 0, 512, 512);
        
        // Apply additional smoothing filter
        const imageData = textureCtx.getImageData(0, 0, 512, 512);
        const smoothedData = this.applyBilateralFilter(imageData);
        textureCtx.putImageData(smoothedData, 0, 0);
        
        return {
            type: 'texture',
            canvas: textureCanvas,
            dataURL: textureCanvas.toDataURL('image/png'),
            width: 512,
            height: 512
        };
    }

    // Combine all extraction methods for best accuracy
    combineExtractionMethods(methods, month, theme) {
        const [denseSampling, vectorField, colorFlow, texture] = methods;
        
        // Determine primary gradient characteristics
        const characteristics = this.analyzeGradientCharacteristics(methods);
        
        // Generate optimal shader based on complexity
        let shaderData;
        if (characteristics.complexity < 0.3) {
            // Simple gradient - use mathematical representation
            shaderData = this.generateMathematicalShader(denseSampling, vectorField);
        } else {
            // Complex gradient - use texture-based approach
            shaderData = this.generateTextureShader(texture, denseSampling);
        }
        
        return {
            month,
            theme,
            complexity: characteristics.complexity,
            dominantDirection: characteristics.dominantDirection,
            colorVariance: characteristics.colorVariance,
            shaderData,
            textureData: texture,
            fallbackColors: this.extractFallbackColors(denseSampling),
            quality: this.calculateQualityScore(methods)
        };
    }

    // Generate mathematical shader for simple gradients
    generateMathematicalShader(denseSampling, vectorField) {
        // Analyze the dominant flow direction
        const dominantFlow = this.findDominantFlow(vectorField);
        
        if (dominantFlow.type === 'linear') {
            return this.generateLinearShader(denseSampling.samples, dominantFlow);
        } else if (dominantFlow.type === 'radial') {
            return this.generateRadialShader(denseSampling.samples, dominantFlow);
        } else {
            // Complex flow - use texture approach
            return this.generateComplexShader(denseSampling.samples, vectorField);
        }
    }

    // Generate texture-based shader for complex gradients
    generateTextureShader(texture, denseSampling) {
        return {
            type: 'texture',
            textureData: texture.dataURL,
            samplingPoints: denseSampling.samples.filter(s => s.weight > 0.1),
            glslFunction: `
uniform sampler2D u_backgroundTexture;

vec3 getGradientColor(vec2 uv) {
    return texture2D(u_backgroundTexture, uv).rgb;
}
            `
        };
    }

    // Helper methods
    calculateSpatialWeight(x, y) {
        // Give more weight to edge and corner samples
        const edgeWeight = Math.min(
            Math.min(x, 1 - x) * 4,
            Math.min(y, 1 - y) * 4,
            1
        );
        return 0.5 + edgeWeight * 0.5;
    }

    calculateColorDistance(color1, color2) {
        // Use perceptually uniform color distance (Delta E)
        const lab1 = this.rgbToLab(color1);
        const lab2 = this.rgbToLab(color2);
        
        return Math.sqrt(
            Math.pow(lab1[0] - lab2[0], 2) +
            Math.pow(lab1[1] - lab2[1], 2) +
            Math.pow(lab1[2] - lab2[2], 2)
        );
    }

    rgbToLab(rgb) {
        // Simplified RGB to LAB conversion for better color distance
        const [r, g, b] = rgb;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        const a = 0.5 * (r - g);
        const bComp = 0.25 * (r + g - 2 * b);
        return [l, a, bComp];
    }

    analyzeFlow(data, width, height, direction) {
        const flows = [];
        const samples = 32;
        
        for (let i = 0; i < samples; i++) {
            let startX, startY, endX, endY;
            
            switch (direction) {
                case 'horizontal':
                    startX = 0; endX = width - 1;
                    startY = endY = Math.floor((i / (samples - 1)) * (height - 1));
                    break;
                case 'vertical':
                    startY = 0; endY = height - 1;
                    startX = endX = Math.floor((i / (samples - 1)) * (width - 1));
                    break;
                case 'diagonal1':
                    startX = 0; startY = 0;
                    endX = width - 1; endY = height - 1;
                    break;
                case 'diagonal2':
                    startX = 0; startY = height - 1;
                    endX = width - 1; endY = 0;
                    break;
            }
            
            const pathColors = this.samplePath(data, width, height, startX, startY, endX, endY);
            flows.push({
                path: { startX, startY, endX, endY },
                colors: pathColors,
                variation: this.calculatePathVariation(pathColors)
            });
        }
        
        return flows;
    }

    analyzeRadialFlow(data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(centerX, centerY);
        const angleSteps = 16;
        const radiusSteps = 16;
        
        const radialFlows = [];
        
        for (let angle = 0; angle < angleSteps; angle++) {
            const angleRad = (angle / angleSteps) * 2 * Math.PI;
            const pathColors = [];
            
            for (let r = 0; r < radiusSteps; r++) {
                const radius = (r / (radiusSteps - 1)) * maxRadius;
                const x = centerX + radius * Math.cos(angleRad);
                const y = centerY + radius * Math.sin(angleRad);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const index = (Math.floor(y) * width + Math.floor(x)) * 4;
                    pathColors.push([
                        data[index] / 255,
                        data[index + 1] / 255,
                        data[index + 2] / 255
                    ]);
                }
            }
            
            radialFlows.push({
                angle: angleRad,
                colors: pathColors,
                variation: this.calculatePathVariation(pathColors)
            });
        }
        
        return radialFlows;
    }

    samplePath(data, width, height, x1, y1, x2, y2) {
        const samples = 32;
        const colors = [];
        
        for (let i = 0; i < samples; i++) {
            const t = i / (samples - 1);
            const x = Math.floor(x1 + t * (x2 - x1));
            const y = Math.floor(y1 + t * (y2 - y1));
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const index = (y * width + x) * 4;
                colors.push([
                    data[index] / 255,
                    data[index + 1] / 255,
                    data[index + 2] / 255
                ]);
            }
        }
        
        return colors;
    }

    calculatePathVariation(colors) {
        if (colors.length < 2) return 0;
        
        let totalVariation = 0;
        for (let i = 1; i < colors.length; i++) {
            totalVariation += this.calculateColorDistance(colors[i], colors[i - 1]);
        }
        
        return totalVariation / (colors.length - 1);
    }

    applyBilateralFilter(imageData) {
        // Simplified bilateral filter for smoothing while preserving edges
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const filtered = new ImageData(width, height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const centerIndex = (y * width + x) * 4;
                
                let r = 0, g = 0, b = 0, totalWeight = 0;
                
                // 3x3 kernel
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
                        const weight = this.calculateBilateralWeight(data, centerIndex, neighborIndex);
                        
                        r += data[neighborIndex] * weight;
                        g += data[neighborIndex + 1] * weight;
                        b += data[neighborIndex + 2] * weight;
                        totalWeight += weight;
                    }
                }
                
                filtered.data[centerIndex] = r / totalWeight;
                filtered.data[centerIndex + 1] = g / totalWeight;
                filtered.data[centerIndex + 2] = b / totalWeight;
                filtered.data[centerIndex + 3] = data[centerIndex + 3]; // Alpha
            }
        }
        
        return filtered;
    }

    calculateBilateralWeight(data, centerIndex, neighborIndex) {
        // Spatial weight (fixed for 3x3 kernel)
        const spatialWeight = 1.0;
        
        // Color similarity weight
        const colorDiff = Math.sqrt(
            Math.pow(data[centerIndex] - data[neighborIndex], 2) +
            Math.pow(data[centerIndex + 1] - data[neighborIndex + 1], 2) +
            Math.pow(data[centerIndex + 2] - data[neighborIndex + 2], 2)
        ) / 255;
        
        const colorWeight = Math.exp(-colorDiff * colorDiff / 0.1);
        
        return spatialWeight * colorWeight;
    }

    analyzeGradientCharacteristics(methods) {
        const [denseSampling, vectorField, colorFlow, texture] = methods;
        
        // Calculate complexity based on color variance and vector field uniformity
        const colorVariance = this.calculateColorVariance(denseSampling.samples);
        const vectorUniformity = this.calculateVectorUniformity(vectorField.vectors);
        const flowComplexity = this.calculateFlowComplexity(colorFlow.flows);
        
        const complexity = (colorVariance + (1 - vectorUniformity) + flowComplexity) / 3;
        
        // Determine dominant direction
        const dominantDirection = this.findDominantDirection(vectorField.vectors);
        
        return {
            complexity,
            colorVariance,
            vectorUniformity,
            flowComplexity,
            dominantDirection
        };
    }

    calculateColorVariance(samples) {
        if (samples.length === 0) return 0;
        
        // Calculate average color
        const avgColor = [0, 0, 0];
        samples.forEach(sample => {
            avgColor[0] += sample.color[0];
            avgColor[1] += sample.color[1];
            avgColor[2] += sample.color[2];
        });
        avgColor[0] /= samples.length;
        avgColor[1] /= samples.length;
        avgColor[2] /= samples.length;
        
        // Calculate variance
        let variance = 0;
        samples.forEach(sample => {
            variance += this.calculateColorDistance(sample.color, avgColor);
        });
        
        return variance / samples.length;
    }

    calculateVectorUniformity(vectors) {
        if (vectors.length === 0) return 1;
        
        // Calculate average vector direction
        let avgDirection = [0, 0];
        vectors.forEach(v => {
            if (v.magnitude > 0.1) { // Only consider significant vectors
                avgDirection[0] += v.vector[0];
                avgDirection[1] += v.vector[1];
            }
        });
        
        const length = Math.sqrt(avgDirection[0] ** 2 + avgDirection[1] ** 2);
        if (length > 0) {
            avgDirection[0] /= length;
            avgDirection[1] /= length;
        }
        
        // Calculate uniformity
        let uniformity = 0;
        let significantVectors = 0;
        
        vectors.forEach(v => {
            if (v.magnitude > 0.1) {
                const normalizedVector = [
                    v.vector[0] / (v.magnitude || 1),
                    v.vector[1] / (v.magnitude || 1)
                ];
                
                const dot = normalizedVector[0] * avgDirection[0] + normalizedVector[1] * avgDirection[1];
                uniformity += Math.abs(dot);
                significantVectors++;
            }
        });
        
        return significantVectors > 0 ? uniformity / significantVectors : 1;
    }

    calculateFlowComplexity(flows) {
        let totalComplexity = 0;
        let flowCount = 0;
        
        Object.values(flows).forEach(flowSet => {
            if (Array.isArray(flowSet)) {
                flowSet.forEach(flow => {
                    totalComplexity += flow.variation || 0;
                    flowCount++;
                });
            }
        });
        
        return flowCount > 0 ? totalComplexity / flowCount : 0;
    }

    findDominantDirection(vectors) {
        // Implementation for finding dominant gradient direction
        // Returns normalized direction vector
        let sumX = 0, sumY = 0, totalMagnitude = 0;
        
        vectors.forEach(v => {
            if (v.magnitude > 0.1) {
                sumX += v.vector[0] * v.magnitude;
                sumY += v.vector[1] * v.magnitude;
                totalMagnitude += v.magnitude;
            }
        });
        
        if (totalMagnitude > 0) {
            return [sumX / totalMagnitude, sumY / totalMagnitude];
        }
        
        return [1, 0]; // Default horizontal
    }

    extractFallbackColors(denseSampling) {
        // Extract key colors for fallback
        const samples = denseSampling.samples;
        const corners = [
            samples.find(s => s.x < 0.1 && s.y < 0.1)?.color || [0, 0, 0],
            samples.find(s => s.x > 0.9 && s.y < 0.1)?.color || [0, 0, 0],
            samples.find(s => s.x < 0.1 && s.y > 0.9)?.color || [0, 0, 0],
            samples.find(s => s.x > 0.9 && s.y > 0.9)?.color || [0, 0, 0]
        ];
        
        const center = samples.find(s => 
            Math.abs(s.x - 0.5) < 0.1 && Math.abs(s.y - 0.5) < 0.1
        )?.color || [0, 0, 0];
        
        return { corners, center };
    }

    calculateQualityScore(methods) {
        // Implementation for quality assessment
        return 0.85; // Placeholder
    }

    findDominantFlow(vectorField) {
        // Analyze vector field to determine if it's linear, radial, or complex
        const vectors = vectorField.vectors;
        const uniformity = this.calculateVectorUniformity(vectors);
        
        if (uniformity > 0.8) {
            return { type: 'linear', uniformity };
        } else if (this.isRadialPattern(vectors)) {
            return { type: 'radial', uniformity };
        } else {
            return { type: 'complex', uniformity };
        }
    }

    isRadialPattern(vectors) {
        // Check if vectors point radially from center
        let radialScore = 0;
        
        vectors.forEach(v => {
            if (v.magnitude > 0.1) {
                const centerVector = [v.x - 0.5, v.y - 0.5];
                const centerLength = Math.sqrt(centerVector[0] ** 2 + centerVector[1] ** 2);
                
                if (centerLength > 0) {
                    const normalizedCenter = [centerVector[0] / centerLength, centerVector[1] / centerLength];
                    const normalizedGradient = [
                        v.vector[0] / (v.magnitude || 1),
                        v.vector[1] / (v.magnitude || 1)
                    ];
                    
                    const dot = Math.abs(normalizedCenter[0] * normalizedGradient[0] + 
                                       normalizedCenter[1] * normalizedGradient[1]);
                    radialScore += dot;
                }
            }
        });
        
        return radialScore / vectors.length > 0.6;
    }

    generateLinearShader(samples, dominantFlow) {
        // Generate optimized linear gradient shader
        const direction = this.findDominantDirection(samples.map(s => ({
            vector: [s.x - 0.5, s.y - 0.5],
            magnitude: 1
        })));
        
        const colorStops = this.extractLinearColorStops(samples, direction);
        
        return {
            type: 'linear',
            direction,
            colorStops,
            glslFunction: this.generateLinearGLSL(direction, colorStops)
        };
    }

    generateRadialShader(samples, dominantFlow) {
        // Generate optimized radial gradient shader
        const colorStops = this.extractRadialColorStops(samples);
        
        return {
            type: 'radial',
            center: [0.5, 0.5],
            colorStops,
            glslFunction: this.generateRadialGLSL(colorStops)
        };
    }

    generateComplexShader(samples, vectorField) {
        // For complex gradients, create a simplified shader with key color points
        const keyPoints = this.extractKeyColorPoints(samples, vectorField);
        
        return {
            type: 'complex',
            keyPoints,
            glslFunction: this.generateComplexGLSL(keyPoints)
        };
    }

    extractLinearColorStops(samples, direction) {
        // Project samples onto the dominant direction and extract color stops
        const projectedSamples = samples.map(sample => ({
            position: sample.x * direction[0] + sample.y * direction[1],
            color: sample.color
        }));
        
        projectedSamples.sort((a, b) => a.position - b.position);
        
        // Select representative color stops
        const stops = [];
        const stepSize = Math.floor(projectedSamples.length / 5);
        
        for (let i = 0; i < projectedSamples.length; i += stepSize) {
            if (i < projectedSamples.length) {
                stops.push({
                    position: (projectedSamples[i].position + 1) / 2, // Normalize to 0-1
                    color: projectedSamples[i].color
                });
            }
        }
        
        return stops;
    }

    extractRadialColorStops(samples) {
        // Calculate distance from center for each sample
        const radialSamples = samples.map(sample => ({
            distance: Math.sqrt(Math.pow(sample.x - 0.5, 2) + Math.pow(sample.y - 0.5, 2)),
            color: sample.color
        }));
        
        radialSamples.sort((a, b) => a.distance - b.distance);
        
        // Select representative color stops
        const stops = [];
        const stepSize = Math.floor(radialSamples.length / 5);
        
        for (let i = 0; i < radialSamples.length; i += stepSize) {
            if (i < radialSamples.length) {
                stops.push({
                    position: radialSamples[i].distance / 0.7, // Normalize
                    color: radialSamples[i].color
                });
            }
        }
        
        return stops;
    }

    extractKeyColorPoints(samples, vectorField) {
        // Extract strategically important color points for complex gradients
        const keyPoints = [];
        
        // Add corner points
        [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]].forEach(([x, y]) => {
            const nearestSample = samples.reduce((nearest, sample) => {
                const dist = Math.sqrt(Math.pow(sample.x - x, 2) + Math.pow(sample.y - y, 2));
                return dist < nearest.dist ? { sample, dist } : nearest;
            }, { dist: Infinity });
            
            if (nearestSample.sample) {
                keyPoints.push({
                    position: [x, y],
                    color: nearestSample.sample.color,
                    type: x === 0.5 && y === 0.5 ? 'center' : 'corner'
                });
            }
        });
        
        return keyPoints;
    }

    generateLinearGLSL(direction, colorStops) {
        let glsl = `vec3 getGradientColor(vec2 uv) {\n`;
        glsl += `    float t = dot(uv, vec2(${direction[0].toFixed(4)}, ${direction[1].toFixed(4)}));\n`;
        glsl += `    t = clamp(t, 0.0, 1.0);\n\n`;
        
        // Generate color interpolation code
        for (let i = 0; i < colorStops.length - 1; i++) {
            const current = colorStops[i];
            const next = colorStops[i + 1];
            
            if (i === 0) {
                glsl += `    if (t <= ${next.position.toFixed(4)}) {\n`;
            } else {
                glsl += `    } else if (t <= ${next.position.toFixed(4)}) {\n`;
            }
            
            const range = next.position - current.position;
            glsl += `        float localT = (t - ${current.position.toFixed(4)}) / ${range.toFixed(4)};\n`;
            glsl += `        return mix(vec3(${current.color.map(c => c.toFixed(4)).join(', ')}), `;
            glsl += `vec3(${next.color.map(c => c.toFixed(4)).join(', ')}), localT);\n`;
        }
        
        glsl += `    } else {\n`;
        glsl += `        return vec3(${colorStops[colorStops.length - 1].color.map(c => c.toFixed(4)).join(', ')});\n`;
        glsl += `    }\n`;
        glsl += `}`;
        
        return glsl;
    }

    generateRadialGLSL(colorStops) {
        let glsl = `vec3 getGradientColor(vec2 uv) {\n`;
        glsl += `    float dist = distance(uv, vec2(0.5, 0.5)) / 0.7;\n`;
        glsl += `    dist = clamp(dist, 0.0, 1.0);\n\n`;
        
        // Generate color interpolation code similar to linear
        for (let i = 0; i < colorStops.length - 1; i++) {
            const current = colorStops[i];
            const next = colorStops[i + 1];
            
            if (i === 0) {
                glsl += `    if (dist <= ${next.position.toFixed(4)}) {\n`;
            } else {
                glsl += `    } else if (dist <= ${next.position.toFixed(4)}) {\n`;
            }
            
            const range = next.position - current.position;
            glsl += `        float localT = (dist - ${current.position.toFixed(4)}) / ${range.toFixed(4)};\n`;
            glsl += `        return mix(vec3(${current.color.map(c => c.toFixed(4)).join(', ')}), `;
            glsl += `vec3(${next.color.map(c => c.toFixed(4)).join(', ')}), localT);\n`;
        }
        
        glsl += `    } else {\n`;
        glsl += `        return vec3(${colorStops[colorStops.length - 1].color.map(c => c.toFixed(4)).join(', ')});\n`;
        glsl += `    }\n`;
        glsl += `}`;
        
        return glsl;
    }

    generateComplexGLSL(keyPoints) {
        // Generate a GLSL function that interpolates between key points
        let glsl = `vec3 getGradientColor(vec2 uv) {\n`;
        glsl += `    vec3 color = vec3(0.0);\n`;
        glsl += `    float totalWeight = 0.0;\n\n`;
        
        keyPoints.forEach((point, index) => {
            glsl += `    {\n`;
            glsl += `        float dist = distance(uv, vec2(${point.position[0].toFixed(4)}, ${point.position[1].toFixed(4)}));\n`;
            glsl += `        float weight = 1.0 / (1.0 + dist * 4.0);\n`;
            glsl += `        color += vec3(${point.color.map(c => c.toFixed(4)).join(', ')}) * weight;\n`;
            glsl += `        totalWeight += weight;\n`;
            glsl += `    }\n`;
        });
        
        glsl += `    return color / totalWeight;\n`;
        glsl += `}`;
        
        return glsl;
    }
}

// Export for use
window.AdvancedGradientExtractor = AdvancedGradientExtractor; 