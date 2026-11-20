// VICE COVER STUDIO - Main Controller

import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const state = {
  photos: [], // { id, file, img, panel, zoom, ox, oy, thumbUrl }
  layout: 'grid9',
  caption: 'LEONIDA NIGHTS',
  subtitle: 'VICE CITY • 2026',
  size: '1080x1080'
};

let nextPhotoId = 1;

export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function updateCanvas() {
  const canvas = document.getElementById('cover');
  if (!canvas) return;
  drawCover(canvas, state);
}

function renderSlots() {
  const slotsContainer = document.getElementById('slots');
  if (!slotsContainer) return;
  slotsContainer.innerHTML = '';

  if (state.photos.length === 0) {
    slotsContainer.innerHTML = '<p class="muted">No photos added yet. Upload photos or load samples below.</p>';
    return;
  }

  state.photos.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const thumb = document.createElement('img');
    thumb.src = p.thumbUrl;
    thumb.className = 'thumb';

    const controls = document.createElement('div');
    controls.className = 'card-controls';

    // Panel select
    const panelLabel = document.createElement('label');
    panelLabel.textContent = 'Panel: ';
    const select = document.createElement('select');

    let options = [];
    if (state.layout === 'grid9') {
      options = [
        { val: 0, text: 'Top-Left (Chopper)' },
        { val: 1, text: 'Top-Center (Boat)' },
        { val: 2, text: 'Top-Right (Alligator)' },
        { val: 3, text: 'Mid-Left (Bike)' },
        { val: 4, text: 'HERO (Center)' },
        { val: 5, text: 'Mid-Right (Supercar)' },
        { val: 6, text: 'Bottom-Left (Pool)' },
        { val: 7, text: 'Bottom-Center (Palms)' },
        { val: 8, text: 'Bottom-Right (City)' }
      ];
    } else {
      options = [
        { val: 'Left-top', text: 'Left Top' },
        { val: 'Left-bottom', text: 'Left Bottom' },
        { val: 'HERO', text: 'HERO Center' },
        { val: 'Right-top', text: 'Right Top' },
        { val: 'Right-bottom', text: 'Right Bottom' }
      ];
    }

    options.forEach(opt => {
      const op = document.createElement('option');
      op.value = opt.val;
      op.textContent = opt.text;
      if (String(p.panel) === String(opt.val)) op.selected = true;
      select.appendChild(op);
    });

    select.addEventListener('change', (e) => {
      p.panel = isNaN(e.target.value) ? e.target.value : Number(e.target.value);
      updateCanvas();
    });
    panelLabel.appendChild(select);
    controls.appendChild(panelLabel);

    // Zoom slider
    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom: ';
    const zoomRange = document.createElement('input');
    zoomRange.type = 'range';
    zoomRange.min = '1.0';
    zoomRange.max = '2.5';
    zoomRange.step = '0.05';
    zoomRange.value = p.zoom;
    zoomRange.addEventListener('input', (e) => {
      p.zoom = parseFloat(e.target.value);
      updateCanvas();
    });
    zoomLabel.appendChild(zoomRange);
    controls.appendChild(zoomLabel);

    // Offset X
    const oxLabel = document.createElement('label');
    oxLabel.textContent = 'Pan X: ';
    const oxRange = document.createElement('input');
    oxRange.type = 'range';
    oxRange.min = '-0.5';
    oxRange.max = '0.5';
    oxRange.step = '0.02';
    oxRange.value = p.ox;
    oxRange.addEventListener('input', (e) => {
      p.ox = parseFloat(e.target.value);
      updateCanvas();
    });
    oxLabel.appendChild(oxRange);
    controls.appendChild(oxLabel);

    // Offset Y
    const oyLabel = document.createElement('label');
    oyLabel.textContent = 'Pan Y: ';
    const oyRange = document.createElement('input');
    oyRange.type = 'range';
    oyRange.min = '-0.5';
    oyRange.max = '0.5';
    oyRange.step = '0.02';
    oyRange.value = p.oy;
    oyRange.addEventListener('input', (e) => {
      p.oy = parseFloat(e.target.value);
      updateCanvas();
    });
    oyLabel.appendChild(oyRange);
    controls.appendChild(oyLabel);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'btn-danger';
    removeBtn.addEventListener('click', () => {
      state.photos.splice(idx, 1);
      renderSlots();
      updateCanvas();
    });
    controls.appendChild(removeBtn);

    card.appendChild(thumb);
    card.appendChild(controls);
    slotsContainer.appendChild(card);
  });
}

async function handleFiles(files) {
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      state.photos.push({
        id: nextPhotoId++,
        file,
        img,
        panel: state.photos.length === 0 ? 4 : (state.photos.length % 9),
        zoom: 1.0,
        ox: 0.0,
        oy: 0.0,
        thumbUrl: url
      });
    } catch (err) {
      console.error('Failed to load image', err);
    }
  }
  renderSlots();
  updateCanvas();
}

async function init() {
  // Bind inputs
  const photosInput = document.getElementById('photos');
  if (photosInput) {
    photosInput.addEventListener('change', (e) => {
      if (e.target.files) handleFiles(e.target.files);
    });
  }

  const captionInput = document.getElementById('caption');
  if (captionInput) {
    captionInput.value = state.caption;
    captionInput.addEventListener('input', (e) => {
      state.caption = e.target.value;
      updateCanvas();
    });
  }

  const subtitleInput = document.getElementById('subtitle');
  if (subtitleInput) {
    subtitleInput.value = state.subtitle;
    subtitleInput.addEventListener('input', (e) => {
      state.subtitle = e.target.value;
      updateCanvas();
    });
  }

  // Layout buttons
  document.querySelectorAll('button[data-layout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('button[data-layout]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.layout = e.target.getAttribute('data-layout');
      renderSlots();
      updateCanvas();
    });
  });

  // Size buttons
  document.querySelectorAll('button[data-size]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('button[data-size]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.size = e.target.getAttribute('data-size');
      updateCanvas();
    });
  });

  // Sample buttons
  const btnBoulevard = document.getElementById('sample-boulevard');
  if (btnBoulevard) {
    btnBoulevard.addEventListener('click', async () => {
      try {
        const img = await loadImage('samples/boulevard.jpg');
        state.photos.push({
          id: nextPhotoId++,
          img,
          panel: 4,
          zoom: 1.1,
          ox: 0,
          oy: 0,
          thumbUrl: 'samples/boulevard.jpg'
        });
        renderSlots();
        updateCanvas();
      } catch (err) {
        console.error('Failed to load sample boulevard', err);
      }
    });
  }

  const btnPier = document.getElementById('sample-pier');
  if (btnPier) {
    btnPier.addEventListener('click', async () => {
      try {
        const img = await loadImage('samples/pier.jpg');
        state.photos.push({
          id: nextPhotoId++,
          img,
          panel: 4,
          zoom: 1.0,
          ox: 0,
          oy: 0,
          thumbUrl: 'samples/pier.jpg'
        });
        renderSlots();
        updateCanvas();
      } catch (err) {
        console.error('Failed to load sample pier', err);
      }
    });
  }

  // Export button
  const exportBtn = document.getElementById('export');
  const statusEl = document.getElementById('status');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const canvas = document.getElementById('cover');
      if (!canvas) return;

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vice-cover-${state.size}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (statusEl) {
          statusEl.textContent = `Saved vice-cover-${state.size}.png`;
        }
      }, 'image/png');
    });
  }

  // Check query params for shots
  const urlParams = new URLSearchParams(window.location.search);
  const shot = urlParams.get('shot');
  const photoParam = urlParams.get('photo');
  const captionParam = urlParams.get('caption');

  if (captionParam) {
    state.caption = captionParam;
    if (captionInput) captionInput.value = captionParam;
  }

  if (shot) {
    const loadSampleFn = async (sampleName, text) => {
      if (text) {
        state.caption = text;
        if (captionInput) captionInput.value = text;
      }
      const samplePath = `samples/${sampleName}.jpg`;
      const img = await loadImage(samplePath);
      state.photos.push({
        id: nextPhotoId++,
        img,
        panel: 4,
        zoom: 1.0,
        ox: 0,
        oy: 0,
        thumbUrl: samplePath
      });
      renderSlots();
    };

    await runShot(shot, urlParams, loadSampleFn);
  }

  // Initial draw & font readiness listener
  updateCanvas();
  renderSlots();

  if (document.fonts) {
    document.fonts.ready.then(() => {
      updateCanvas();
    });
  }
}

window.addEventListener('DOMContentLoaded', init);
