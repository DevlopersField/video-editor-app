/**
 * MaskTracker: High-Precision Pyramidal Lucas-Kanade Optical Flow & Planar Tracking Engine
 * 
 * Provides Adobe Premiere Pro / After Effects style mask tracking:
 * - Multi-scale Image Pyramids (3 Gaussian pyramid levels)
 * - Shi-Tomasi Good Features to Track (auto-detects high-contrast ground features inside polygon)
 * - Sub-pixel Lucas-Kanade iterative optical flow with spatial gradients
 * - Forward-Backward Cyclic Error Verification (discards unreliable points)
 * - RANSAC 2D Similarity Solver (Scale, Rotation, Translation) with outlier rejection
 * - Bidirectional whole-clip tracking with live progress HUD & playback preview
 */

(function(global){
  "use strict";

  const MaskTracker = {};

  // Downsample image by factor of 2 with 3x3 binomial filter [1, 2, 1] / 4
  function downsample2x(src, w, h){
    const nw = Math.floor(w / 2), nh = Math.floor(h / 2);
    const dst = new Uint8Array(nw * nh);
    for (let y = 0; y < nh; y++){
      const sy = y * 2;
      const y0 = Math.max(0, sy - 1), y1 = sy, y2 = Math.min(h - 1, sy + 1);
      const r0 = y0 * w, r1 = y1 * w, r2 = y2 * w;
      for (let x = 0; x < nw; x++){
        const sx = x * 2;
        const x0 = Math.max(0, sx - 1), x1 = sx, x2 = Math.min(w - 1, sx + 1);
        const v = (
          (src[r0 + x0] + src[r0 + x1] * 2 + src[r0 + x2]) +
          (src[r1 + x0] * 2 + src[r1 + x1] * 4 + src[r1 + x2] * 2) +
          (src[r2 + x0] + src[r2 + x1] * 2 + src[r2 + x2])
        ) >> 4;
        dst[y * nw + x] = v;
      }
    }
    return { data: dst, w: nw, h: nh };
  }

  // Build a 3-level Gaussian image pyramid
  MaskTracker.buildPyramid = function(level0Luma, w, h, levels = 3){
    const pyr = [{ data: level0Luma, w, h }];
    for (let l = 1; l < levels; l++){
      const prev = pyr[l - 1];
      pyr.push(downsample2x(prev.data, prev.w, prev.h));
    }
    return pyr;
  };

  // Test if point (px, py) is inside polygon (normalized 0..1 or pixel coords)
  MaskTracker.isInsidePolygon = function(px, py, pts){
    let inside = false;
    const n = pts.length;
    for (let i = 0, j = n - 1; i < n; j = i++){
      const xi = pts[i][0], yi = pts[i][1];
      const xj = pts[j][0], yj = pts[j][1];
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Shi-Tomasi cornerness & feature detector inside polygon
  MaskTracker.detectFeaturesInsideMask = function(imgData, w, h, polyPts, maxFeatures = 45){
    const pts = polyPts.map(([u, v]) => [u * w, v * h]);
    let minX = w, maxX = 0, minY = h, maxY = 0;
    pts.forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });

    minX = Math.max(12, Math.floor(minX));
    maxX = Math.min(w - 12, Math.ceil(maxX));
    minY = Math.max(12, Math.floor(minY));
    maxY = Math.min(h - 12, Math.ceil(maxY));

    const candidates = [];
    const step = 8;
    const RAD = 4;

    for (let y = minY; y <= maxY; y += step){
      for (let x = minX; x <= maxX; x += step){
        if (!MaskTracker.isInsidePolygon(x, y, pts)) continue;

        let xx = 0, yy = 0, xy = 0;
        for (let dy = -RAD; dy <= RAD; dy += 2){
          const ry = (y + dy) * w;
          for (let dx = -RAD; dx <= RAD; dx += 2){
            const ix = (imgData[ry + x + dx + 1] - imgData[ry + x + dx - 1]) * 0.5;
            const iy = (imgData[(y + dy + 1) * w + x + dx] - imgData[(y + dy - 1) * w + x + dx]) * 0.5;
            xx += ix * ix; yy += iy * iy; xy += ix * iy;
          }
        }

        const trace = xx + yy;
        const det = xx * yy - xy * xy;
        const disc = Math.max(0, trace * trace - 4 * det);
        const lmin = (trace - Math.sqrt(disc)) * 0.5;

        if (lmin > 12){
          candidates.push({ x, y, score: lmin });
        }
      }
    }

    // Sort by cornerness score
    candidates.sort((a, b) => b.score - a.score);

    // Non-maximum suppression (minimum 10px spacing)
    const selected = [];
    const minD2 = 10 * 10;
    for (let i = 0; i < candidates.length && selected.length < maxFeatures; i++){
      const c = candidates[i];
      let ok = true;
      for (let j = 0; j < selected.length; j++){
        const dx = c.x - selected[j][0], dy = c.y - selected[j][1];
        if (dx * dx + dy * dy < minD2){ ok = false; break; }
      }
      if (ok) selected.push([c.x, c.y]);
    }

    // Always include polygon vertices, centroid, and edge midpoints
    const n = pts.length;
    pts.forEach(p => selected.push([p[0], p[1]]));
    const cx = pts.reduce((s, p) => s + p[0], 0) / n;
    const cy = pts.reduce((s, p) => s + p[1], 0) / n;
    selected.push([cx, cy]);
    for (let i = 0; i < n; i++){
      const p1 = pts[i], p2 = pts[(i + 1) % n];
      selected.push([(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]);
    }

    return selected;
  };

  // Bilinear interpolation of pixel intensity
  function getSubPix(img, w, h, x, y){
    if (x < 0 || x >= w - 1 || y < 0 || y >= h - 1) return 0;
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const idx = iy * w + ix;
    const p00 = img[idx], p10 = img[idx + 1];
    const p01 = img[idx + w], p11 = img[idx + w + 1];
    const top = p00 + (p10 - p00) * fx;
    const bot = p01 + (p11 - p01) * fx;
    return top + (bot - top) * fy;
  }

  // Iterative Pyramidal Lucas-Kanade feature tracker
  MaskTracker.trackPointsLK = function(pyrPrev, pyrCur, points, maxIters = 6, winRad = 5){
    const levels = pyrPrev.length;
    const tracked = [];

    for (let i = 0; i < points.length; i++){
      const [origX, origY] = points[i];
      let gx = 0, gy = 0;
      let valid = true;

      for (let l = levels - 1; l >= 0; l--){
        const prev = pyrPrev[l], cur = pyrCur[l];
        const scale = 1 / (1 << l);
        const px = origX * scale, py = origY * scale;

        if (px - winRad < 1 || px + winRad >= prev.w - 2 || py - winRad < 1 || py + winRad >= prev.h - 2){
          valid = false; break;
        }

        // Spatial gradient matrix G
        let Gxx = 0, Gyy = 0, Gxy = 0;
        const gradX = [], gradY = [], valPrev = [];
        let pIdx = 0;

        for (let wy = -winRad; wy <= winRad; wy++){
          const sy = py + wy;
          for (let wx = -winRad; wx <= winRad; wx++){
            const sx = px + wx;
            const ix = (getSubPix(prev.data, prev.w, prev.h, sx + 1, sy) - getSubPix(prev.data, prev.w, prev.h, sx - 1, sy)) * 0.5;
            const iy = (getSubPix(prev.data, prev.w, prev.h, sx, sy + 1) - getSubPix(prev.data, prev.w, prev.h, sx, sy - 1)) * 0.5;
            const v = getSubPix(prev.data, prev.w, prev.h, sx, sy);
            gradX.push(ix); gradY.push(iy); valPrev.push(v);
            Gxx += ix * ix; Gyy += iy * iy; Gxy += ix * iy;
            pIdx++;
          }
        }

        const det = Gxx * Gyy - Gxy * Gxy;
        if (det < 1e-4){ valid = false; break; }

        const invDet = 1.0 / det;
        const iGxx = Gyy * invDet, iGyy = Gxx * invDet, iGxy = -Gxy * invDet;

        // Sub-pixel gradient descent
        for (let iter = 0; iter < maxIters; iter++){
          const curX = px + gx, curY = py + gy;
          if (curX - winRad < 0 || curX + winRad >= cur.w - 1 || curY - winRad < 0 || curY + winRad >= cur.h - 1){
            valid = false; break;
          }

          let bx = 0, by = 0;
          let k = 0;
          for (let wy = -winRad; wy <= winRad; wy++){
            const sy = curY + wy;
            for (let wx = -winRad; wx <= winRad; wx++){
              const sx = curX + wx;
              const vCur = getSubPix(cur.data, cur.w, cur.h, sx, sy);
              const dI = valPrev[k] - vCur;
              bx += gradX[k] * dI;
              by += gradY[k] * dI;
              k++;
            }
          }

          const etaX = iGxx * bx + iGxy * by;
          const etaY = iGxy * bx + iGyy * by;
          gx += etaX; gy += etaY;

          if (etaX * etaX + etaY * etaY < 0.001) break;
        }

        if (!valid) break;
        if (l > 0){ gx *= 2; gy *= 2; }
      }

      if (valid){
        tracked.push({ p: [origX, origY], q: [origX + gx, origY + gy], dx: gx, dy: gy });
      }
    }
    return tracked;
  };

  // Forward-Backward Cyclic Consistency Verification
  MaskTracker.filterCyclicMatches = function(pyrPrev, pyrCur, matches, threshold = 1.25){
    if (!matches || !matches.length) return [];
    const targetPoints = matches.map(m => m.q);
    const backwardMatches = MaskTracker.trackPointsLK(pyrCur, pyrPrev, targetPoints, 4);

    const verified = [];
    for (let i = 0; i < matches.length; i++){
      const fwd = matches[i];
      const bwd = backwardMatches[i];
      if (bwd){
        const err = Math.hypot(bwd.q[0] - fwd.p[0], bwd.q[1] - fwd.p[1]);
        if (err <= threshold){
          verified.push(fwd);
        }
      }
    }
    return verified.length >= 3 ? verified : matches;
  };

  // Robust RANSAC 2D Similarity Transform Solver (Scale, Rotation, Translation)
  MaskTracker.ransacSimilarity = function(matches, maxIters = 120, threshold = 2.0){
    const n = matches.length;
    if (n < 2) return null;

    function fit2Pt(p1, p2, q1, q2){
      const dx1 = p2[0] - p1[0], dy1 = p2[1] - p1[1];
      const dx2 = q2[0] - q1[0], dy2 = q2[1] - q1[1];
      const d1 = Math.hypot(dx1, dy1), d2 = Math.hypot(dx2, dy2);
      if (d1 < 1e-4) return null;
      const S = d2 / d1;
      const a1 = Math.atan2(dy1, dx1), a2 = Math.atan2(dy2, dx2);
      const rot = a2 - a1;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const a = S * cosR, b = S * sinR;
      const tx = q1[0] - (a * p1[0] - b * p1[1]);
      const ty = q1[1] - (b * p1[0] + a * p1[1]);
      return { a, b, tx, ty, S, rot };
    }

    let bestInliers = [];
    let bestModel = null;

    for (let it = 0; it < maxIters; it++){
      const i1 = Math.floor(Math.random() * n);
      let i2 = Math.floor(Math.random() * n);
      if (i1 === i2) i2 = (i1 + 1) % n;

      const m = fit2Pt(matches[i1].p, matches[i2].p, matches[i1].q, matches[i2].q);
      if (!m) continue;

      const inliers = [];
      for (let i = 0; i < n; i++){
        const px = matches[i].p[0], py = matches[i].p[1];
        const qx = m.a * px - m.b * py + m.tx;
        const qy = m.b * px + m.a * py + m.ty;
        const err = Math.hypot(qx - matches[i].q[0], qy - matches[i].q[1]);
        if (err < threshold) inliers.push(matches[i]);
      }

      if (inliers.length > bestInliers.length){
        bestInliers = inliers;
        bestModel = m;
        if (bestInliers.length > n * 0.85) break;
      }
    }

    // Refit using all inliers with Least Squares / Centroid Procrustes
    const active = bestInliers.length >= 2 ? bestInliers : matches;
    const nIn = active.length;
    const ca = [active.reduce((s, m) => s + m.p[0], 0) / nIn, active.reduce((s, m) => s + m.p[1], 0) / nIn];
    const cb = [active.reduce((s, m) => s + m.q[0], 0) / nIn, active.reduce((s, m) => s + m.q[1], 0) / nIn];

    let da = 0, db = 0, A = 0, B = 0;
    for (let i = 0; i < nIn; i++){
      const ax = active[i].p[0] - ca[0], ay = active[i].p[1] - ca[1];
      const bx = active[i].q[0] - cb[0], by = active[i].q[1] - cb[1];
      da += Math.hypot(ax, ay);
      db += Math.hypot(bx, by);
      A += ax * bx + ay * by;
      B += ax * by - ay * bx;
    }

    let S = da > 1e-4 ? db / da : 1.0;
    S = Math.max(0.85, Math.min(1.18, S)); // clamp per-step scale

    let rot = Math.atan2(B, A);
    rot = Math.max(-0.35, Math.min(0.35, rot)); // clamp per-step rotation (~20 deg)

    const cosR = Math.cos(rot), sinR = Math.sin(rot);
    const a = S * cosR, b = S * sinR;
    const tx = cb[0] - (a * ca[0] - b * ca[1]);
    const ty = cb[1] - (b * ca[0] + a * ca[1]);

    return { a, b, tx, ty, S, rot, inliers: active.length, total: n, ca, cb };
  };

  // Apply fitted 2D similarity transform to normalized polygon vertices
  MaskTracker.transformVertices = function(pts, model, w, h, method = "psr"){
    const S = (method === "p") ? 1.0 : model.S;
    const rot = (method === "psr") ? model.rot : 0.0;
    const cosR = Math.cos(rot), sinR = Math.sin(rot);

    return pts.map(([u, v]) => {
      const vx = u * w, vy = v * h;
      let rx = (vx - model.ca[0]) * S;
      let ry = (vy - model.ca[1]) * S;
      const tx = rx * cosR - ry * sinR;
      const ty = rx * sinR + ry * cosR;
      const nx = model.cb[0] + tx;
      const ny = model.cb[1] + ty;
      return [
        Math.max(-0.25, Math.min(1.25, nx / w)),
        Math.max(-0.25, Math.min(1.25, ny / h))
      ];
    });
  };

  // Optional: Local OpenCV.js loader if user provides local opencv.js in folder
  MaskTracker.loadOpenCV = function(){
    return new Promise((resolve, reject) => {
      if (global.cv && global.cv.Mat){ resolve(global.cv); return; }
      const s = document.createElement("script");
      s.src = "opencv.js";
      s.async = true;
      s.onload = () => {
        if (global.cv){
          global.cv["onRuntimeInitialized"] = () => resolve(global.cv);
        } else resolve();
      };
      s.onerror = err => reject(err);
      document.head.appendChild(s);
    });
  };

  global.MaskTracker = MaskTracker;
})(typeof window !== "undefined" ? window : globalThis);
