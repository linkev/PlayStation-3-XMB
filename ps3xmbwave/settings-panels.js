'use strict';
// Lightweight DOM control-panel factory that introspects settings objects into sliders/select/reset controls.
// Shared by spline + particle configs (`spline-settings.js`, `particles-settings.js`) and initialized from `index.html`.

(function () {
  function decimalsFromStep(step) {
    const s = String(step);
    const idx = s.indexOf('.');
    return idx === -1 ? 0 : Math.min(6, s.length - idx - 1);
  }

  function humanizeKey(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function inferMeta(value) {
    const abs = Math.max(Math.abs(value), 1);
    return { min: value - abs * 2, max: value + abs * 2, step: abs / 200 };
  }

  function setPosition(el, pos) {
    if (!pos) return;
    if (pos.top != null) el.style.top = String(pos.top);
    if (pos.right != null) el.style.right = String(pos.right);
    if (pos.bottom != null) el.style.bottom = String(pos.bottom);
    if (pos.left != null) el.style.left = String(pos.left);
  }

  function getUiLayerRoot() {
    let root = document.getElementById('ui-layer-root');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'ui-layer-root';
    root.className = 'ui-layer-root';
    document.body.appendChild(root);
    return root;
  }

  window.createSettingsPanel = function createSettingsPanel(options) {
    const id = options && options.id;
    const title = options && options.title;
    const settings = options && options.settings;
    const metaMap = (options && options.meta) || {};
    const panelPos = options && options.position;
    const showPos = options && options.showPosition;

    if (!id || !title || !settings || typeof settings !== 'object') return;
    if (document.getElementById(id)) return;

    const originalSettings = Object.assign({}, settings);

    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'settings-panel';
    setPosition(panel, panelPos);

    const header = document.createElement('div');
    header.className = 'settings-panel-header';

    const titleEl = document.createElement('div');
    titleEl.className = 'settings-panel-title';
    titleEl.textContent = title;

    const hideBtn = document.createElement('button');
    hideBtn.className = 'settings-btn';
    hideBtn.type = 'button';
    hideBtn.textContent = 'Hide';

    const list = document.createElement('div');
    list.className = 'settings-panel-list';

    const showBtn = document.createElement('button');
    showBtn.id = id + '-show';
    showBtn.className = 'settings-btn settings-show-btn';
    showBtn.type = 'button';
    showBtn.textContent = 'Show ' + title;
    setPosition(showBtn, showPos || panelPos);

    hideBtn.addEventListener('click', function () {
      panel.classList.add('hidden');
      showBtn.style.display = 'block';
    });

    showBtn.addEventListener('click', function () {
      panel.classList.remove('hidden');
      showBtn.style.display = 'none';
    });

    Object.keys(settings).forEach(function (key) {
      const value = settings[key];
      const meta = metaMap[key] || {};
      const isSelect = meta.type === 'select';
      const isNumber = typeof value === 'number' && Number.isFinite(value);
      if (!isSelect && !isNumber) return;

      const row = document.createElement('div');
      row.className = 'settings-row';

      const left = document.createElement('div');
      const label = document.createElement('div');
      label.className = 'settings-label';
      label.textContent = humanizeKey(key);

      const controls = document.createElement('div');
      controls.className = 'settings-controls';

      const resetBtn = document.createElement('button');
      resetBtn.className = 'settings-btn';
      resetBtn.type = 'button';
      resetBtn.textContent = 'Reset';

      if (isSelect) {
        const select = document.createElement('select');
        select.className = 'settings-select';
        const options = Array.isArray(meta.options) ? meta.options : [];
        options.forEach(function (optDef) {
          const opt = document.createElement('option');
          if (optDef && typeof optDef === 'object') {
            opt.value = String(optDef.value);
            opt.textContent = String(optDef.label != null ? optDef.label : optDef.value);
          } else {
            opt.value = String(optDef);
            opt.textContent = String(optDef);
          }
          select.appendChild(opt);
        });
        select.value = String(value);

        select.addEventListener('change', function () {
          settings[key] = select.value;
        });

        resetBtn.addEventListener('click', function () {
          const original = originalSettings[key];
          settings[key] = original;
          select.value = String(original);
        });

        controls.appendChild(select);
      } else {
        const numMeta = metaMap[key] || inferMeta(value);
        const decimals = Number.isFinite(numMeta.decimals) ? numMeta.decimals : decimalsFromStep(numMeta.step);

        const slider = document.createElement('input');
        slider.className = 'settings-slider';
        slider.type = 'range';
        slider.min = String(numMeta.min);
        slider.max = String(numMeta.max);
        slider.step = String(numMeta.step);
        slider.value = String(value);

        const valueEl = document.createElement('span');
        valueEl.className = 'settings-value';
        function formatValue() {
          return Number(settings[key]).toFixed(decimals);
        }
        valueEl.textContent = formatValue();

        slider.addEventListener('input', function () {
          settings[key] = parseFloat(slider.value);
          valueEl.textContent = formatValue();
        });

        resetBtn.addEventListener('click', function () {
          const original = originalSettings[key];
          settings[key] = original;
          slider.value = String(original);
          valueEl.textContent = formatValue();
        });

        controls.appendChild(slider);
        controls.appendChild(valueEl);
      }

      left.appendChild(label);
      left.appendChild(controls);

      row.appendChild(left);
      row.appendChild(resetBtn);
      list.appendChild(row);
    });

    header.appendChild(titleEl);
    header.appendChild(hideBtn);
    panel.appendChild(header);
    panel.appendChild(list);

    const root = getUiLayerRoot();
    const host = document.createElement('div');
    host.id = id + '-layer';
    host.className = 'settings-layer-host';
    host.appendChild(panel);
    host.appendChild(showBtn);
    root.appendChild(host);
  };
})();
