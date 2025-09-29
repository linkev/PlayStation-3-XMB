# PS3 XMB Gradient Integration Guide

## Overview

This guide explains how to integrate the extracted PS3 XMB background gradients into your existing wave recreation system. The gradient extractor converts .jpg background images into mathematical representations that can be rendered efficiently in WebGL/REGL.

## Integration Options

### Option 1: Dynamic Background Shader (Recommended)

Replace the static color background with a dynamic gradient-based background that changes based on month and time of day.

#### 1. Update Background Shader in `waves.js`

```javascript
// Enhanced background shader with gradient support
const SHADERS = {
  background: {
    vert: `${isWebGL2 ? "#version 300 es\n" : ""}
      precision highp float;
      ${isWebGL2 ? "in" : "attribute"} vec2 position;
      uniform vec2 u_resolution;
      ${isWebGL2 ? "out" : "varying"} vec2 v_pos;
      ${isWebGL2 ? "out" : "varying"} vec2 v_uv;
      ${isWebGL2 ? "out" : "varying"} float v_gradient;
      void main() {
        v_pos = (position + 1.0) / 2.0 * u_resolution;
        v_uv = (position + 1.0) / 2.0;
        v_gradient = 1.0 - position.y * 0.625;
        gl_Position = vec4(position, 0.0, 1.0);
      }`,
    frag: `${isWebGL2 ? "#version 300 es\n" : ""}
      precision highp float;
      uniform vec3 u_color;
      uniform vec2 u_resolution;
      uniform sampler2D u_bayerTexture;
      uniform bool u_useGradient;
      uniform int u_gradientType; // 0: linear, 1: radial
      uniform vec2 u_gradientDirection;
      uniform float u_gradientStops[20]; // positions + colors (5 stops * 4 components)
      uniform int u_gradientStopCount;
      ${isWebGL2 ? "in" : "varying"} vec2 v_pos;
      ${isWebGL2 ? "in" : "varying"} vec2 v_uv;
      ${isWebGL2 ? "in" : "varying"} float v_gradient;
      ${isWebGL2 ? "out vec4 fragColor;\n" : ""}
      
      const float colorDepth = 255.0;
      
      vec3 dither(vec2 position, vec3 color) {
        float threshold = texture${isWebGL2 ? "" : "2D"}(u_bayerTexture, position / 8.0).a;
        vec3 diff = 1.0 - mod(color * colorDepth, 1.0);
        return color + diff * vec3(
          float(diff.r < threshold),
          float(diff.g < threshold),
          float(diff.b < threshold)
        ) / colorDepth;
      }
      
      vec3 getGradientColor(vec2 uv) {
        if (!u_useGradient) {
          return u_color;
        }
        
        float t;
        if (u_gradientType == 1) {
          // Radial gradient
          t = distance(uv, vec2(0.5, 0.5)) / 0.7;
        } else {
          // Linear gradient
          t = dot(uv, u_gradientDirection);
        }
        t = clamp(t, 0.0, 1.0);
        
        // Interpolate through gradient stops
        if (u_gradientStopCount < 2) return u_color;
        
        for (int i = 0; i < 4; i++) {
          if (i >= u_gradientStopCount - 1) break;
          
          float pos1 = u_gradientStops[i * 4];
          float pos2 = u_gradientStops[(i + 1) * 4];
          
          if (t >= pos1 && t <= pos2) {
            float localT = (t - pos1) / (pos2 - pos1);
            vec3 color1 = vec3(u_gradientStops[i * 4 + 1], u_gradientStops[i * 4 + 2], u_gradientStops[i * 4 + 3]);
            vec3 color2 = vec3(u_gradientStops[(i + 1) * 4 + 1], u_gradientStops[(i + 1) * 4 + 2], u_gradientStops[(i + 1) * 4 + 3]);
            return mix(color1, color2, localT);
          }
        }
        
        return u_color;
      }
      
      void main() {
        vec3 gradientColor = getGradientColor(v_uv);
        ${isWebGL2 ? "fragColor" : "gl_FragColor"} = vec4(dither(v_pos, v_gradient * gradientColor), 1.0);
      }`,
  },
  // ... rest of shaders remain the same
};
```

#### 2. Create Gradient Manager Module

```javascript
// gradient-manager.js
class PS3GradientManager {
  constructor() {
    this.gradients = new Map();
    this.currentMonth = 0; // 0-11 for Jan-Dec
    this.currentTheme = 'rgb'; // 'rgb' or 'night'
    this.transitionDuration = 2000; // 2 seconds
    this.isTransitioning = false;
  }

  async loadGradients(gradientData) {
    // Load from exported gradient data
    for (const [key, gradient] of Object.entries(gradientData.gradients)) {
      this.gradients.set(key, gradient);
    }
  }

  getCurrentGradient() {
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december'];
    const monthName = months[this.currentMonth];
    const key = `${monthName}_${this.currentTheme}`;
    return this.gradients.get(key);
  }

  setMonth(month) {
    if (month !== this.currentMonth && !this.isTransitioning) {
      this.currentMonth = month;
      return this.getCurrentGradient();
    }
    return null;
  }

  setTheme(theme) {
    if (theme !== this.currentTheme && !this.isTransitioning) {
      this.currentTheme = theme;
      return this.getCurrentGradient();
    }
    return null;
  }

  // Convert gradient data to shader uniforms
  getShaderUniforms(gradient) {
    if (!gradient) return null;

    const uniforms = {
      u_useGradient: true,
      u_gradientType: gradient.type === 'radial' ? 1 : 0,
      u_gradientDirection: gradient.direction || [1, 0],
      u_gradientStopCount: Math.min(gradient.colorStops.length, 5)
    };

    // Pack gradient stops into array
    const stops = new Array(20).fill(0);
    for (let i = 0; i < Math.min(gradient.colorStops.length, 5); i++) {
      const stop = gradient.colorStops[i];
      stops[i * 4] = stop.position;
      stops[i * 4 + 1] = stop.color[0];
      stops[i * 4 + 2] = stop.color[1];
      stops[i * 4 + 3] = stop.color[2];
    }
    uniforms.u_gradientStops = stops;

    return uniforms;
  }

  // Smooth transition between gradients
  async transitionToGradient(newGradient, currentUniforms, updateCallback) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    const startTime = performance.now();
    const startUniforms = { ...currentUniforms };
    const endUniforms = this.getShaderUniforms(newGradient);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.transitionDuration, 1);
      const easeProgress = this.easeInOutCubic(progress);

      // Interpolate uniforms
      const interpolatedUniforms = this.interpolateUniforms(startUniforms, endUniforms, easeProgress);
      updateCallback(interpolatedUniforms);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isTransitioning = false;
      }
    };

    requestAnimationFrame(animate);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  interpolateUniforms(start, end, t) {
    const result = { ...end };
    
    // Interpolate gradient stops
    const stops = new Array(20);
    for (let i = 0; i < 20; i++) {
      stops[i] = start.u_gradientStops[i] + (end.u_gradientStops[i] - start.u_gradientStops[i]) * t;
    }
    result.u_gradientStops = stops;

    return result;
  }
}
```

#### 3. Update Main Wave System

```javascript
// In waves.js initializeDrawingFunctions()
let gradientManager = null;
let currentGradientUniforms = {
  u_useGradient: false,
  u_gradientType: 0,
  u_gradientDirection: [1, 0],
  u_gradientStops: new Array(20).fill(0),
  u_gradientStopCount: 0
};

// Load gradient data (example)
async function loadGradientData() {
  try {
    const response = await fetch('ps3-xmb-gradients.json');
    const gradientData = await response.json();
    gradientManager = new PS3GradientManager();
    await gradientManager.loadGradients(gradientData);
    
    // Set initial gradient
    const initialGradient = gradientManager.getCurrentGradient();
    if (initialGradient) {
      currentGradientUniforms = gradientManager.getShaderUniforms(initialGradient);
    }
  } catch (error) {
    console.warn('Could not load gradient data, using fallback colors');
  }
}

// Update drawBackground to include gradient uniforms
const drawBackground = regl({
  vert: SHADERS.background.vert,
  frag: SHADERS.background.frag,
  primitive: "triangle strip",
  count: 4,
  attributes: {
    position: [+1, -1, -1, -1, +1, +1, -1, +1],
  },
  uniforms: {
    u_color: regl.prop("color"),
    u_resolution: (context) => [context.viewportWidth, context.viewportHeight],
    u_bayerTexture: regl.texture(/* ... existing bayer texture setup ... */),
    u_useGradient: regl.prop("useGradient"),
    u_gradientType: regl.prop("gradientType"),
    u_gradientDirection: regl.prop("gradientDirection"),
    u_gradientStops: regl.prop("gradientStops"),
    u_gradientStopCount: regl.prop("gradientStopCount"),
  },
  depth: { enable: false },
});

// In animation loop
function animate(context) {
  // ... existing code ...
  
  // Render background with gradient
  const backgroundProps = {
    ...drawParams,
    ...currentGradientUniforms
  };
  drawBackground(backgroundProps);
  
  // ... rest of rendering ...
}
```

### Option 2: Texture-Based Approach

For complex gradients that are difficult to represent mathematically, you can generate texture data.

#### Generate Gradient Textures

```javascript
// In gradient-extractor.js, add texture generation
generateGradientTexture(gradientData, width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  // Create gradient
  let gradient;
  if (gradientData.type === 'radial') {
    gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.min(width, height) * 0.5
    );
  } else {
    const angle = Math.atan2(gradientData.direction[1], gradientData.direction[0]);
    const x1 = width * 0.5 + Math.cos(angle + Math.PI) * width * 0.5;
    const y1 = height * 0.5 + Math.sin(angle + Math.PI) * height * 0.5;
    const x2 = width * 0.5 + Math.cos(angle) * width * 0.5;
    const y2 = height * 0.5 + Math.sin(angle) * height * 0.5;
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }
  
  // Add color stops
  gradientData.colors.forEach(stop => {
    const color = `rgb(${Math.round(stop.color[0] * 255)}, ${Math.round(stop.color[1] * 255)}, ${Math.round(stop.color[2] * 255)})`;
    gradient.addColorStop(stop.position, color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}
```

## Time-Based Switching

### Automatic Day/Night Cycle

```javascript
// In wavesController.js
class TimeBasedGradientController {
  constructor(gradientManager) {
    this.gradientManager = gradientManager;
    this.updateInterval = null;
  }

  startAutomaticCycle() {
    this.updateInterval = setInterval(() => {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentHour = now.getHours();
      
      // Determine theme based on time
      const theme = (currentHour >= 6 && currentHour < 18) ? 'rgb' : 'night';
      
      // Update if different
      const monthChanged = this.gradientManager.setMonth(currentMonth);
      const themeChanged = this.gradientManager.setTheme(theme);
      
      if (monthChanged || themeChanged) {
        const newGradient = this.gradientManager.getCurrentGradient();
        if (newGradient) {
          this.transitionToNewGradient(newGradient);
        }
      }
    }, 60000); // Check every minute
  }

  stopAutomaticCycle() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  transitionToNewGradient(gradient) {
    if (window.ps3Waves && this.gradientManager) {
      const newUniforms = this.gradientManager.getShaderUniforms(gradient);
      this.gradientManager.transitionToGradient(
        gradient, 
        currentGradientUniforms, 
        (uniforms) => {
          currentGradientUniforms = uniforms;
        }
      );
    }
  }
}
```

## Performance Considerations

1. **Shader Complexity**: Linear gradients are faster than radial gradients
2. **Transition Smoothness**: Use easing functions for smooth transitions
3. **Memory Usage**: Limit gradient stops to 5 per gradient
4. **Cache Management**: Cache compiled shader programs for different gradient types

## File Structure Recommendations

```
/gradients/
  ├── ps3-xmb-gradients.json          # Main gradient data
  ├── ps3-xmb-gradients.js            # JavaScript module
  ├── ps3-xmb-gradients.glsl          # GLSL functions
  └── textures/                       # Optional texture fallbacks
      ├── january_rgb.png
      ├── january_night.png
      └── ...

/src/
  ├── gradient-manager.js             # Gradient management
  ├── time-controller.js              # Time-based switching
  └── waves.js                        # Updated with gradient support
```

## Integration Steps

1. **Extract Gradients**: Use the gradient extractor tool to process your 24 background images
2. **Choose Integration Method**: Select between shader-based or texture-based approach
3. **Update Shaders**: Modify background shader to support gradients
4. **Implement Management**: Add gradient manager and time-based controller
5. **Test Transitions**: Verify smooth transitions between gradients
6. **Optimize Performance**: Profile and optimize for your target devices

## Fallback Strategy

Always include fallback colors in case gradient loading fails:

```javascript
const FALLBACK_COLORS = {
  january: { rgb: [203, 191, 203], night: [101, 95, 101] },
  february: { rgb: [216, 191, 26], night: [108, 95, 13] },
  // ... etc
};
```

This ensures your PS3 XMB recreation works even without gradient data. 