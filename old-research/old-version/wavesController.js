// PlayStation 3 XMB Waves Controller
// Handles wave settings management

class WavesConfig {
  constructor(form) {
    this.form = form;
    this.initializeControls();
  }

  initializeControls() {
    this.addColorSelector();
    this.addWaveControls();
  }

  addColorSelector() {
    const colors = [
      ["original", [37, 89, 179]], // Original XMB blue
      ["january", [203, 191, 203]], // Silver/gray
      ["february", [216, 191, 26]], // Yellow
      ["march", [109, 178, 23]], // Green
      ["april", [225, 126, 154]], // Pink
      ["may", [23, 136, 22]], // Dark green
      ["june", [154, 97, 200]], // Purple
      ["july", [2, 205, 199]], // Turquoise
      ["august", [12, 118, 192]], // Blue
      ["september", [180, 68, 192]], // Magenta
      ["october", [229, 167, 8]], // Gold
      ["november", [135, 91, 30]], // Brown
      ["december", [227, 65, 42]], // Red
    ];

    this.addList(
      "Color Theme",
      colors,
      "original",
      (color) => window.ps3Waves.updateParams({
        backgroundColor: color
      })
    );
  }

  addWaveControls() {
    this.addRange("Flow Speed", 0.4, 0.0, 2.0, 0.05, (value) =>
      window.ps3Waves.updateParams({
        flowSpeed: value
      })
    );

    this.addRange("Wave Opacity", 0.5, 0.0, 1.0, 0.05, (value) =>
      window.ps3Waves.updateParams({
        opacity: value
      })
    );

    this.addRange("Day/Night", 1.0, 0.0, 1.0, 0.05, (value) => {
      const brightness = value * 0.8 + 0.2; // Maintain minimum brightness
      window.ps3Waves.updateParams({
        brightness: brightness
      });
    });

    this.addRange("Sparkle Intensity", 0.75, 0.0, 1.0, 0.05, (value) =>
      window.ps3Waves.updateParams({
        particleOpacity: value
      })
    );

    // Additional PS3 XMB wave parameters
    this.addRange("Wave Damping", 0.0001, 0.0, 0.001, 0.00001, (value) =>
      window.ps3Waves.updateParams({
        damping: value
      })
    );

    this.addRange("Wave Tension", 0.25, 0.0, 1.0, 0.05, (value) =>
      window.ps3Waves.updateParams({
        tension: value
      })
    );

    this.addRange("Wave Perturbation", 0.0, 0.0, 0.2, 0.01, (value) =>
      window.ps3Waves.updateParams({
        perturbation: value
      })
    );

    // Particle physics controls
    this.addRange("Particle Velocity Min", 0.15064, 0.0, 0.3, 0.01, (value) =>
      window.ps3Waves.updateParams({
        emitVelMin: value
      })
    );

    this.addRange("Particle Aging Speed", 0.00285223, 0.0, 0.01, 0.0001, (value) =>
      window.ps3Waves.updateParams({
        agingSpeed: value
      })
    );

    this.addRange("Particle Gravity", -0.000068, -0.001, 0.001, 0.00001, (value) =>
      window.ps3Waves.updateParams({
        gravity: value
      })
    );

    this.addRange("Brownian Motion", 0.225311, 0.0, 0.5, 0.01, (value) =>
      window.ps3Waves.updateParams({
        brownianScale: value
      })
    );
  }

  addList(name, options, defaultValue, setValueCallback) {
    const container = document.createElement("div");
    
    const label = document.createElement("label");
    label.textContent = name;
    label.className = "waves-settings-label";

    const select = document.createElement("select");
    select.className = "waves-settings-select";

    options.forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      option.selected = key === defaultValue;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selectedValue = options.find(([key]) => key === select.value)[1];
      setValueCallback(selectedValue);
    });

    container.appendChild(label);
    container.appendChild(select);
    this.form.appendChild(container);

    // Set initial value
    setValueCallback(options.find(([key]) => key === defaultValue)[1]);
  }

  addRange(name, defaultValue, min, max, step, setValueCallback) {
    const container = document.createElement("div");
    
    const label = document.createElement("label");
    label.textContent = name;
    label.className = "waves-settings-label";

    const controlGroup = document.createElement("div");
    controlGroup.className = "flex items-center gap-3";

    const input = document.createElement("input");
    input.type = "range";
    input.className = "waves-settings-range flex-1";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = defaultValue;

    const valueDisplay = document.createElement("span");
    valueDisplay.className = "waves-settings-value";
    valueDisplay.textContent = defaultValue.toFixed(2);

    input.addEventListener("input", () => {
      const value = parseFloat(input.value);
      setValueCallback(value);
      valueDisplay.textContent = value.toFixed(2);
    });

    controlGroup.appendChild(input);
    controlGroup.appendChild(valueDisplay);
    container.appendChild(label);
    container.appendChild(controlGroup);
    this.form.appendChild(container);

    // Set initial value
    setValueCallback(defaultValue);
  }
}

// Initialization
function initializeWaves() {
  const wavesBackground = document.getElementById("waves-background");
  
  if (!wavesBackground) {
    console.error("Required waves background element not found");
    return;
  }

  // Set initial canvas size
  wavesBackground.width = window.innerWidth;
  wavesBackground.height = window.innerHeight;

  // Wait for WebGL initialization
  function checkWavesReady() {
    if (window.ps3Waves?.isReady) {
      // Initialize settings panel
      const configForm = document.getElementById("waves-config");
      if (configForm) {
        new WavesConfig(configForm);
      }
    } else {
      setTimeout(checkWavesReady, 100);
    }
  }

  checkWavesReady();
}

// Interface Hide/Show functionality
function initializeInterfaceToggle() {
  const hideButton = document.getElementById('hide-interface-btn');
  const body = document.body;
  
  if (!hideButton) return;

  // Hide interface
  hideButton.addEventListener('click', (e) => {
    e.stopPropagation();
    body.classList.add('interface-hidden');
  });

  // Show interface on body click when hidden
  body.addEventListener('click', (e) => {
    if (body.classList.contains('interface-hidden')) {
      // Don't show if clicking on interface elements
      if (!e.target.closest('.interface') && !e.target.closest('#stats-container')) {
        body.classList.remove('interface-hidden');
      }
    }
  });

  // Prevent interface elements from triggering show
  const interfaceElement = document.querySelector('.interface');
  if (interfaceElement) {
    interfaceElement.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Add keyboard shortcut (H key) to toggle interface
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'H') {
      body.classList.toggle('interface-hidden');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeWaves();
  initializeInterfaceToggle();
});