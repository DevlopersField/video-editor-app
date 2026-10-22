/*
  Reel Studio storage + fonts.
  Load this BEFORE brand.js on every page.

  window.RS.fs          Save folder on this computer (File System Access API, Chrome / Edge).
                        Layout:  <folder>/brands/*.json
                                 <folder>/caption-styles/*.json
                                 <folder>/projects/<project>/project.json + media/
  window.RS.idb         Tiny IndexedDB key/value store (handles, autosave, recovery).
  window.RS.collection  A named list of JSON items kept in localStorage (fast, sync)
                        and mirrored to one file per item in the save folder.
  window.RS.fonts       Google Fonts loader + searchable font picker.

  Browsers without folder access (Safari, Firefox) keep everything in browser storage,
  and Export / Import files still work.
*/
window.RS = (function(){
  "use strict";
  const slug = s => String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
  const uid = p => (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const emitter = () => { const fns = new Set(); return { on:f => (fns.add(f), () => fns.delete(f)), emit:(...a) => fns.forEach(f => { try { f(...a); } catch(e) { console.error(e); } }) }; };

  /* ---------------- IndexedDB key/value ---------------- */
  const idb = (function(){
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      if (!("indexedDB" in window)) return rej(new Error("no indexedDB"));
      const r = indexedDB.open("reelstudio", 1);
      r.onupgradeneeded = () => { r.result.createObjectStore("kv"); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction("kv", mode), s = t.objectStore("kv"), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
    return {
      get:k => tx("readonly", s => s.get(k)).catch(() => undefined),
      set:(k, v) => tx("readwrite", s => s.put(v, k)),
      del:k => tx("readwrite", s => s.delete(k)).catch(() => {}),
      keys:() => tx("readonly", s => s.getAllKeys()).catch(() => [])
    };
  })();

  /* ---------------- save folder ---------------- */
  const fs = (function(){
    const inSubframe = (function(){
      try { return window.self !== window.top; } catch(e) { return true; }
    })();

    const isRestrictedFrame = (function(){
      if (!inSubframe) return false;
      try {
        if (!window.top || !window.top.location) return true;
        if (window.location.protocol === "file:" || window.location.origin === "null") return true;
        if (window.top.location.origin !== window.location.origin) return true;
      } catch(e) {
        return true;
      }
      return false;
    })();

    let supported = typeof window.showDirectoryPicker === "function" && !isRestrictedFrame;
    const DIRS = ["brands", "caption-styles", "projects", "exports", "fonts"];
    const ev = emitter();
    let root = null, state = supported ? "none" : "unsupported";
    const set = s => { if (s !== state){ state = s; ev.emit(state); } };

    async function init(){
      if (!supported) return state;
      try {
        const h = await idb.get("rootDir"); if (!h) { set("none"); return state; }
        root = h;
        let p;
        try {
          p = await h.queryPermission({ mode:"readwrite" });
        } catch(err) {
          if (err && (err.name === "SecurityError" || /cross[- ]origin|sub[- ]?frame|not allowed/i.test(err.message || ""))) {
            supported = false; set("unsupported"); return state;
          }
          throw err;
        }
        set(p === "granted" ? "ready" : "needs-permission");
      } catch(e) { set("none"); }
      return state;
    }
    const ready = init();

    async function ensureLayout(){
      for (const d of DIRS) await root.getDirectoryHandle(d, { create:true });
      try { await root.getFileHandle("README.txt"); }
      catch(e){ await writeText("README.txt", "Reel Studio save folder.\n\nbrands/          one file per brand kit\nfonts/           font files you uploaded\ncaption-styles/  your saved caption styles\nprojects/        video projects (project.json + media)\nexports/         finished videos and frames, one folder per category\n\nCopy this folder to move everything to another computer, then choose it in Reel Studio.\n"); }
    }
    /* must be called from a click */
    async function connect(){
      if (!supported) throw new Error(inSubframe ? "Folder saving is not supported in an embedded frame. Saved in browser storage." : "This browser cannot save to a folder. Use Chrome or Edge.");
      let h;
      try {
        h = await window.showDirectoryPicker({ id:"reelstudio", mode:"readwrite", startIn:"documents" });
      } catch(err) {
        if (err && (err.name === "SecurityError" || /cross[- ]origin|sub[- ]?frame|not allowed to show/i.test(err.message || ""))) {
          supported = false; set("unsupported");
          throw new Error("Folder saving is not allowed inside an embedded view. Everything is safely saved in this browser.");
        }
        throw err;
      }
      try {
        if ((await h.requestPermission({ mode:"readwrite" })) !== "granted") throw new Error("Permission was not given.");
      } catch(err) {
        if (err && (err.name === "SecurityError" || /cross[- ]origin|sub[- ]?frame|not allowed to show/i.test(err.message || ""))) {
          supported = false; set("unsupported");
          throw new Error("Folder permission is not allowed inside an embedded view. Everything is safely saved in this browser.");
        }
        throw err;
      }
      root = h; await idb.set("rootDir", h); set("ready"); await ensureLayout(); return h.name;
    }
    /* must be called from a click */
    async function reconnect(){
      if (!root) return connect();
      try {
        const p = await root.requestPermission({ mode:"readwrite" });
        if (p === "granted"){ set("ready"); await ensureLayout(); return true; }
      } catch(err) {
        if (err && (err.name === "SecurityError" || /cross[- ]origin|sub[- ]?frame|not allowed to show/i.test(err.message || ""))) {
          supported = false; set("unsupported"); return false;
        }
        throw err;
      }
      return false;
    }
    async function disconnect(){ root = null; await idb.del("rootDir"); set(supported ? "none" : "unsupported"); }

    const parts = p => String(p).split("/").filter(Boolean);
    async function dirOf(path, create){
      if (state !== "ready" || !root) throw new Error("Save folder is not connected.");
      let d = root; for (const n of parts(path)) d = await d.getDirectoryHandle(n, { create:!!create }); return d;
    }
    async function fileHandle(path, create){ const ps = parts(path), name = ps.pop(); const d = await dirOf(ps.join("/"), create); return d.getFileHandle(name, { create:!!create }); }
    async function writeBlob(path, data){
      const h = await fileHandle(path, true), w = await h.createWritable();
      try { await w.write(data); await w.close(); } catch(e){ try { await w.abort(); } catch(_) {} throw e; }
      return true;
    }
    const writeText = (path, s) => writeBlob(path, new Blob([s], { type:"text/plain" }));
    const writeJSON = (path, o) => writeBlob(path, new Blob([JSON.stringify(o, null, 1)], { type:"application/json" }));
    async function readFile(path){ return (await fileHandle(path, false)).getFile(); }
    async function readText(path){ return (await readFile(path)).text(); }
    async function readJSON(path){ try { return JSON.parse(await readText(path)); } catch(e){ return null; } }
    async function exists(path){ try { await fileHandle(path, false); return true; } catch(e){ try { await dirOf(path, false); return true; } catch(_){ return false; } } }
    async function list(path){
      const out = []; let d; try { d = await dirOf(path, false); } catch(e){ return out; }
      for await (const [name, h] of d.entries()) out.push({ name, kind:h.kind, handle:h });
      return out.sort((a, b) => a.name.localeCompare(b.name));
    }
    async function remove(path, recursive){ const ps = parts(path), name = ps.pop(); const d = await dirOf(ps.join("/"), false); await d.removeEntry(name, { recursive:!!recursive }); }

    /* small reusable control: shows where things are saved, connects the folder */
    function badge(host, opts){
      opts = opts || {};
      const wrap = document.createElement("span"); wrap.className = "rs-folder";
      const b = document.createElement("button"); b.type = "button"; b.className = opts.className || "btn sm";
      const note = document.createElement("small"); note.className = "rs-folder-note";
      wrap.append(b, note);
      const paint = () => {
        const n = root ? root.name : "";
        if (state === "unsupported"){
          b.hidden = true;
          note.textContent = inSubframe
            ? "Saved in this browser. To save into a computer folder, open this editor in its own tab."
            : "Saved in this browser. Use Chrome or Edge to save into a folder.";
        }
        else if (state === "none"){ b.hidden = false; b.textContent = "Choose save folder"; note.textContent = "Brands, caption styles and projects save into a folder you pick."; }
        else if (state === "needs-permission"){ b.hidden = false; b.textContent = "Reconnect folder"; note.textContent = `"${n}" needs your OK again after a restart.`; }
        else { b.hidden = false; b.textContent = "Change folder"; note.textContent = `Saving to folder "${n}".`; }
      };
      b.addEventListener("click", async () => {
        try { if (state === "needs-permission") await reconnect(); else await connect(); opts.onChange && opts.onChange(state); }
        catch(e){ if (e && e.name !== "AbortError") { note.textContent = e.message || "Could not open that folder."; } }
      });
      ev.on(paint); ready.then(paint); paint();
      if (host) host.appendChild(wrap);
      return wrap;
    }

    return { get supported(){ return supported; }, ready, get state(){ return state; }, get name(){ return root ? root.name : ""; }, onChange:ev.on,
      connect, reconnect, disconnect, dirOf, writeBlob, writeText, writeJSON, readFile, readText, readJSON, exists, list, remove, badge };
  })();

  /* ---------------- collections: localStorage cache + one file per item ----------------
     item: { id, name, updated, ...anything }
     opts.slim(item)      -> lighter copy for the cache when browser storage is full
     opts.keepFull(item)  -> true to never slim this item (e.g. the active brand)        */
  function collection(dir, lsKey, opts){
    opts = opts || {};
    const ev = emitter(), TOMB = lsKey + "::deleted";
    const read = () => { try { const a = JSON.parse(localStorage.getItem(lsKey) || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } };
    const tombs = () => { try { return JSON.parse(localStorage.getItem(TOMB) || "[]"); } catch(e){ return []; } };
    const setTombs = a => { try { localStorage.setItem(TOMB, JSON.stringify([...new Set(a)].slice(-500))); } catch(e) {} };
    function writeCache(arr){
      try { localStorage.setItem(lsKey, JSON.stringify(arr)); return true; } catch(e) {}
      if (!opts.slim) return false;
      try { localStorage.setItem(lsKey, JSON.stringify(arr.map(x => opts.keepFull && opts.keepFull(x) ? x : { ...opts.slim(x), _slim:true }))); return true; } catch(e){ return false; }
    }
    const file = id => `${dir}/${slug(id)}.json`;
    const list = () => read();
    const get = id => read().find(x => x.id === id) || null;
    /* full copy (cache may hold a slim one) */
    async function full(id){
      const c = get(id); if (c && !c._slim) return c;
      if (fs.state === "ready"){ const f = await fs.readJSON(file(id)); if (f) return f; }
      return c;
    }
    async function save(item){
      item = { ...item }; if (!item.id) item.id = uid(opts.prefix || "i"); item.updated = Date.now(); delete item._slim;
      let toFolder = false, toCache;
      if (fs.state === "ready"){ try { await fs.writeJSON(file(item.id), item); toFolder = true; } catch(e){ console.warn("folder save failed", e); } }
      const arr = read().filter(x => x.id !== item.id); arr.push(item); toCache = writeCache(arr);
      setTombs(tombs().filter(t => t !== item.id));
      if (!toFolder && !toCache) throw new Error("Could not save: browser storage is full. Choose a save folder, or delete old items.");
      ev.emit("save", item); return item;
    }
    async function remove(id){
      writeCache(read().filter(x => x.id !== id));
      if (fs.state === "ready"){ try { await fs.remove(file(id)); } catch(e) {} } else setTombs([...tombs(), id]);
      ev.emit("remove", id);
    }
    /* folder -> cache (folder wins on newer `updated`), cache-only items -> folder, tombstones applied.
       Resolves to true when the cache changed. */
    async function sync(){
      await fs.ready; if (fs.state !== "ready") return false;
      const local = read(), byId = new Map(local.map(x => [x.id, x])), seen = new Set(); let changed = false;
      for (const t of tombs()){ try { await fs.remove(file(t)); } catch(e) {} byId.delete(t); }
      setTombs([]);
      for (const f of await fs.list(dir)){
        if (f.kind !== "file" || !f.name.endsWith(".json")) continue;
        let it; try { it = JSON.parse(await (await f.handle.getFile()).text()); } catch(e){ continue; }
        if (!it || !it.id) continue; seen.add(it.id);
        const mine = byId.get(it.id);
        if (!mine || mine._slim || (it.updated || 0) > (mine.updated || 0)){ if (!mine || JSON.stringify(mine) !== JSON.stringify(it)) changed = true; byId.set(it.id, it); }
        else if ((mine.updated || 0) > (it.updated || 0)){ try { await fs.writeJSON(file(mine.id), mine); } catch(e) {} }
      }
      for (const [id, it] of byId){ if (!seen.has(id) && !it._slim){ try { await fs.writeJSON(file(id), it); } catch(e) {} } }
      if (changed){ writeCache([...byId.values()]); ev.emit("sync"); }
      return changed;
    }
    return { list, get, full, save, remove, sync, file, onChange:ev.on };
  }

  /* ---------------- Google Fonts ---------------- */
  const fonts = (function(){
    /* [family, category]  sans | serif | display | script | mono | hindi (Devanagari support) */
    const LIST = [
      ["Inter","sans"],["Poppins","hindi"],["Montserrat","sans"],["Manrope","sans"],["DM Sans","sans"],["Plus Jakarta Sans","sans"],["Outfit","sans"],["Sora","sans"],["Urbanist","sans"],["Figtree","sans"],
      ["Lexend","sans"],["Nunito","sans"],["Nunito Sans","sans"],["Open Sans","sans"],["Roboto","sans"],["Lato","sans"],["Work Sans","sans"],["Raleway","sans"],["Rubik","sans"],["Kanit","sans"],
      ["Barlow","sans"],["Barlow Condensed","sans"],["Archivo","sans"],["Archivo Black","display"],["Heebo","sans"],["Mulish","sans"],["Quicksand","sans"],["Space Grotesk","sans"],["Red Hat Display","sans"],["Be Vietnam Pro","sans"],
      ["Onest","sans"],["Albert Sans","sans"],["Instrument Sans","sans"],["Public Sans","sans"],["IBM Plex Sans","sans"],["Source Sans 3","sans"],["Josefin Sans","sans"],["Cabin","sans"],["Karla","sans"],["Exo 2","sans"],
      ["Titillium Web","sans"],["Saira","sans"],["Saira Condensed","sans"],["Roboto Condensed","sans"],["Encode Sans","sans"],["Chivo","sans"],["Hanken Grotesk","sans"],["Schibsted Grotesk","sans"],["Bricolage Grotesque","sans"],["Familjen Grotesk","sans"],
      ["Fraunces","serif"],["Playfair Display","serif"],["DM Serif Display","serif"],["Lora","serif"],["Cormorant Garamond","serif"],["Merriweather","serif"],["Libre Baskerville","serif"],["EB Garamond","serif"],["Crimson Pro","serif"],["Source Serif 4","serif"],
      ["Noto Serif","serif"],["PT Serif","serif"],["Bitter","serif"],["Roboto Slab","serif"],["Zilla Slab","serif"],["Arvo","serif"],["Spectral","serif"],["Cardo","serif"],["Prata","serif"],["Gloock","serif"],
      ["Instrument Serif","serif"],["Young Serif","serif"],["Newsreader","serif"],["Literata","serif"],["Libre Caslon Text","serif"],["Bodoni Moda","serif"],["Marcellus","serif"],["Cinzel","serif"],["Italiana","serif"],["Abril Fatface","display"],
      ["Bebas Neue","display"],["Oswald","display"],["Anton","display"],["Archivo Narrow","display"],["League Spartan","display"],["Alfa Slab One","display"],["Bungee","display"],["Bowlby One","display"],["Black Ops One","display"],["Righteous","display"],
      ["Fredoka","display"],["Lilita One","display"],["Luckiest Guy","display"],["Bangers","display"],["Passion One","display"],["Paytone One","display"],["Titan One","display"],["Chewy","display"],["Russo One","display"],["Staatliches","display"],
      ["Unbounded","display"],["Syne","display"],["Dela Gothic One","display"],["Rammetto One","display"],["Climate Crisis","display"],["Big Shoulders Display","display"],["Fjalla One","display"],["Teko","hindi"],["Khand","hindi"],["Rajdhani","hindi"],
      ["Dancing Script","script"],["Pacifico","script"],["Caveat","script"],["Great Vibes","script"],["Satisfy","script"],["Sacramento","script"],["Kaushan Script","script"],["Allura","script"],["Parisienne","script"],["Shadows Into Light","script"],
      ["Permanent Marker","script"],["Amatic SC","script"],["Indie Flower","script"],["Patrick Hand","script"],["Courgette","script"],["Yellowtail","script"],["Homemade Apple","script"],["Mr Dafoe","script"],["Gochi Hand","script"],["Kalam","hindi"],
      ["JetBrains Mono","mono"],["Space Mono","mono"],["IBM Plex Mono","mono"],["Fira Code","mono"],["Roboto Mono","mono"],["DM Mono","mono"],["Source Code Pro","mono"],["Courier Prime","mono"],
      ["Noto Sans Devanagari","hindi"],["Noto Serif Devanagari","hindi"],["Hind","hindi"],["Mukta","hindi"],["Baloo 2","hindi"],["Tiro Devanagari Hindi","hindi"],["Yatra One","hindi"],["Rozha One","hindi"],["Martel","hindi"],["Martel Sans","hindi"],
      ["Karma","hindi"],["Amita","hindi"],["Laila","hindi"],["Sarala","hindi"],["Eczar","hindi"],["Biryani","hindi"],["Palanquin","hindi"],["Palanquin Dark","hindi"],["Jaini","hindi"],["Modak","hindi"],
      ["Gotu","hindi"],["Kurale","hindi"],["Sura","hindi"],["Glegoo","hindi"],["Arya","hindi"],["Halant","hindi"],["Vesper Libre","hindi"],["Sumana","hindi"],["Ranade","hindi"]
    ];
    const CATS = [["all","All"],["sans","Sans"],["serif","Serif"],["display","Bold display"],["script","Handwritten"],["mono","Mono"],["hindi","Hindi"]];
    const SYSTEM = new Set(["Arial","Helvetica","Georgia","Times New Roman","Verdana","system-ui"]);
    const clean = f => String(f || "").replace(/["';{}<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
    const fam = f => encodeURIComponent(f).replace(/%20/g, "+");
    const cache = new Map(), RECENT = "reelstudio-recent-fonts";
    const injected = new Set();
    /* uploaded font files: kept in IndexedDB, and in <folder>/fonts when connected */
    const LOCAL = new Set(), lev = emitter();
    async function register(family, buf){ const ff = new FontFace(family, buf); await ff.load(); document.fonts.add(ff); LOCAL.add(family); }
    const restored = (async () => {
      try { for (const k of await idb.keys()){ if (typeof k === "string" && k.startsWith("font:")){ const r = await idb.get(k); if (r && r.buf) await register(r.family, r.buf).catch(() => {}); } } } catch(e) {}
      try { await fs.ready; if (fs.state === "ready") for (const f of await fs.list("fonts")){ if (f.kind !== "file" || !/\.(ttf|otf|woff2?)$/i.test(f.name)) continue; const family = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(); if (LOCAL.has(family)) continue; const buf = await (await f.handle.getFile()).arrayBuffer(); await register(family, buf).catch(() => {}); } } catch(e) {}
      lev.emit();
    })();
    /* upload(file) -> family name. Throws a readable Error when the file is not a font. */
    async function upload(file){
      if (!file || !/\.(ttf|otf|woff2?)$/i.test(file.name)) throw new Error("Choose a .ttf, .otf, .woff or .woff2 font file.");
      const family = clean(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const buf = await file.arrayBuffer();
      try { await register(family, buf); } catch(e){ throw new Error("That file could not be read as a font."); }
      try { await idb.set("font:" + family, { family, buf, name:file.name }); } catch(e) {}
      if (fs.state === "ready"){ try { await fs.writeBlob("fonts/" + file.name, new Blob([buf])); } catch(e) {} }
      pushRecent(family); lev.emit(); return family;
    }
    const uploaded = () => [...LOCAL].sort();
    function inject(css, key){ if (injected.has(key)) return; injected.add(key); const s = document.createElement("style"); s.dataset.rsFont = key; s.textContent = css; document.head.appendChild(s); }
    async function fetchCSS(q){ const r = await fetch("https://fonts.googleapis.com/css2?" + q + "&display=swap"); if (!r.ok) throw new Error(r.status); return r.text(); }

    /* Load a Google Font (all weights it has). Resolves true when usable on canvas. */
    function load(family){
      family = clean(family); if (!family) return Promise.resolve(false);
      if (SYSTEM.has(family) || LOCAL.has(family)) return Promise.resolve(true);
      if (cache.has(family)) return cache.get(family);
      const p = (async () => {
        await restored; if (LOCAL.has(family)) return true;
        const f = fam(family);
        const tries = [`family=${f}:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700`, `family=${f}:wght@100..900`, `family=${f}:wght@400;500;600;700;800;900`, `family=${f}:wght@400;700;800`, `family=${f}:wght@400;700`, `family=${f}`];
        let css = null;
        for (const q of tries){ try { css = await fetchCSS(q); break; } catch(e){ if (!navigator.onLine) break; } }
        if (!css) return false;
        inject(css, "full:" + family);
        const got = await Promise.all([400, 700, 800].map(w => document.fonts.load(`${w} 48px "${family}"`, "AaBb अ").catch(() => [])));
        return got.some(a => a && a.length);
      })();
      cache.set(family, p); p.then(ok => { if (!ok) cache.delete(family); });
      return p;
    }
    /* tiny preview copy registered under another name so it never replaces the real font */
    const previewLoaded = new Set();
    async function preview(family){
      family = clean(family); if (!family || SYSTEM.has(family) || LOCAL.has(family) || previewLoaded.has(family)) return;
      previewLoaded.add(family);
      try { const css = await fetchCSS(`family=${fam(family)}&text=${encodeURIComponent(family + " Aa")}`); inject(css.replace(/font-family:\s*'[^']+'/g, `font-family: 'RSPrev ${family}'`), "prev:" + family); }
      catch(e){ previewLoaded.delete(family); }
    }
    const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT) || "[]").filter(x => typeof x === "string").slice(0, 8); } catch(e){ return []; } };
    const pushRecent = f => { try { localStorage.setItem(RECENT, JSON.stringify([f, ...recent().filter(x => x !== f)].slice(0, 8))); } catch(e) {} };
    const css = (family, fallback) => `"${clean(family)}", ${fallback || '"Noto Sans Devanagari", Arial, sans-serif'}`;

    let styled = false;
    function addStyles(){
      if (styled) return; styled = true;
      const s = document.createElement("style");
      s.textContent = `
.rs-fp{position:relative;display:block}
.rs-fp-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:38px;padding:7px 10px;border:1px solid var(--line,#d6d6d6);border-radius:10px;background:var(--surface,#fff);color:inherit;font:inherit;font-size:15px;cursor:pointer;text-align:left}
.rs-fp-btn:hover{border-color:var(--muted,#888)}
.rs-fp-btn:focus-visible{outline:2px solid var(--deodar,#556348);outline-offset:2px}
.rs-fp-btn .rs-fp-cur{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-fp-btn svg{flex:none;opacity:.6}
.rs-fp-pop{position:fixed;z-index:9999;width:300px;max-width:calc(100vw - 24px);background:var(--surface,#fff);color:var(--text,#222);border:1px solid var(--line,#d6d6d6);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden}
.rs-fp-pop input{margin:10px 10px 6px;padding:8px 10px;border:1px solid var(--line,#d6d6d6);border-radius:8px;font:inherit;font-size:14px;background:transparent;color:inherit}
.rs-fp-cats{display:flex;gap:4px;padding:0 10px 8px;overflow-x:auto;scrollbar-width:none}
.rs-fp-cats button{flex:none;border:1px solid var(--line,#d6d6d6);background:transparent;color:inherit;border-radius:999px;padding:3px 9px;font:inherit;font-size:12px;cursor:pointer}
.rs-fp-cats button[aria-pressed=true]{background:var(--slate,#2C3A47);border-color:var(--slate,#2C3A47);color:#fff}
.rs-fp-list{list-style:none;margin:0;padding:4px;max-height:300px;overflow:auto;border-top:1px solid var(--line,#e4e4e4)}
.rs-fp-list li{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1.2}
.rs-fp-list li small{font:12px system-ui,sans-serif;opacity:.55}
.rs-fp-list li[aria-selected=true],.rs-fp-list li:hover{background:var(--soft,rgba(0,0,0,.06))}
.rs-fp-list li.rs-fp-head{cursor:default;font:600 11px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;opacity:.55;padding:8px 10px 2px;background:none}
.rs-fp-list li.rs-fp-custom{font:14px system-ui,sans-serif}
.rs-fp-msg{font:12px system-ui,sans-serif;opacity:.7;padding:6px 12px 10px}
.rs-folder{display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px}
.rs-folder-note{opacity:.7}`;
      document.head.appendChild(s);
    }

    /* picker({ value, onChange(family), label, cats }) -> element (has .value get/set) */
    function picker(o){
      o = o || {}; addStyles();
      let value = clean(o.value) || "Inter", open = false, cat = "all", items = [], active = -1, pop = null, io = null;
      const wrap = document.createElement("div"); wrap.className = "rs-fp";
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "rs-fp-btn"; btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
      if (o.label) btn.setAttribute("aria-label", o.label + ": " + value);
      btn.innerHTML = `<span class="rs-fp-cur"></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      wrap.appendChild(btn);
      const paintBtn = () => { const s = btn.querySelector(".rs-fp-cur"); s.textContent = value; s.style.fontFamily = `"${value}", "RSPrev ${value}", system-ui, sans-serif`; if (o.label) btn.setAttribute("aria-label", o.label + ": " + value); };
      paintBtn(); preview(value); load(value).then(paintBtn); restored.then(paintBtn);

      function choose(f){
        f = clean(f); if (!f) return; value = f; paintBtn(); close(); btn.focus();
        load(f).then(ok => { if (!ok && o.onError) o.onError(f); });
        pushRecent(f); o.onChange && o.onChange(f);
      }
      function place(){ if (!pop) return; const r = btn.getBoundingClientRect(), h = pop.offsetHeight || 420, w = Math.min(300, window.innerWidth - 24); let top = r.bottom + 6; if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6); pop.style.top = top + "px"; pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12)) + "px"; }
      function render(){
        const ul = pop.querySelector(".rs-fp-list"), q = pop.querySelector("input").value.trim(), ql = q.toLowerCase();
        ul.innerHTML = ""; items = []; active = -1; if (io) io.disconnect();
        io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ preview(e.target.dataset.f); io.unobserve(e.target); } }), { root:ul }) : null;
        const head = t => { const li = document.createElement("li"); li.className = "rs-fp-head"; li.setAttribute("role", "presentation"); li.textContent = t; ul.appendChild(li); };
        const row = (f, sub) => { const li = document.createElement("li"); li.setAttribute("role", "option"); li.id = "rsfp" + Math.random().toString(36).slice(2, 8); li.dataset.f = f; li.setAttribute("aria-selected", "false");
          const s = document.createElement("span"); s.textContent = f; s.style.fontFamily = `"RSPrev ${f}", "${f}", system-ui, sans-serif`; li.appendChild(s);
          if (sub){ const sm = document.createElement("small"); sm.textContent = sub; li.appendChild(sm); }
          if (f === value){ const sm = document.createElement("small"); sm.textContent = "in use"; li.appendChild(sm); }
          li.addEventListener("mousedown", e => e.preventDefault()); li.addEventListener("click", () => choose(f));
          ul.appendChild(li); items.push(li); if (io) io.observe(li); else preview(f); };
        const pool = LIST.filter(([f, c]) => (cat === "all" || c === cat || (cat === "hindi" && c === "hindi")) && (!ql || f.toLowerCase().includes(ql)));
        const rec = !ql && cat === "all" ? recent() : [];
        const pins = !ql && cat === "all" ? [...new Set((typeof o.pinned === "function" ? o.pinned() : o.pinned || []).map(clean).filter(Boolean))] : [];
        const mine = uploaded().filter(f => !ql || f.toLowerCase().includes(ql));
        if (pins.length){ head("Brand fonts"); pins.forEach(f => row(f)); }
        if (mine.length && (cat === "all")){ head("Your uploaded fonts"); mine.forEach(f => row(f)); }
        const recF = rec.filter(f => !pins.includes(f) && !LOCAL.has(f));
        if (recF.length){ head("Recent"); recF.forEach(f => row(f)); }
        if (pins.length || mine.length || recF.length) head("Google Fonts");
        pool.forEach(([f, c]) => row(f, c === "hindi" ? "Hindi" : ""));
        if (q && !LIST.some(([f]) => f.toLowerCase() === ql)){
          const li = document.createElement("li"); li.className = "rs-fp-custom"; li.setAttribute("role", "option"); li.dataset.f = clean(q);
          li.textContent = `Use "${clean(q)}" from Google Fonts`; li.addEventListener("mousedown", e => e.preventDefault());
          li.addEventListener("click", async () => { li.textContent = "Loading..."; const ok = await load(q); if (ok) choose(q); else li.textContent = `"${clean(q)}" was not found on Google Fonts. Check the spelling, or connect to the internet.`; });
          ul.appendChild(li); items.push(li);
        }
        if (!items.length){ head("No fonts match"); }
        if (o.upload !== false){
          const li = document.createElement("li"); li.className = "rs-fp-custom"; li.setAttribute("role", "option"); li.id = "rsfpup" + Math.random().toString(36).slice(2, 7);
          li.textContent = "Upload a font file (.ttf, .otf, .woff)"; li.addEventListener("mousedown", e => e.preventDefault());
          li.addEventListener("click", () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".ttf,.otf,.woff,.woff2"; inp.addEventListener("change", async () => { const f = inp.files && inp.files[0]; if (!f) return; li.textContent = "Adding font..."; try { choose(await upload(f)); } catch(e){ li.textContent = e.message; } }); inp.click(); });
          ul.appendChild(li); items.push(li);
        }
        place();
      }
      function setActive(i){ items.forEach(li => li.setAttribute("aria-selected", "false")); active = Math.max(0, Math.min(items.length - 1, i)); const li = items[active]; if (li){ li.setAttribute("aria-selected", "true"); li.scrollIntoView({ block:"nearest" }); pop.querySelector("input").setAttribute("aria-activedescendant", li.id || ""); } }
      function openPop(){
        if (open) return; open = true; btn.setAttribute("aria-expanded", "true");
        pop = document.createElement("div"); pop.className = "rs-fp-pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Choose a font");
        pop.innerHTML = `<input type="search" placeholder="Search or type any Google Font" aria-label="Search fonts" role="combobox" aria-expanded="true" aria-autocomplete="list"><div class="rs-fp-cats"></div><ul class="rs-fp-list" role="listbox"></ul><div class="rs-fp-msg">${navigator.onLine ? "Any font from fonts.google.com works. Type its exact name." : "You are offline. Fonts you used before still work."}</div>`;
        const cats = pop.querySelector(".rs-fp-cats");
        (o.cats || CATS).forEach(([k, l]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", String(k === cat)); b.addEventListener("click", () => { cat = k; [...cats.children].forEach(x => x.setAttribute("aria-pressed", String(x === b))); render(); }); cats.appendChild(b); });
        document.body.appendChild(pop);
        const inp = pop.querySelector("input");
        inp.addEventListener("input", render);
        inp.addEventListener("keydown", e => {
          if (e.key === "ArrowDown"){ e.preventDefault(); setActive(active + 1); }
          else if (e.key === "ArrowUp"){ e.preventDefault(); setActive(active - 1); }
          else if (e.key === "Enter"){ e.preventDefault(); const li = items[active] || (items.length === 1 ? items[0] : null); if (li) li.click(); else if (inp.value.trim()) { const c = items.find(x => x.classList.contains("rs-fp-custom")); c && c.click(); } }
          else if (e.key === "Escape"){ e.preventDefault(); close(); btn.focus(); }
        });
        render(); inp.focus();
        setTimeout(() => { document.addEventListener("pointerdown", outside, true); window.addEventListener("resize", place); document.addEventListener("scroll", onScroll, true); });
      }
      const outside = e => { if (pop && !pop.contains(e.target) && !wrap.contains(e.target)) close(); };
      const onScroll = e => { if (pop && !pop.contains(e.target)) place(); };
      function close(){ if (!open) return; open = false; btn.setAttribute("aria-expanded", "false"); if (io) io.disconnect(); if (pop) pop.remove(); pop = null; document.removeEventListener("pointerdown", outside, true); window.removeEventListener("resize", place); document.removeEventListener("scroll", onScroll, true); }
      btn.addEventListener("click", () => open ? close() : openPop());
      btn.addEventListener("keydown", e => { if (e.key === "ArrowDown"){ e.preventDefault(); openPop(); } });
      Object.defineProperty(wrap, "value", { get:() => value, set:v => { value = clean(v) || value; paintBtn(); preview(value); load(value).then(paintBtn); } });
      wrap.close = close;
      return wrap;
    }
    return { LIST, CATS, load, preview, picker, css, clean, recent, upload, uploaded, restored, onUploaded:lev.on };
  })();


  /* ---------------- editor theme: system (default), light, dark ----------------
     Pages set data-theme early with a tiny inline script in <head>; this keeps it in sync
     across pages and the editor frames inside index.html. */
  const theme = (function(){
    const KEY = "reelstudio-theme", ev = emitter();
    const get = () => { try { const t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : "system"; } catch(e){ return "system"; } };
    const apply = t => { document.documentElement.dataset.theme = t; ev.emit(t); };
    function set(t){ t = t === "light" || t === "dark" ? t : "system"; try { localStorage.setItem(KEY, t); } catch(e) {} apply(t);
      try { document.querySelectorAll("iframe").forEach(f => { try { f.contentWindow.RS && f.contentWindow.RS.theme.sync(); } catch(e) {} }); } catch(e) {} }
    const sync = () => apply(get());
    window.addEventListener("storage", e => { if (e.key === KEY) sync(); });
    const ICON = {
      system:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
      light:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
      dark:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' };
    function mount(host){
      if (!host) return null;
      if (!document.getElementById("rs-theme-css")){ const st = document.createElement("style"); st.id = "rs-theme-css";
        st.textContent = ".rs-theme{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:rgba(255,255,255,.1)}.rs-theme button{width:30px;height:28px;display:grid;place-items:center;border:0;border-radius:7px;background:transparent;color:inherit;opacity:.7;cursor:pointer}.rs-theme button:hover{opacity:1}.rs-theme button[aria-pressed=true]{background:rgba(255,255,255,.92);color:#2C3A47;opacity:1}.rs-theme button:focus-visible{outline:2px solid #fff;outline-offset:1px}";
        document.head.appendChild(st); }
      const g = document.createElement("div"); g.className = "rs-theme"; g.setAttribute("role", "group"); g.setAttribute("aria-label", "Editor theme");
      [["system","System theme"],["light","Light theme"],["dark","Dark theme"]].forEach(([k, l]) => { const b = document.createElement("button"); b.type = "button"; b.dataset.t = k; b.title = l; b.setAttribute("aria-label", l); b.innerHTML = ICON[k]; b.addEventListener("click", () => set(k)); g.appendChild(b); });
      const paint = () => { const t = get(); g.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.t === t))); };
      ev.on(paint); paint(); host.appendChild(g); return g;
    }
    sync();
    return { get, set, sync, mount, onChange:ev.on };
  })();

  return Object.freeze({ slug, uid, idb, fs, collection, fonts, theme });
})();
