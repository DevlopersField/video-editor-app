# Reel Studio Video Editor

Professional, privacy-first real estate and social video editor that runs 100% inside your browser. No account, no cloud uploads, no external AI API keys. Your photos, videos, voiceover, and brand assets never leave your computer.

---

## 🚀 Quick Start (2 Steps)

1. **Download or Clone the Folder:**
   - Click **Code** → **Download ZIP** and unzip, or:
   ```bash
   git clone <repo-url>
   ```
2. **Open in Browser:**
   - Double-click `index.html` (or drag into **Google Chrome** or **Microsoft Edge**).
   - No build step (`npm`), no server, and no setup required.

> **Browser Note:** Chrome or Edge is recommended for hardware-accelerated WebCodecs MP4 60fps export and local File System Access.

---

## 🌟 Flagship Features

### 1. 📍 Plot & Land Highlights with 3D Location Markers
- **Multi-Point Polygon Boundary:** Click to outline plots, boundaries, agricultural land, or building perimeters directly on photos or drone footage. Drag corner points to adjust.
- **Custom Line & Fill Color Pickers:** Fine-tune the border perimeter color (`lineHex`) and interior translucent fill (`fillHex`, opacity slider) with live hex pickers and preset swatches.
- **📍 3D Floating Location Pin & Marker:**
  - 3D perspective needle stalk rising from the ground to a floating marker.
  - Realistic ground contact shadow and glowing beacon ring.
  - Marker styles:
    - 📍 **3D Location Pin** (Google/Apple Maps style teardrop)
    - 🏠 **Villa / House**
    - 🏢 **Commercial Building**
    - 🌾 **Land / Agricultural Plot**
    - ⭐ **Star Highlight**
    - 🖼️ **Custom Logo / PNG Badge** (upload your agency logo)
  - Floating hover motion (sine-wave bobbing) and elevation slider.
  - Dedicated **📍 Plots & 3D Markers** left sidebar panel and preview stage toolbar for immediate access while editing.
- **Road Corridor Highlight:** Mark access roads with frontage width, centerline striping, directional traffic arrows, and street name pills.
- **Spotlight & Darken Rest:** Dims video outside the plot outline with smooth fade-in so the property commands full viewer focus.

---

### 2. 🎯 Adobe Mask Tracker (Computer Vision)
- **100% Client-Side Optical Flow:** Tracks plot outlines and 3D pins across moving drone, aerial, and handheld camera footage using local Lucas-Kanade feature tracking and 2D homography estimation.
- **Camera Tracking Modes:**
  - `▶▶ Track Entire Video`: Locks the boundary to the terrain across the whole shot.
  - `Orbit (360° Drone)`: Mathematical rotational tracking for circular drone fly-arounds.
  - `Fixed to Screen (HUD)`: Pins the overlay to the camera lens viewport.
- **Zero Cloud / Zero AI API:** Runs entirely on your CPU/GPU in JavaScript with complete data privacy.

---

### 3. ✨ Glassmorphism & Frosted Acrylic Captions
- **Modern Frosted Glass Engine:**
  - Translucent frosted glass backdrops (`bgOpacity` 0.25–0.55) that let underlying video motion shine through.
  - Specular reflection sheen across the upper surface.
  - Luminous rim light border (`1.5px`) with corner light catches.
  - Floating ambient drop shadow for depth separation.
- **Versatile Shapes:** Works for **One Box**, **Box per Line**, or **Word Pills**.
- **Pro Presets:**
  - 💎 **Frosted Crystal:** Translucent acrylic with crisp white rim and vibrant yellow highlight.
  - 🌌 **Liquid Dark Glass:** Smoked obsidian glass with luminous edge and mint/cyan pop.
  - ⚡ **Cyber Neon Glass:** Line-by-line translucent glass with cyber neon rim and magenta pop.
  - 🌿 **Aurora Frosted Pill:** Emerald-tinted glass pills with glowing border.
  - 👑 **Luxury Gold Glass:** Editorial serif on warm bronze smoked glass with gold highlights.
  - 🫧 **Glass Pop:** Floating frosted glass badge springing under each spoken word.

---

### 4. 🛰️ Adobe After Effects Drone Telemetry HUD (MOGRT)
- **Aviation & Drone HUD Overlay:**
  - **Live GPS Telemetry:** Real-time coordinates (`LAT: 30°19'N  LON: 78°02'E`) and satellite lock count.
  - **Altitude Meter:** Dynamic vertical altitude gauge (`ALT: 125.4m`) moving with shot altitude.
  - **Speed Indicator:** Live velocity readout (`SPD: 28.5km/h`).
  - **Compass Heading Ribbon:** Dynamic 360° aircraft compass heading (`▲ 042° NE`).
  - **Gimbal Horizon & Reticle:** Center artificial horizon pitch lines and corner reticle brackets.
  - **Camera Status:** REC indicator with blinking red dot, 4K 60FPS, ISO 100, 1/120s shutter speed, and D-Log profile telemetry.

---

### 5. 🔍 Adobe Premiere Pro Text-Based Editing & Script Search
- **Instant Transcript Search:** Search bar inside the Captions panel filters and highlights words across your entire video script in real-time.
- **1-Click Timeline Jump:** Click any found keyword to jump the playhead directly to that spoken phrase, select the caption, and preview it on the canvas.
- **Match Count Indicator:** Displays instant match tallies (e.g. `3 matches found`).

---

### 6. 🎬 Adobe Premiere Pro Cinemascope (2.39:1 Letterbox)
- **Cinematic Anamorphic Matte:** Toggles authentic 2.39:1 Hollywood widescreen black letterbox bars at the top and bottom with a delicate luminous rim line.

---

### 7. 🎙️ Studio Voiceover & Offline DSP Audio Engine
- **Hardware-Free DSP Noise Cancellation:** Eliminates AC hum, fan noise, desk thumps, and room hiss offline using digital biquad notch and high-pass filters.
- **Voice Studio FX:** Real-time parametric warmth, clarity, air, pitch shifting, and compression.
- **⚡ Smart Dead-Air / Silence Auto-Cut:** Automatically detects and trims pauses longer than 0.35s to create punchy, fast-paced Reels and TikToks.
- **Multi-Track Audio:** Voiceover, clip audio, background music with automatic speech ducking, and a built-in sound effects library (whooshes, pops, risers, camera clicks).

---

### 8. ✂️ AI Background Remover Pro (`bg-remover.html`)
Professional on-device AI background remover running 100% locally in your browser with zero cloud uploads and zero external API keys.

- **⚡ Pro AI Neural Engine (`@imgly/background-removal`):**
  - Industry-standard deep learning subject segmentation (ISNet / ONNX WebAssembly).
  - Isolates people, portraits, real estate, vehicles, and products with hair-level edge precision.
  - One-time model download (~40 MB) cached in the browser for instant, offline repeat use.
- **📁 Single & Batch Queue Processing:**
  - Drop or browse multiple photos at once; processes the entire queue automatically.
  - Interactive queue bar with live thumbnail statuses (`queued`, `working`, `done`, `error`) and single-click removal.
  - Download individual cutouts or **Download All (Batch)** at once.
- **🔍 Interactive Before / After Split Slider:**
  - Responsive comparison curtain slider comparing the original photo against the cutout in real time.
  - Stage zoom controls (`+`, `-`, `Fit`, percentage indicator).
- **🎨 Backdrop Preview Modes:**
  - 🏁 Transparent checkerboard.
  - ⚪ Solid white.
  - ⚫ Solid black.
  - 🌫️ **Blurred Original Background:** DSLR-style cinematic portrait bokeh blur behind the subject.
  - 🎨 Custom color picker.
- **✨ Real-Time Edge Refinement:**
  - **Feather Slider (0–8px):** Softens and blends alpha edges.
  - **Expand / Shrink Slider (-6px to +6px):** Grows or tightens the cutout mask using GPU canvas compositing to eliminate halos or recover fine details.
- **💾 On-Device AI Storage Management:**
  - Built-in storage auditor showing HTTP cache entries with one-click app storage cleanup.
- **📥 Multi-Format Export & App Integrations:**
  - Export full-resolution transparent **PNG**, high-efficiency **WebP**, or flat **JPG**.
  - 📋 **Copy transparent PNG** directly to system clipboard.
  - 📲 **Send to Post Editor** or 🎬 **Send to Video Editor** as an image overlay sticker.

---

### 9. 📊 Reel Progress Bar & Dynamic Audiograms
- **Veed-Style Progress Bar:** Top, bottom, left, or right glowing progress bar tracking reel duration.
- **Dynamic Audiogram Waveform:** Reactive animated voice waveforms (bars, wave, or dots) synchronized to voiceover playback.

---

## 🛠️ File Structure

| File | Purpose |
|---|---|
| `bg-remover.html` | AI Background Remover Pro: batch processing, before/after slider, edge polish, multi-format export |
| `video.html` | Core video editor: timeline, canvas rendering, plot tools, captions, export |
| `index.html` | App shell, brand kit manager, and project launcher |
| `post.html` | Social post and flyer image editor |
| `caption-presets.js` | Pro caption presets and Glassmorphism styles |
| `mask-tracker.js` | Optical Flow Lucas-Kanade 2D homography mask tracker |
| `brand.js` | Brand kits, logos, color palettes, and typography presets |
| `rs-store.js` | Offline storage (IndexedDB, File System Access API), Google Fonts cache |
| `js/` | Self-hosted offline JavaScript dependencies (zero CDNs) |

---

## 🔒 Privacy & Architecture Guarantees
- **No Cloud Processing:** All rendering, tracking, audio DSP, and video encoding run on your local machine.
- **No External CDN Scripts:** All JavaScript libraries are self-hosted locally in the `js/` folder.
- **Zero AI API Keys:** No OpenAI, Google Gemini, or third-party cloud API keys required.
