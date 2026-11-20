// VICE COVER STUDIO - Cover Painter
// Draws GTA-style multi-panel cover art onto a canvas.

export function drawCover(canvas, state) {
  const {
    photos = [],
    layout = 'grid9',
    caption = 'LEONIDA NIGHTS',
    subtitle = 'VICE CITY • 2026',
    size = '1080x1080'
  } = state;

  let [w, h] = size.split('x').map(Number);
  if (!w || !h) { w = 1080; h = 1080; }
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.save();

  // Background base
  ctx.fillStyle = '#0b0b14';
  ctx.fillRect(0, 0, w, h);

  if (layout === 'grid9') {
    drawGrid9(ctx, w, h, photos, caption, subtitle);
  } else {
    drawTrio(ctx, w, h, photos, caption, subtitle);
  }

  // Global overlay: sunset/neon grade + vignette + grain
  applyGlobalGrade(ctx, w, h);

  ctx.restore();
}

function drawGrid9(ctx, w, h, photos, caption, subtitle) {
  // 3x3 grid with thin white borders (6px) and black outer frame
  const border = 6;
  const cols = 3;
  const rows = 3;
  const totalBorderW = border * (cols + 1);
  const totalBorderH = border * (rows + 1);
  const cellW = (w - totalBorderW) / cols;
  const cellH = (h - totalBorderH) / rows;

  // Center panel (hero) is at index 4 (row 1, col 1)
  // Let's define panel rects and assignments
  // Grid mapping:
  // 0: top-left (helicopter), 1: top-center (speedboat), 2: top-right (alligator)
  // 3: mid-left (motorcycle), 4: center (HERO), 5: mid-right (supercar)
  // 6: bottom-left (poolside), 7: bottom-center (palms), 8: bottom-right (city night)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * 3 + c;
      const x = border + c * (cellW + border);
      const y = border + r * (cellH + border);

      // Hero panel is special (can span slightly or be drawn with hero scene)
      if (idx === 4) {
        drawHeroPanel(ctx, x, y, cellW, cellH, photos, caption, subtitle);
      } else {
        drawStandardPanel(ctx, x, y, cellW, cellH, idx, photos);
      }
    }
  }

  // Outer frame stroke
  ctx.lineWidth = border;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(border / 2, border / 2, w - border, h - border);
}

function drawTrio(ctx, w, h, photos, caption, subtitle) {
  // 3 vertical columns: center column is hero (taller/wider), side columns split into 2 panels each.
  const border = 6;
  const colW = (w - border * 4) / 3;

  // Left column: 2 panels
  const leftH = (h - border * 3) / 2;
  drawPanelOrPhoto(ctx, border, border, colW, leftH, 0, photos, 'Left-top');
  drawPanelOrPhoto(ctx, border, border * 2 + leftH, colW, leftH, 1, photos, 'Left-bottom');

  // Center column: Hero (full height)
  const heroX = border * 2 + colW;
  const heroW = colW;
  const heroH = h - border * 2;
  drawHeroPanel(ctx, heroX, border, heroW, heroH, photos, caption, subtitle);

  // Right column: 2 panels
  const rightX = border * 3 + colW * 2;
  drawPanelOrPhoto(ctx, rightX, border, colW, leftH, 7, photos, 'Right-top');
  drawPanelOrPhoto(ctx, rightX, border * 2 + leftH, colW, leftH, 8, photos, 'Right-bottom');

  ctx.lineWidth = border;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(border / 2, border / 2, w - border, h - border);
}

function drawStandardPanel(ctx, x, y, w, h, idx, photos) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Check if user assigned a photo to this panel index
  const assigned = photos.find(p => p.panel === idx);
  if (assigned && assigned.img) {
    drawAssignedPhoto(ctx, x, y, w, h, assigned);
  } else {
    drawMiniScene(ctx, x, y, w, h, idx);
  }

  ctx.restore();
}

function drawPanelOrPhoto(ctx, x, y, w, h, idx, photos, label) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const assigned = photos.find(p => p.panel === label || p.panel === idx);
  if (assigned && assigned.img) {
    drawAssignedPhoto(ctx, x, y, w, h, assigned);
  } else {
    drawMiniScene(ctx, x, y, w, h, idx);
  }
  ctx.restore();
}

function drawAssignedPhoto(ctx, x, y, w, h, p) {
  const img = p.img;
  const zoom = p.zoom || 1.0;
  const ox = p.ox || 0.0;
  const oy = p.oy || 0.0;

  const iw = img.width;
  const ih = img.height;
  const imgAspect = iw / ih;
  const panelAspect = w / h;

  let dw, dh;
  if (imgAspect > panelAspect) {
    dh = h * zoom;
    dw = dh * imgAspect;
  } else {
    dw = w * zoom;
    dh = dw / imgAspect;
  }

  const dx = x + (w - dw) / 2 + ox * w;
  const dy = y + (h - dh) / 2 + oy * h;

  ctx.drawImage(img, dx, dy, dw, dh);

  // Warm grade overlay on photo
  ctx.fillStyle = 'rgba(255, 120, 80, 0.12)';
  ctx.fillRect(x, y, w, h);
}

function drawHeroPanel(ctx, x, y, w, h, photos, caption, subtitle) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const assigned = photos.find(p => p.panel === 4 || p.panel === 'HERO');
  if (assigned && assigned.img) {
    drawAssignedPhoto(ctx, x, y, w, h, assigned);
  } else {
    // Painted hero scene: duo at sunset with palms and sunset gradient
    drawHeroScene(ctx, x, y, w, h);
  }

  // Draw Title Lettering across bottom band of hero panel
  drawTitleLettering(ctx, x, y, w, h, caption, subtitle);

  ctx.restore();
}

function drawHeroScene(ctx, x, y, w, h) {
  // Sunset background gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#2d1b4e');
  grad.addColorStop(0.4, '#ff477e');
  grad.addColorStop(0.8, '#ff9e3b');
  grad.addColorStop(1, '#00b4d8');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Sun disc with glow
  ctx.fillStyle = '#ffecd1';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.45, w * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Palm silhouettes on sides
  ctx.fillStyle = '#0f051d';
  // Left palm
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x + w * 0.15, y + h * 0.6, x + w * 0.05, y + h * 0.3);
  ctx.lineTo(x + w * 0.12, y + h * 0.28);
  ctx.quadraticCurveTo(x + w * 0.22, y + h * 0.55, x + w * 0.35, y + h);
  ctx.fill();

  // Duo figures silhouette in center
  ctx.fillStyle = '#090212';
  ctx.beginPath();
  // Figure 1 (leaning)
  ctx.arc(x + w * 0.42, y + h * 0.62, w * 0.05, 0, Math.PI * 2);
  ctx.rect(x + w * 0.38, y + h * 0.67, w * 0.09, h * 0.25);
  // Figure 2 (arms crossed / weapon)
  ctx.arc(x + w * 0.58, y + h * 0.60, w * 0.05, 0, Math.PI * 2);
  ctx.rect(x + w * 0.53, y + h * 0.65, w * 0.10, h * 0.27);
  ctx.fill();
}

function drawMiniScene(ctx, x, y, w, h, idx) {
  // Background gradient for mini scene
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  if (idx % 2 === 0) {
    grad.addColorStop(0, '#1b143f');
    grad.addColorStop(0.6, '#e056fd');
    grad.addColorStop(1, '#ff7675');
  } else {
    grad.addColorStop(0, '#0f2027');
    grad.addColorStop(0.5, '#203a43');
    grad.addColorStop(1, '#2c5364');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.translate(x, y);

  // Specific stylized vector art per index (0 to 8)
  switch (idx) {
    case 0: // Helicopter over skyline
      drawSkyline(ctx, w, h, '#090514');
      drawChopper(ctx, w, h);
      break;
    case 1: // Speedboat + flamingo
      drawWater(ctx, w, h);
      drawFlamingo(ctx, w, h);
      drawBoat(ctx, w, h);
      break;
    case 2: // Alligator in water
      drawWater(ctx, w, h);
      drawAlligator(ctx, w, h);
      break;
    case 3: // Motorcycle wheelie
      drawRoad(ctx, w, h);
      drawMotorcycle(ctx, w, h);
      break;
    case 5: // Yellow supercar
      drawRoad(ctx, w, h);
      drawSupercar(ctx, w, h);
      break;
    case 6: // Poolside figure with drink
      drawPoolside(ctx, w, h);
      break;
    case 7: // Palm trees at dusk
      drawSunAndPalms(ctx, w, h);
      break;
    case 8: // City skyline at night with neon
      drawSkyline(ctx, w, h, '#05020a');
      drawNeonLights(ctx, w, h);
      break;
    default:
      drawSunAndPalms(ctx, w, h);
      break;
  }

  ctx.restore();
}

// Mini vector drawing helpers
function drawSkyline(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  let cx = 0;
  while (cx < w) {
    const bw = w * (0.08 + Math.sin(cx) * 0.05);
    const bh = h * (0.3 + Math.abs(Math.sin(cx * 2)) * 0.4);
    ctx.rect(cx, h - bh, bw, bh);
    cx += bw + w * 0.02;
  }
  ctx.fill();
}

function drawChopper(ctx, w, h) {
  ctx.fillStyle = '#ffea79';
  // Body ellipse
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.35, w * 0.18, h * 0.08, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Tail boom
  ctx.beginPath();
  ctx.moveTo(w * 0.65, h * 0.33);
  ctx.lineTo(w * 0.88, h * 0.30);
  ctx.lineTo(w * 0.88, h * 0.35);
  ctx.lineTo(w * 0.65, h * 0.37);
  ctx.closePath();
  ctx.fill();
  // Tail rotor
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.86, h * 0.26);
  ctx.lineTo(w * 0.90, h * 0.34);
  ctx.moveTo(w * 0.86, h * 0.34);
  ctx.lineTo(w * 0.90, h * 0.26);
  ctx.stroke();
  // Skids
  ctx.strokeStyle = '#ffea79';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.46);
  ctx.lineTo(w * 0.62, h * 0.46);
  ctx.moveTo(w * 0.42, h * 0.42);
  ctx.lineTo(w * 0.40, h * 0.46);
  ctx.moveTo(w * 0.58, h * 0.42);
  ctx.lineTo(w * 0.60, h * 0.46);
  ctx.stroke();
  // Main rotor
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.22);
  ctx.lineTo(w * 0.8, h * 0.28);
  ctx.stroke();
}

function drawWater(ctx, w, h) {
  ctx.fillStyle = '#0a2342';
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
  ctx.strokeStyle = '#48cae4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const wy = h * (0.6 + i * 0.1);
    ctx.moveTo(w * 0.1, wy);
    ctx.quadraticCurveTo(w * 0.5, wy + 8, w * 0.9, wy);
  }
  ctx.stroke();
}

function drawFlamingo(ctx, w, h) {
  // Body
  ctx.fillStyle = '#ff70a6';
  ctx.beginPath();
  ctx.ellipse(w * 0.62, h * 0.45, w * 0.10, h * 0.07, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // S-curved neck (bezier)
  ctx.strokeStyle = '#ff70a6';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.45);
  ctx.bezierCurveTo(w * 0.45, h * 0.35, w * 0.52, h * 0.20, w * 0.48, h * 0.15);
  ctx.stroke();
  // Beak triangle
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(w * 0.48, h * 0.15);
  ctx.lineTo(w * 0.43, h * 0.17);
  ctx.lineTo(w * 0.47, h * 0.19);
  ctx.closePath();
  ctx.fill();
  // Legs (two thin straight lines)
  ctx.strokeStyle = '#ff70a6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.60, h * 0.52);
  ctx.lineTo(w * 0.58, h * 0.85);
  ctx.moveTo(w * 0.64, h * 0.52);
  ctx.lineTo(w * 0.66, h * 0.85);
  ctx.stroke();
}

function drawBoat(ctx, w, h) {
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.75);
  ctx.lineTo(w * 0.8, h * 0.72);
  ctx.lineTo(w * 0.7, h * 0.85);
  ctx.lineTo(w * 0.25, h * 0.85);
  ctx.closePath();
  ctx.fill();
  // Wake
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.85);
  ctx.lineTo(w * 0.05, h * 0.92);
  ctx.stroke();
}

function drawAlligator(ctx, w, h) {
  ctx.fillStyle = '#2b9348';
  // Body
  ctx.beginPath();
  ctx.ellipse(w * 0.45, h * 0.68, w * 0.28, h * 0.10, 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Elongated snout
  ctx.beginPath();
  ctx.moveTo(w * 0.70, h * 0.62);
  ctx.lineTo(w * 0.92, h * 0.66);
  ctx.lineTo(w * 0.92, h * 0.72);
  ctx.lineTo(w * 0.70, h * 0.74);
  ctx.closePath();
  ctx.fill();
  // Eye bumps on top
  ctx.fillStyle = '#1e5631';
  ctx.beginPath();
  ctx.arc(w * 0.68, h * 0.61, w * 0.03, 0, Math.PI * 2);
  ctx.arc(w * 0.72, h * 0.61, w * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Back ridge triangles
  ctx.fillStyle = '#1e5631';
  for (let i = 0; i < 5; i++) {
    const bx = w * (0.25 + i * 0.08);
    ctx.beginPath();
    ctx.moveTo(bx, h * 0.58);
    ctx.lineTo(bx + w * 0.03, h * 0.53);
    ctx.lineTo(bx + w * 0.06, h * 0.58);
    ctx.closePath();
    ctx.fill();
  }
  // Tapered tail
  ctx.fillStyle = '#2b9348';
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.65);
  ctx.lineTo(w * 0.02, h * 0.60);
  ctx.lineTo(w * 0.18, h * 0.75);
  ctx.closePath();
  ctx.fill();
}

function drawRoad(ctx, w, h) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(w * 0.48, h * 0.5, w * 0.04, h * 0.5);
}

function drawMotorcycle(ctx, w, h) {
  // Wheels with spokes
  for (const cx of [w * 0.32, w * 0.72]) {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx, h * 0.75, w * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, h * 0.75, w * 0.09, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.09, h * 0.75);
    ctx.lineTo(cx + w * 0.09, h * 0.75);
    ctx.moveTo(cx, h * 0.75 - w * 0.09);
    ctx.lineTo(cx, h * 0.75 + w * 0.09);
    ctx.stroke();
  }
  // Frame lines connecting them
  ctx.strokeStyle = '#ff0054';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.32, h * 0.75);
  ctx.lineTo(w * 0.5, h * 0.55);
  ctx.lineTo(w * 0.72, h * 0.75);
  ctx.moveTo(w * 0.5, h * 0.55);
  ctx.lineTo(w * 0.45, h * 0.75);
  ctx.stroke();
  // Simple rider silhouette leaning forward
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(w * 0.48, h * 0.42, w * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.55);
  ctx.lineTo(w * 0.55, h * 0.48);
  ctx.lineTo(w * 0.48, h * 0.70);
  ctx.closePath();
  ctx.fill();
}

function drawSupercar(ctx, w, h) {
  // Lower wedge body
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.76);
  ctx.lineTo(w * 0.88, h * 0.76);
  ctx.lineTo(w * 0.78, h * 0.56);
  ctx.lineTo(w * 0.35, h * 0.54);
  ctx.closePath();
  ctx.fill();
  // Cabin with side window
  ctx.fillStyle = '#1e1e24';
  ctx.beginPath();
  ctx.moveTo(w * 0.40, h * 0.54);
  ctx.lineTo(w * 0.50, h * 0.42);
  ctx.lineTo(w * 0.68, h * 0.42);
  ctx.lineTo(w * 0.72, h * 0.54);
  ctx.closePath();
  ctx.fill();
  // Scissor-door line
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.50, h * 0.54);
  ctx.lineTo(w * 0.55, h * 0.42);
  ctx.stroke();
  // Two wheels with hub circles
  for (const cx of [w * 0.28, w * 0.72]) {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx, h * 0.76, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, h * 0.76, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPoolside(ctx, w, h) {
  ctx.fillStyle = '#48cae4';
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
  // Lounger & figure
  ctx.fillStyle = '#f72585';
  ctx.fillRect(w * 0.2, h * 0.45, w * 0.5, h * 0.12);
  ctx.fillStyle = '#ffe5ec';
  ctx.beginPath();
  ctx.arc(w * 0.4, h * 0.42, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawSunAndPalms(ctx, w, h) {
  ctx.fillStyle = '#ff70a6';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.4, w * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0b0b14';
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h);
  ctx.quadraticCurveTo(w * 0.3, h * 0.5, w * 0.25, 0);
  ctx.lineTo(w * 0.35, 0);
  ctx.quadraticCurveTo(w * 0.4, h * 0.5, w * 0.35, h);
  ctx.fill();
}

function drawNeonLights(ctx, w, h) {
  ctx.strokeStyle = '#00f5d4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.3);
  ctx.lineTo(w * 0.8, h * 0.3);
  ctx.moveTo(w * 0.3, h * 0.5);
  ctx.lineTo(w * 0.7, h * 0.5);
  ctx.stroke();
}

function drawTitleLettering(ctx, x, y, w, h, caption, subtitle) {
  ctx.save();
  ctx.translate(x + w / 2, y + h * 0.82);
  ctx.rotate((-2 * Math.PI) / 180); // Slight tilt

  const fontSize = Math.max(28, Math.floor(w * 0.09));
  ctx.font = `900 ${fontSize}px "Anton", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Hard shadow + fill white + magenta stroke
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(caption.toUpperCase(), 0, 0);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ff2e88';
  ctx.strokeText(caption.toUpperCase(), 0, 0);

  // Subtitle
  const subSize = Math.max(12, Math.floor(fontSize * 0.38));
  ctx.font = `700 ${subSize}px "Anton", sans-serif`;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#48cae4';
  ctx.fillText(subtitle.toUpperCase(), 0, fontSize * 0.75);

  ctx.restore();
}

function applyGlobalGrade(ctx, w, h) {
  // Sunset vertical gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255, 71, 126, 0.0)');
  grad.addColorStop(0.5, 'rgba(255, 71, 126, 0.15)');
  grad.addColorStop(1, 'rgba(255, 158, 59, 0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Vignette
  const radial = ctx.createRadialGradient(w / 2, h / 2, w * 0.4, w / 2, h / 2, w * 0.8);
  radial.addColorStop(0, 'rgba(0,0,0,0)');
  radial.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, w, h);

  // Subtle grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 3000; i++) {
    const gx = (Math.sin(i * 99) * 10000) % w;
    const gy = (Math.cos(i * 33) * 10000) % h;
    ctx.fillRect(Math.abs(gx), Math.abs(gy), 1, 1);
  }
}
