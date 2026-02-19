/// Progressive video placeholder swapping
///
/// Architecture: Maximum Decoupling
/// - Frontend listens for asset_ready events from backend
/// - Backend owns asset conversion tracking
/// - Frontend only knows: swap this element with that URL
///
/// Swaps:
/// - SVG placeholder → JPEG thumbnail (poster)
/// - Thumbnail → Playable MP4 (src)
(function() {
  // Only run in Tauri environment
  if (typeof window.__TAURI__ === 'undefined') return;

  const { listen } = window.__TAURI__.event;

  // Listen for asset ready events from backend
  listen('asset_ready', (event) => {
    const { path, asset_type } = event.payload;

    if (asset_type === 'video') {
      // Find video element by data-original-src attribute
      // This attribute is set by the generator when creating video placeholders
      const videoEl = document.querySelector(`video[data-original-src="${path}"]`);

      if (!videoEl) {
        console.warn(`[video-placeholder] Video element not found for: ${path}`);
        return;
      }

      // Determine asset URL from path
      // Path from backend is relative (e.g., "videos/demo.mp4")
      const assetUrl = `/${path}`;

      // Check file extension to determine asset type
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        // Thumbnail ready → swap poster
        videoEl.setAttribute('poster', assetUrl);
        console.log(`[video-placeholder] Poster swapped: ${assetUrl}`);
      } else if (path.endsWith('.mp4')) {
        // MP4 ready → swap src and enable playback
        videoEl.setAttribute('src', assetUrl);
        videoEl.removeAttribute('data-original-src'); // Clean up tracking attribute
        console.log(`[video-placeholder] Video src swapped: ${assetUrl}`);
      }
    }
  });
})();
