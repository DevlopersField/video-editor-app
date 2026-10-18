/*
  Reel Studio pro caption presets.
  Loaded after video.html's main script. Each preset is a starting point: pick it,
  tweak it in Caption style, then "Save as style" to keep your own version.
  Props schema: see the custom caption props comment in video.html (capProps).
*/
(function(){
  "use strict";
  if (!window.RS_CAPTIONS) return;
  const G = window.GIRIKA || {}, C = G.C || {}, F = G.FONTS || {};
  const base = { italic:false, case:"normal", color:"#FFFFFF", hlMode:"color", upcoming:"show", dim:.45,
    outline:false, outlineColor:"#111111", outlineW:.14, shadow:false, shadowColor:"#000000", shadowBlur:14, shadowY:4,
    bg:"none", bgColor:"#000000", bgOpacity:.85, radius:12, padX:.35, padY:.2, spacing:0, lineHeight:1.12, align:"center", maxWidth:.9, maxLines:2 };
  const P = (id, name, group, props, extra) => ({ id, name, group, props:{ ...base, ...props }, ...extra });

  RS_CAPTIONS.registerPresets([
    /* Clean */
    P("editorial", "Editorial", "Clean",
      { font:"Instrument Serif", weight:400, case:"lower", hl:"#B9C9A5", bg:"block", bgColor:"#1F3D2E", bgOpacity:1, radius:0, padX:.32, padY:.1, lineHeight:1.08, maxLines:1, maxWidth:.92 },
      { enter:"fade", enterDur:.18, exit:"none", anim:"word", size:1.05, pos:"lowmid" }),
    P("minimal", "Minimal", "Clean",
      { font:"Inter", weight:600, hl:"#FFFFFF", hlMode:"none", shadow:true, shadowBlur:18, shadowY:3, shadowColor:"#000000" },
      { enter:"fade", enterDur:.2, exit:"fade", anim:"none", size:1.05, pos:"lower" }),
    P("subtitle", "Subtitle bar", "Clean",
      { font:"Roboto", weight:500, hlMode:"none", hl:"#FFFFFF", bg:"line", bgColor:"#000000", bgOpacity:.62, radius:6, padX:.3, padY:.08, maxLines:2 },
      { enter:"none", exit:"none", anim:"none", size:.85, pos:"lower" }),
    P("cinema", "Cinema serif", "Clean",
      { font:"Playfair Display", weight:500, italic:true, hl:"#F2D7A6", spacing:.02, shadow:true, shadowBlur:22, shadowY:2 },
      { enter:"blur", enterDur:.35, exit:"fade", anim:"none", size:1.05, pos:"lower" }),
    P("glass", "Soft box", "Clean",
      { font:"DM Sans", weight:700, hl:"#FFE7A3", bg:"block", bgColor:"#000000", bgOpacity:.38, radius:22, padX:.45, padY:.22 },
      { enter:"up", enterDur:.25, exit:"fade", anim:"word", size:1.05, pos:"lower" }),

    /* Bold */
    P("impact", "Impact yellow", "Bold",
      { font:"Montserrat", weight:900, case:"upper", hl:"#FFE14D", outline:true, outlineColor:"#000000", outlineW:.17, shadow:true, shadowBlur:10, shadowY:5, lineHeight:1.02 },
      { enter:"wpop", enterDur:.28, exit:"none", anim:"word", size:1.3, pos:"middle", words:"short" }),
    P("beast", "Beast green", "Bold",
      { font:"Luckiest Guy", weight:400, case:"upper", hl:"#3EE07A", outline:true, outlineColor:"#000000", outlineW:.2, shadow:true, shadowBlur:0, shadowY:7, shadowColor:"#000000", lineHeight:1.05 },
      { enter:"pop", enterDur:.25, exit:"none", anim:"word", size:1.3, pos:"middle", words:"short" }),
    P("punch", "Punch box", "Bold",
      { font:"Anton", weight:400, case:"upper", hlMode:"box", hl:"#FFD60A", outline:false, shadow:true, shadowBlur:12, shadowY:4, spacing:.01 },
      { enter:"rise", enterDur:.3, exit:"none", anim:"word", size:1.3, pos:"lowmid", words:"short" }),
    P("comic", "Comic pop", "Bold",
      { font:"Bangers", weight:400, case:"upper", hl:"#FF2E63", outline:true, outlineColor:"#000000", outlineW:.22, spacing:.03 },
      { enter:"bounce", enterDur:.4, exit:"none", anim:"word", size:1.3, pos:"middle", words:"short" }),
    P("karaoke", "Karaoke", "Bold",
      { font:"Poppins", weight:800, hl:"#39E75F", upcoming:"dim", dim:.4, outline:true, outlineColor:"#000000", outlineW:.12 },
      { enter:"fade", enterDur:.15, exit:"none", anim:"word", size:1.05, pos:"lower", words:"normal" }),

    /* Trendy */
    P("pill", "Word pills", "Trendy",
      { font:"Poppins", weight:700, hl:"#FF5C5C", hlMode:"box", bg:"word", bgColor:"#111111", bgOpacity:.82, radius:40, padX:.3, padY:.14 },
      { enter:"wpop", enterDur:.25, exit:"none", anim:"word", size:1.05, pos:"lower", words:"short" }),
    P("story", "Story white", "Trendy",
      { font:"Bricolage Grotesque", weight:800, color:"#111111", hl:"#FF4D4D", bg:"line", bgColor:"#FFFFFF", bgOpacity:1, radius:10, padX:.3, padY:.1 },
      { enter:"up", enterDur:.25, exit:"down", anim:"word", size:1.05, pos:"lowmid" }),
    P("neon", "Neon glow", "Trendy",
      { font:"Kanit", weight:700, case:"upper", hl:"#FF3CAC", shadow:true, shadowColor:"#00E5FF", shadowBlur:30, shadowY:0, spacing:.02 },
      { enter:"blur", enterDur:.3, exit:"blur", anim:"word", size:1.3, pos:"middle", words:"short" }),
    P("underline", "Underline", "Trendy",
      { font:"DM Sans", weight:800, hlMode:"underline", hl:"#FF7A00", shadow:true, shadowBlur:14, shadowY:3 },
      { enter:"up", enterDur:.22, exit:"none", anim:"word", size:1.05, pos:"lower" }),
    P("typewriter", "Typewriter", "Trendy",
      { font:"JetBrains Mono", weight:600, hl:"#7CFFB2", bg:"block", bgColor:"#111111", bgOpacity:.86, radius:8, padX:.4, padY:.2, align:"left", maxLines:3 },
      { enter:"type", enterDur:.6, exit:"fade", anim:"none", size:.85, pos:"lower", words:"normal" }),
    P("hand", "Handwritten", "Trendy",
      { font:"Caveat", weight:700, hl:"#FFE14D", shadow:true, shadowBlur:16, shadowY:3, lineHeight:1 },
      { enter:"fade", enterDur:.3, exit:"fade", anim:"none", size:1.3, pos:"lower" }),

    /* Hindi and brand */
    P("hindi", "Hindi bold", "Hindi and brand",
      { font:"Baloo 2", weight:800, hl:"#FFC300", outline:true, outlineColor:"#000000", outlineW:.15, lineHeight:1.2 },
      { enter:"pop", enterDur:.25, exit:"none", anim:"word", size:1.3, pos:"lower", words:"short" }),
    P("brand", "Brand box", "Hindi and brand",
      { font:F.head || "Fraunces", weight:600, color:C.lime || "#F4F1EC", hl:C.clayLt || "#C99A85", bg:"block", bgColor:C.deodar || "#556348", bgOpacity:1, radius:6, padX:.35, padY:.12, maxLines:2 },
      { enter:"up", enterDur:.25, exit:"fade", anim:"word", size:1.05, pos:"lowmid" })
  ]);
})();
