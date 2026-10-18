# Reel Studio

Make social posts and short videos for your brand, right in the browser. No account, no upload, no install. Your photos and videos never leave your computer.

## Download and open (2 steps)

1. **Get the folder**
   - From GitHub: click **Code**, then **Download ZIP**, and unzip it.
   - Or with git: `git clone <repo-url>`
2. **Open `index.html` in Chrome or Edge** (double-click it, or drag it into the browser).

That's it. No build step and no server needed. Works on Mac and Windows.

> Use Chrome or Edge. Safari and Firefox work for editing, but they cannot save into a folder or export the fast MP4.

## First run

1. **Add your brand.** Name, logo, colours, fonts and contact details. They fill every template automatically.
2. **Choose a save folder.** Click **Choose save folder** in Brand settings and pick a folder you made, for example `Documents/Reel Studio`. Do not pick a whole drive or your user folder; Chrome blocks those.

## Quick guide

| I want to | Do this |
|---|---|
| Make a video | **Video editor**, then choose a start option or drop in photos and clips |
| Add captions | Record a voiceover with auto captions on, or **Captions**, then **Add at playhead** |
| Style captions | Pick a **Pro preset** (try Editorial), or **Custom** to open the style panel on the right |
| Reuse a caption style | In the style panel, **Save as style**. It shows under **My styles** |
| Move or resize anything | Click it on the preview, drag it, then use the corner handle, mouse wheel or pinch |
| Add text | Double-click the preview, or **Add text** at the top |
| Copy, cut, paste | Cmd/Ctrl + C, X, V |
| Check the result | **Preview** at the top, then **Export MP4** or **Save project** |
| Save | Cmd/Ctrl + S. Work also autosaves, and older versions are kept |
| Open a project | **Open project** (right panel). Filter by category |
| Use your own font | Any font picker, then **Upload a font file**, or type any Google Font name |
| Switch theme | Top bar icons: System, Light, Dark |

## Where things are saved

```
Reel Studio/              the save folder you chose
  brands/                 one .json file per brand
  caption-styles/         your saved caption styles
  fonts/                  fonts you uploaded
  projects/<name>/        project.json, media/, versions/
  exports/<category>/     finished MP4s and PNG frames
```

To move to another computer, copy this folder, open Reel Studio there, and choose it.
Without a save folder, everything stays in the browser, and **Download file** gives you a `.girika` project file.

## Troubleshooting

- **"Reconnect folder" after a restart:** click it once. Chrome asks again for safety.
- **A font shows as a plain font:** you are offline, or the name is misspelled. Check it on fonts.google.com.
- **Auto captions do nothing:** they need Chrome and an internet connection.
- **Lost work after closing the tab:** reopen the video editor and click **Restore**.

---

## For contributors

Plain HTML, CSS and JavaScript. No framework, no build, no dependencies to install.

### Files

| File | What it does |
|---|---|
| `index.html` | Home, brand settings, brand setup. Hosts the two editors in frames |
| `post.html` | Post editor (images and short post videos) |
| `video.html` | Video editor: timeline, captions, preview editing, export, projects |
| `brand.js` | Brand kits (`window.GIRIKA`): palette, fonts, logo drawing, text auto-fill |
| `rs-store.js` | Shared layer (`window.RS`): save folder, IndexedDB, collections, Google Fonts picker, theme |
| `caption-presets.js` | The Pro caption presets. Add a look here, no other file needs to change |
| `packs.js` | Industry template packs |

Load order on every page: `rs-store.js`, then `brand.js`, then the page script.

### Working on it

1. Open the page in Chrome with DevTools open. Reload after each change.
2. Keep the preview and the export identical: anything drawn goes through the canvas renderers (`renderFrame`), and editor-only UI checks `exporting`.
3. Save new user data through `RS.collection(...)` or `RS.fs`, never only in `localStorage`.
4. Test both themes and the **Simple** and **Pro** modes before you open a pull request.

### Style rules

- UI text: short, plain, sentence case. No em dashes, no emojis.
- UI colours come from CSS tokens (`--bg`, `--surface`, `--text`, `--accent`). Brand colours belong only inside the preview.
- No new libraries unless there is no simple way without one.

### Pull requests

One feature or fix per pull request. Say what changed, how you tested it, and add a screenshot for UI changes.
