// VICE COVER STUDIO - Screenshot Driver

export async function runShot(shot, query, load) {
  const photoParam = query.get('photo');
  const captionParam = query.get('caption');

  let sample = 'pier';
  let caption = captionParam || 'LEONIDA NIGHTS';

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    sample = photoParam || 'pier';
    caption = captionParam || 'LEONIDA NIGHTS';
  } else if (shot === 'editor') {
    sample = photoParam || 'boulevard';
    caption = captionParam || 'LEONIDA NIGHTS';
  } else if (shot === 'export') {
    document.body.classList.add('shot-cover');
    sample = photoParam || 'boulevard';
    caption = captionParam || 'VICE CITY HEIST';
  }

  await load(sample, caption);

  // Signal ready for screenshot capture across next two animation frames
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
