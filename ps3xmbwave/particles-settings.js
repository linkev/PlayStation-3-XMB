'use strict';
// Tunable config map for particle count/size/opacity/flow, plus slider metadata for the controls panel.
// Consumed by `particles.js` at render time and by `settings-panels.js` for live UI generation.

window.PARTICLE_SETTINGS = {
  count: 2000,
  opacity: 0.75,
  sizeBase: 2.6,
  sizeVar: 1.5,
  flowSpeed: 0.18,
};

window.PARTICLE_SETTINGS_META = {
  count: { min: 10, max: 4000, step: 1, decimals: 0 },
  opacity: { min: 0, max: 1, step: 0.01 },
  sizeBase: { min: 1, max: 40, step: 0.1 },
  sizeVar: { min: 0, max: 50, step: 0.1 },
  flowSpeed: { min: 0, max: 3, step: 0.01 },
};
