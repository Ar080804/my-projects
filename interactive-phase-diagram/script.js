// =====================================================================
        //  DATASET
        // =====================================================================
        const S = 80; // temperature shift
        const LIQ_X = [0.535, 2.944, 5.218, 7.894, 10.302, 12.844, 15.252, 17.392, 19.800, 21.807, 23.814, 25.954, 28.095, 30.101, 32.108, 34.249, 36.255, 38.396, 40.536, 42.543, 44.550, 46.289, 48.296, 50.035, 51.908, 53.647, 55.520, 57.393, 59.132, 61.005, 63.012, 64.617, 66.222, 68.229, 69.834, 71.841, 74.118, 75.860, 77.333, 79.075, 80.817, 82.425, 84.033, 85.908, 87.650, 89.258, 91.000, 92.072, 93.814, 95.557, 97.031, 98.238, 99.712];
        const LIQ_Y = [1196.1, 1186.3, 1176.5, 1162.7, 1149.0, 1137.3, 1125.5, 1115.7, 1103.9, 1094.1, 1084.3, 1074.5, 1062.7, 1051.0, 1043.1, 1033.3, 1023.5, 1011.8, 1002.0, 990.2, 982.4, 972.5, 964.7, 954.9, 947.1, 939.2, 927.5, 919.6, 911.8, 902.0, 892.2, 886.3, 876.5, 866.7, 858.8, 849.0, 854.9, 866.7, 874.5, 884.3, 896.1, 909.8, 919.6, 931.4, 943.1, 956.9, 966.7, 976.5, 988.2, 1003.9, 1017.6, 1031.4, 1047.1].map(t => t - S);

        // Cu-rich solidus
        const SOL_CU_X = [0.536, 1.604, 2.406, 3.341, 4.275, 5.076, 5.877, 6.410, 6.942, 7.342, 7.740, 8.005, 8.270, 8.401, 8.397, 8.394, 8.391, 7.988, 7.985];
        const SOL_CU_Y = [1198, 1180.4, 1168.6, 1151, 1133.3, 1115.7, 1094.1, 1076.5, 1052.9, 1037.3, 1015.7, 994.1, 970.6, 949, 923.5, 901.9, 880.4, 862.7, 845.1].map(t => t - S);

        // Ag-rich solidus
        const SOL_AG_X = [91.788, 92.593, 93.399, 94.071, 94.876, 95.548, 96.353, 97.159, 97.697, 98.368, 98.771, 99.981];
        const SOL_AG_Y = [849, 866.7, 884.3, 903.9, 921.6, 939.2, 954.9, 974.5, 992.2, 1003.9, 1013.7, 1051].map(t => t - S);

        // Cu-rich solvus (α boundary) — note: T descending in data
        const SLV_CU_X_raw = [7.851, 7.180, 6.508, 5.836, 5.431, 4.893, 4.489, 4.085, 3.681, 3.277, 3.007, 2.736, 2.332, 2.196, 1.926, 1.655, 1.385, 1.248, 0.977, 0.840, 0.570];
        const SLV_CU_Y_raw = [841.2, 827.5, 807.8, 788.2, 766.7, 747.1, 729.4, 709.8, 692.2, 674.5, 654.9, 637.3, 619.6, 602, 580.4, 560.8, 539.2, 517.6, 496.1, 474.5, 454.9].map(t => t - S);

        // Ag-rich solvus (β boundary)
        const SLV_AG_X_raw = [91.787, 92.320, 92.854, 93.119, 93.786, 94.052, 94.451, 94.851, 95.249, 95.515, 95.914, 96.313, 96.578, 96.843, 97.108, 97.507, 97.639, 97.904, 98.169];
        const SLV_AG_Y_raw = [845.1, 827.5, 811.8, 796.1, 780.4, 762.7, 745.1, 729.4, 709.8, 692.2, 674.5, 656.9, 637.3, 615.7, 594.1, 572.5, 558.8, 539.2, 517.6].map(t => t - S);

        // =====================================================================
        //  EXTEND SOLVUS CURVES TO COMPOSITION AXIS BOUNDARIES
        //  FIX #1: Raw solvus data doesn't reach 0% or 100%. We extrapolate
        //  linearly beyond the last data point to reach the axis at 300°C.
        // =====================================================================
        function extendSolvusToBoundary(X_arr, Y_arr, targetX, minT) {
            // Extrapolate beyond the last point to targetX composition at minT
            const n = X_arr.length;
            // Use linear extrapolation from the last two points
            const dx = X_arr[n - 1] - X_arr[n - 2];
            const dy = Y_arr[n - 1] - Y_arr[n - 2];
            const slope = dy / dx; // dT/dX
            // Extend step by step down to minT
            const extX = [...X_arr], extY = [...Y_arr];
            let lastX = X_arr[n - 1], lastY = Y_arr[n - 1];
            while (lastY > minT + 5) {
                const nextY = Math.max(minT, lastY - 20);
                const nextX = lastX + (nextY - lastY) / slope;
                const clampedX = Math.max(0, Math.min(100, nextX));
                extX.push(clampedX); extY.push(nextY);
                lastX = clampedX; lastY = nextY;
                if (clampedX <= 0 || clampedX >= 100) break;
            }
            // Anchor to targetX at minT
            extX.push(targetX); extY.push(minT);
            return [extX, extY];
        }

        // Extend Cu-rich solvus down to 0% Ag at 220°C
        const [SLV_CU_X, SLV_CU_Y] = extendSolvusToBoundary(SLV_CU_X_raw, SLV_CU_Y_raw, 0, 220);
        // Extend Ag-rich solvus down to 100% Ag at 220°C
        const [SLV_AG_X, SLV_AG_Y] = extendSolvusToBoundary(SLV_AG_X_raw, SLV_AG_Y_raw, 100, 220);

        // =====================================================================
        //  THERMODYNAMIC CONSTANTS
        // =====================================================================
        const T_EUT = 847 - S;
        const C_EUT = 71.9;    // eutectic composition (wt% Ag)
        const C_ALPHA_MAX = 8.0;  // max α solubility at eutectic T
        const C_BETA_MIN = 91.7; // min β solubility at eutectic T

        // =====================================================================
        //  COORDINATE MAPPING
        // =====================================================================
        const SVG_W = 1000, SVG_H = 900;
        const T_MIN = 220, T_MAX = 1180;
        const mapX = c => (c / 100) * SVG_W;
        const mapY = t => SVG_H - ((t - T_MIN) / (T_MAX - T_MIN)) * SVG_H;
        const unmapX = vx => (vx / SVG_W) * 100;
        const unmapY = vy => T_MIN + (1 - vy / SVG_H) * (T_MAX - T_MIN);

        // =====================================================================
        //  INTERPOLATION — monotone check then linear interpolation
        //  FIX #2: The original interpolate() assumed Y was always monotonically
        //  decreasing (T descending), which fails on the liquidus (which is
        //  NOT monotone — it dips to eutectic then rises on the Ag-rich side).
        //  We now pass left/right half-curves separately, and always sort by T
        //  before interpolating.
        // =====================================================================
        function makeMonotone(X_arr, Y_arr) {
            // Sort by Y (temperature) descending so we can binary-search
            const pairs = X_arr.map((x, i) => [x, Y_arr[i]]);
            pairs.sort((a, b) => b[1] - a[1]);
            return [pairs.map(p => p[0]), pairs.map(p => p[1])];
        }

        function interpolateByT(T, X_arr, Y_arr) {
            // Y_arr must be monotonically decreasing (T descending)
            if (T >= Y_arr[0]) return X_arr[0];
            if (T <= Y_arr[Y_arr.length - 1]) return X_arr[Y_arr.length - 1];
            for (let i = 0; i < Y_arr.length - 1; i++) {
                const y0 = Y_arr[i], y1 = Y_arr[i + 1];
                if (T <= y0 && T >= y1) {
                    const t = (T - y0) / (y1 - y0);
                    return X_arr[i] + t * (X_arr[i + 1] - X_arr[i]);
                }
            }
            return X_arr[Y_arr.length - 1];
        }

        // Pre-sort each curve for T-based lookup
        const [LIQ_CU_X_s, LIQ_CU_Y_s] = makeMonotone(LIQ_X.slice(0, 36), LIQ_Y.slice(0, 36));
        const [LIQ_AG_X_s, LIQ_AG_Y_s] = makeMonotone(LIQ_X.slice(35), LIQ_Y.slice(35));
        const [SOL_CU_X_s, SOL_CU_Y_s] = makeMonotone(SOL_CU_X, SOL_CU_Y);
        const [SOL_AG_X_s, SOL_AG_Y_s] = makeMonotone(SOL_AG_X, SOL_AG_Y);
        const [SLV_CU_X_s, SLV_CU_Y_s] = makeMonotone(SLV_CU_X, SLV_CU_Y);
        const [SLV_AG_X_s, SLV_AG_Y_s] = makeMonotone(SLV_AG_X, SLV_AG_Y);

        // =====================================================================
        //  BOUNDARY DISTANCE COMPUTATION (SVG-pixel space)
        //  FIX #3: The original code had NO distance-to-curve logic. We now
        //  compute point-to-segment distance for each polyline, enabling
        //  robust "on boundary" detection with a pixel tolerance.
        // =====================================================================
        function distPointToSegment(px, py, ax, ay, bx, by) {
            const abx = bx - ax, aby = by - ay;
            const len2 = abx * abx + aby * aby;
            if (len2 === 0) return Math.hypot(px - ax, py - ay);
            let t = ((px - ax) * abx + (py - ay) * aby) / len2;
            t = Math.max(0, Math.min(1, t));
            return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
        }

        function distToCurve(svgX, svgY, X_arr, Y_arr) {
            let minD = Infinity;
            for (let i = 0; i < X_arr.length - 1; i++) {
                const d = distPointToSegment(
                    svgX, svgY,
                    mapX(X_arr[i]), mapY(Y_arr[i]),
                    mapX(X_arr[i + 1]), mapY(Y_arr[i + 1])
                );
                if (d < minD) minD = d;
            }
            return minD;
        }

        // =====================================================================
        //  PHASE REGION CLASSIFICATION
        //  FIX #4: The original code used loose conditionals that produced
        //  wrong results near boundaries and at the eutectic line. We now
        //  derive all boundaries analytically via interpolation and classify
        //  the phase region by comparing C0 against these interpolated values.
        // =====================================================================
        function classifyPhase(C0, T) {
            const isAboveEut = T > T_EUT + 0.5;
            const isBelowEut = T < T_EUT - 0.5;
            const isAtEut = !isAboveEut && !isBelowEut;

            // ---- EUTECTIC ISOTHERM ----
            if (isAtEut) {
                if (C0 < C_ALPHA_MAX - 0.1) return { phase: "α (solid)", micro: "S_A", fracs: null };
                if (C0 > C_BETA_MIN + 0.1) return { phase: "β (solid)", micro: "S_B", fracs: null };
                return {
                    phase: "Eutectic Isotherm (α + L + β)",
                    micro: "E",
                    fracs: null,
                    isBoundary: "eutectic_line"
                };
            }

            // ---- BELOW EUTECTIC: all solid ----
            if (isBelowEut) {
                const slvCu = interpolateByT(T, SLV_CU_X_s, SLV_CU_Y_s);
                const slvAg = interpolateByT(T, SLV_AG_X_s, SLV_AG_Y_s);

                if (C0 <= slvCu) return { phase: "α (solid)", micro: "S_A", fracs: null };
                if (C0 >= slvAg) return { phase: "β (solid)", micro: "S_B", fracs: null };

                // Two-phase α + β — lever rule between solvus lines
                const fBeta = (C0 - slvCu) / (slvAg - slvCu);
                const fAlpha = 1 - fBeta;
                // Below eutectic: determine if hypo/hypereutectic for microstructure
                if (C0 < C_EUT) {
                    // Hypoeutectic: proeutectoid α + eutectic
                    const fEut = (C0 - slvCu) / (C_EUT - slvCu);
                    const fProA = 1 - fEut;
                    return {
                        phase: "α + β (two-phase solid)",
                        micro: "PRO_A_E",
                        solidFrac: Math.max(0, Math.min(1, fProA)),
                        fracs: { label: "Proeutectoid α / Eutectic", a: fProA, b: fEut },
                        leverCL: slvCu, leverCS: slvAg
                    };
                } else if (C0 > C_EUT) {
                    const fEut = (slvAg - C0) / (slvAg - C_EUT);
                    const fProB = 1 - fEut;
                    return {
                        phase: "α + β (two-phase solid)",
                        micro: "PRO_B_E",
                        solidFrac: Math.max(0, Math.min(1, fProB)),
                        fracs: { label: "Eutectic / Proeutectoid β", a: fEut, b: fProB },
                        leverCL: slvCu, leverCS: slvAg
                    };
                } else {
                    return { phase: "100% Eutectic (α+β)", micro: "E", fracs: null };
                }
            }

            // ---- ABOVE EUTECTIC: partial melting zone possible ----
            // Determine which side of eutectic composition
            const isCuSide = C0 <= C_EUT;

            // Liquidus composition at this T
            const CL = isCuSide
                ? interpolateByT(T, LIQ_CU_X_s, LIQ_CU_Y_s)
                : interpolateByT(T, LIQ_AG_X_s, LIQ_AG_Y_s);

            // Solidus composition at this T
            const CS = isCuSide
                ? interpolateByT(T, SOL_CU_X_s, SOL_CU_Y_s)
                : interpolateByT(T, SOL_AG_X_s, SOL_AG_Y_s);

            // Sort so CLeft < CRight regardless of which is solidus/liquidus
            const Cmin = Math.min(CS, CL);
            const Cmax = Math.max(CS, CL);

            if (C0 >= Cmin && C0 <= Cmax) {
                // Two-phase region: solid + liquid
                // Lever rule: fraction solid = (C0 - CL)/(CS - CL)
                const denom = CS - CL;
                const fS = Math.abs(denom) > 0.01 ? Math.max(0, Math.min(1, (C0 - CL) / denom)) : 0.5;
                const fL = 1 - fS;
                if (isCuSide) {
                    return {
                        phase: "α + Liquid",
                        micro: "2P_AL",
                        solidFrac: fS,
                        fracs: { label: "α solid / Liquid", a: fS, b: fL },
                        leverCL: CL, leverCS: CS
                    };
                } else {
                    return {
                        phase: "β + Liquid",
                        micro: "2P_BL",
                        solidFrac: fS,
                        fracs: { label: "β solid / Liquid", a: fS, b: fL },
                        leverCL: CL, leverCS: CS
                    };
                }
            }

            // Pure solid or pure liquid
            if (isCuSide) {
                if (C0 < Cmin) return { phase: "α (solid)", micro: "S_A", fracs: null };
                return { phase: "Liquid", micro: "L", fracs: null };
            } else {
                if (C0 > Cmax) return { phase: "β (solid)", micro: "S_B", fracs: null };
                return { phase: "Liquid", micro: "L", fracs: null };
            }
        }

        // =====================================================================
        //  BOUNDARY DETECTION
        //  FIX #5: Identify which boundary (if any) a point lies on, using
        //  pixel-space distance tolerance. Eutectic point gets special treatment.
        // =====================================================================
        const BOUNDARY_TOL = 18; // SVG pixel tolerance

        function detectBoundary(C0, T) {
            const sx = mapX(C0), sy = mapY(T);

            // Eutectic POINT
            const dEutPoint = Math.hypot(sx - mapX(C_EUT), sy - mapY(T_EUT));
            if (dEutPoint < BOUNDARY_TOL * 1.5) return "eutectic_point";

            // Eutectic LINE (horizontal at T_EUT, from α-solvus to β-solvus)
            if (Math.abs(T - T_EUT) < (BOUNDARY_TOL / SVG_H) * (T_MAX - T_MIN)
                && C0 >= C_ALPHA_MAX - 1 && C0 <= C_BETA_MIN + 1) {
                return "eutectic_line";
            }

            // Liquidus (both halves)
            const dLiqCu = distToCurve(sx, sy, LIQ_CU_X_s, LIQ_CU_Y_s);
            const dLiqAg = distToCurve(sx, sy, LIQ_AG_X_s, LIQ_AG_Y_s);
            if (Math.min(dLiqCu, dLiqAg) < BOUNDARY_TOL) return "liquidus";

            // Solidus
            const dSolCu = distToCurve(sx, sy, SOL_CU_X_s, SOL_CU_Y_s);
            const dSolAg = distToCurve(sx, sy, SOL_AG_X_s, SOL_AG_Y_s);
            if (Math.min(dSolCu, dSolAg) < BOUNDARY_TOL) return "solidus";

            // Solvus
            const dSlvCu = distToCurve(sx, sy, SLV_CU_X_s, SLV_CU_Y_s);
            const dSlvAg = distToCurve(sx, sy, SLV_AG_X_s, SLV_AG_Y_s);
            if (Math.min(dSlvCu, dSlvAg) < BOUNDARY_TOL) return "solvus";

            return null;
        }

        // =====================================================================
        //  MICROSTRUCTURE DRAWING
        // =====================================================================
        const canvas = document.getElementById('microCanvas');
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const C_ALPHA = '#e05252';
        const C_BETA = '#3b6fd4';
        const C_LIQUID = '#0284c7';
        const C_EUT_A = '#e05252';
        const C_EUT_B = '#3b6fd4';

        function seededRand(seed) {
            let s = seed;
            return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
        }
        function drawGrain(cx, cy, r, color) {
            const n = 7;
            ctx.beginPath();
            for (let i = 0; i < n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                const jitter = r * 0.18;
                const rx = r + Math.sin(i * 137) * jitter;
                const x = cx + Math.cos(angle) * rx;
                const y = cy + Math.sin(angle) * rx;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = color; ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.2; ctx.stroke();
        }
        function drawLbl(text, x, y, color) {
            ctx.font = 'bold 10px Space Mono, monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = color || '#1e293b'; ctx.fillText(text, x, y);
        }
        function drawEutBackground(lw) {
            for (let x = 0; x < W; x += lw) {
                ctx.fillStyle = Math.floor(x / lw) % 2 === 0 ? 'rgba(224,82,82,0.25)' : 'rgba(59,111,212,0.25)';
                ctx.fillRect(x, 0, lw, H);
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 3]);
            for (let x = W * 0.33; x < W; x += W * 0.33) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            ctx.setLineDash([]);
        }
        function setLegend(items) {
            document.getElementById('micro-legend').innerHTML = items.map(it =>
                `<div class="leg-item"><div class="leg-swatch" style="background:${it.color}"></div>${it.label}</div>`
            ).join('');
        }
        function drawStructure(type, solidFrac) {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#f8f9fb'; ctx.fillRect(0, 0, W, H);
            const rand = seededRand(42);

            if (type === "L") {
                ctx.fillStyle = '#e0f2fe'; ctx.fillRect(0, 0, W, H);
                ctx.strokeStyle = 'rgba(2,132,199,0.4)'; ctx.lineWidth = 1.5;
                ctx.setLineDash([5, 4]);
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.ellipse(40 + i * 50, H / 2 + (i % 2 === 0 ? -15 : 15), 28, 12, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
                drawLbl('Liquid', W / 2, H / 2, '#0284c7');
                setLegend([{ color: C_LIQUID, label: 'Liquid' }]);

            } else if (type === "S_A") {
                ctx.fillStyle = '#fef2f2'; ctx.fillRect(0, 0, W, H);
                const grains = [[55, 45, 38], [150, 42, 35], [245, 50, 40], [42, 130, 37], [130, 138, 43], [220, 133, 37], [85, H - 38, 34], [185, H - 42, 38]];
                grains.forEach(([cx, cy, r]) => drawGrain(cx, cy, r, C_ALPHA));
                grains.forEach(([cx, cy]) => drawLbl('α', cx, cy, '#7f1d1d'));
                setLegend([{ color: C_ALPHA, label: 'α (Cu-rich solid)' }]);

            } else if (type === "S_B") {
                ctx.fillStyle = '#eff6ff'; ctx.fillRect(0, 0, W, H);
                const grains = [[55, 45, 38], [150, 42, 35], [245, 50, 40], [42, 130, 37], [130, 138, 43], [220, 133, 37], [85, H - 38, 34], [185, H - 42, 38]];
                grains.forEach(([cx, cy, r]) => drawGrain(cx, cy, r, C_BETA));
                grains.forEach(([cx, cy]) => drawLbl('β', cx, cy, '#1e3a8a'));
                setLegend([{ color: C_BETA, label: 'β (Ag-rich solid)' }]);

            } else if (type === "2P_AL" || type === "2P_BL") {
                const isA = type === "2P_AL";
                const sc = isA ? C_ALPHA : C_BETA;
                const sl = isA ? 'α' : 'β';
                const tc = isA ? '#7f1d1d' : '#1e3a8a';
                ctx.fillStyle = '#e0f2fe'; ctx.fillRect(0, 0, W, H);
                const nD = Math.max(2, Math.round((solidFrac || 0.5) * 9));
                for (let i = 0; i < nD; i++) {
                    const cx = 30 + rand() * (W - 60), cy = 25 + rand() * (H - 50);
                    const r = 11 + (solidFrac || 0.5) * 20;
                    ctx.strokeStyle = sc; ctx.lineWidth = 3.5;
                    for (let arm = 0; arm < 4; arm++) {
                        const angle = (arm / 4) * Math.PI * 2;
                        const len = r * 1.5;
                        ctx.beginPath(); ctx.moveTo(cx, cy);
                        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
                        ctx.moveTo(cx + Math.cos(angle) * len * 0.5, cy + Math.sin(angle) * len * 0.5);
                        ctx.lineTo(cx + Math.cos(angle + 0.8) * len * 0.5, cy + Math.sin(angle + 0.8) * len * 0.5);
                        ctx.moveTo(cx + Math.cos(angle) * len * 0.5, cy + Math.sin(angle) * len * 0.5);
                        ctx.lineTo(cx + Math.cos(angle - 0.8) * len * 0.5, cy + Math.sin(angle - 0.8) * len * 0.5);
                        ctx.stroke();
                    }
                    drawGrain(cx, cy, r * 0.5, sc);
                    drawLbl(sl, cx, cy, tc);
                }
                drawLbl('L', W - 18, 12, '#0284c7');
                setLegend([{ color: sc, label: `${sl} dendrites` }, { color: C_LIQUID, label: 'Liquid' }]);

            } else if (type === "E") {
                drawEutBackground(6);
                [[W * 0.17, H * 0.35], [W * 0.5, H * 0.35], [W * 0.83, H * 0.35]].forEach(([x, y]) => drawLbl('α', x, y, '#7f1d1d'));
                [[W * 0.17, H * 0.65], [W * 0.5, H * 0.65], [W * 0.83, H * 0.65]].forEach(([x, y]) => drawLbl('β', x, y, '#1e3a8a'));
                setLegend([{ color: C_EUT_A, label: 'α (eutectic)' }, { color: C_EUT_B, label: 'β (eutectic)' }]);

            } else if (type === "PRO_A_E") {
                drawEutBackground(5);
                const nG = Math.max(2, Math.round((solidFrac || 0.3) * 8));
                const placed = [], r2 = seededRand(99);
                for (let i = 0; i < nG; i++) {
                    const r = 16 + r2() * 14; let cx, cy, tries = 0;
                    do { cx = r + r2() * (W - 2 * r); cy = r + r2() * (H - 2 * r); tries++; }
                    while (tries < 30 && placed.some(([px, py, pr]) => Math.hypot(cx - px, cy - py) < r + pr + 5));
                    placed.push([cx, cy, r]);
                    drawGrain(cx, cy, r, C_ALPHA); drawLbl('α', cx, cy, '#7f1d1d');
                }
                setLegend([{ color: C_ALPHA, label: 'Proeutectoid α' }, { color: C_EUT_A, label: 'α (eutectic)' }, { color: C_EUT_B, label: 'β (eutectic)' }]);

            } else if (type === "PRO_B_E") {
                drawEutBackground(5);
                const nG = Math.max(2, Math.round((solidFrac || 0.3) * 8));
                const placed = [], r2 = seededRand(77);
                for (let i = 0; i < nG; i++) {
                    const r = 16 + r2() * 14; let cx, cy, tries = 0;
                    do { cx = r + r2() * (W - 2 * r); cy = r + r2() * (H - 2 * r); tries++; }
                    while (tries < 30 && placed.some(([px, py, pr]) => Math.hypot(cx - px, cy - py) < r + pr + 5));
                    placed.push([cx, cy, r]);
                    drawGrain(cx, cy, r, C_BETA); drawLbl('β', cx, cy, '#1e3a8a');
                }
                setLegend([{ color: C_BETA, label: 'Proeutectoid β' }, { color: C_EUT_A, label: 'α (eutectic)' }, { color: C_EUT_B, label: 'β (eutectic)' }]);
            }
        }

        // =====================================================================
        //  DIAGRAM RENDERING
        // =====================================================================
        function polyline(X_arr, Y_arr, cls) {
            return `<polyline points="${X_arr.map((x, i) => `${mapX(x).toFixed(1)},${mapY(Y_arr[i]).toFixed(1)}`).join(' ')}" class="${cls}"/>`;
        }

        function drawDiagram(highlightBoundary, crossX, crossY) {
            let svg = '';

            // Grid + axes
            for (let t = 300; t <= 1000; t += 100) {
                svg += `<line x1="0" y1="${mapY(t)}" x2="${SVG_W}" y2="${mapY(t)}" class="grid"/>`;
                svg += `<text x="-10" y="${mapY(t) + 5}" class="tick-text" text-anchor="end">${t}</text>`;
            }
            for (let c = 0; c <= 100; c += 10) {
                svg += `<line x1="${mapX(c)}" y1="${SVG_H}" x2="${mapX(c)}" y2="0" class="grid"/>`;
                svg += `<text x="${mapX(c)}" y="${SVG_H + 22}" class="tick-text" text-anchor="middle">${c}</text>`;
            }
            svg += `<line x1="0" y1="${SVG_H}" x2="${SVG_W}" y2="${SVG_H}" class="axis"/>`;
            svg += `<line x1="0" y1="0" x2="0" y2="${SVG_H}" class="axis"/>`;
            svg += `<line x1="${SVG_W}" y1="0" x2="${SVG_W}" y2="${SVG_H}" class="axis"/>`;
            svg += `<text x="${SVG_W / 2}" y="${SVG_H + 55}" class="axis-label" text-anchor="middle">Composition (wt% Ag)</text>`;
            svg += `<text x="-100" y="${SVG_H / 2}" class="axis-label" transform="rotate(-90,-100,${SVG_H / 2})" text-anchor="middle">Temperature (°C)</text>`;

            // =============================================================
            // PHASE REGION FILLS — strict non-overlapping polygon tiling.
            //
            // Key principle: every shared edge uses IDENTICAL point sequences
            // from the same source array so there is zero gap or overlap.
            // Regions are painted bottom-up; later polygons do NOT extend
            // over earlier ones.
            //
            // Helpers — fixed-precision point builders
            const _pt = (c, t) => `${mapX(c).toFixed(2)},${mapY(t).toFixed(2)}`;
            const _pts = (Xa, Ya) => Xa.map((x, i) => `${mapX(x).toFixed(2)},${mapY(Ya[i]).toFixed(2)}`).join(' ');
            // Cu-solvus forward  (index 0 = near eutectic, last = T_MIN end)
            const slvCuFwd = _pts(SLV_CU_X, SLV_CU_Y);
            // Cu-solvus reversed (last → first, i.e. T_MIN end → eutectic end)
            const slvCuRev = SLV_CU_X.map((_, ii) => {
                const i = SLV_CU_X.length - 1 - ii;
                return `${mapX(SLV_CU_X[i]).toFixed(2)},${mapY(SLV_CU_Y[i]).toFixed(2)}`;
            }).join(' ');
            // Ag-solvus forward  (index 0 = near eutectic, last = T_MIN end)
            const slvAgFwd = _pts(SLV_AG_X, SLV_AG_Y);
            // Ag-solvus reversed (last → first)
            const slvAgRev = SLV_AG_X.map((_, ii) => {
                const i = SLV_AG_X.length - 1 - ii;
                return `${mapX(SLV_AG_X[i]).toFixed(2)},${mapY(SLV_AG_Y[i]).toFixed(2)}`;
            }).join(' ');
            // Cu-solidus forward (index 0 = pure-Cu top, last = eutectic end)
            const solCuFwd = _pts(SOL_CU_X, SOL_CU_Y);
            // Cu-solidus reversed
            const solCuRev = SOL_CU_X.map((_, ii) => {
                const i = SOL_CU_X.length - 1 - ii;
                return `${mapX(SOL_CU_X[i]).toFixed(2)},${mapY(SOL_CU_Y[i]).toFixed(2)}`;
            }).join(' ');
            // Ag-solidus forward (index 0 = eutectic end, last = pure-Ag top)
            const solAgFwd = _pts(SOL_AG_X, SOL_AG_Y);
            // Ag-solidus reversed
            const solAgRev = SOL_AG_X.map((_, ii) => {
                const i = SOL_AG_X.length - 1 - ii;
                return `${mapX(SOL_AG_X[i]).toFixed(2)},${mapY(SOL_AG_Y[i]).toFixed(2)}`;
            }).join(' ');

            // 1. LIQUID — above full liquidus curve
            //    Left wall top → across top → right wall top → right wall to liq end
            //    → liquidus reversed → left wall back to liq start
            svg += `<polygon points="
        ${_pt(0, T_MAX)} ${_pt(100, T_MAX)}
        ${_pts([...LIQ_X].reverse(), [...LIQ_Y].reverse())}
    " fill="rgba(220,38,38,0.14)"/>`;

            // 2. α — Cu-rich solid.
            //    Left wall from pure-Cu mp down to T_MIN,
            //    across bottom to solvus Cu last point (T_MIN end),
            //    up along Cu-solvus reversed (T_MIN → eutectic),
            //    across eutectic horizontal to C_ALPHA_MAX,
            //    up along Cu-solidus reversed (eutectic → pure-Cu),
            //    close at left wall top.
            //    This polygon is bounded on the right entirely by the solvus (below eut)
            //    and the solidus (above eut) — NEVER extends past those lines.
            svg += `<polygon points="
        ${_pt(0, SOL_CU_Y[0])}
        ${solCuFwd}
        ${_pt(C_ALPHA_MAX, T_EUT)}
        ${slvCuFwd}
        ${_pt(0, T_MIN)}
    " fill="rgba(220,38,38,0.18)"/>`;

            // 3. β — Ag-rich solid (mirror of α on right side).
            svg += `<polygon points="
        ${_pt(C_BETA_MIN, T_EUT)}
        ${solAgFwd}
        ${_pt(100, SOL_AG_Y[SOL_AG_Y.length - 1])}
        ${_pt(100, T_MIN)}
        ${slvAgRev}
    " fill="rgba(37,99,235,0.18)"/>`;

            // 4. α + β — between the two solvus curves, below eutectic.
            //    Top edge: eutectic horizontal C_ALPHA_MAX → C_BETA_MIN
            //    Right boundary: Ag-solvus forward (eutectic → T_MIN)
            //    Bottom: x=100,T_MIN → x=0,T_MIN
            //    Left boundary: Cu-solvus reversed (T_MIN → eutectic)
            //    This shares EXACT solvus point sequences with α (left) and β (right)
            //    so pixel-perfect seam — no bleed.
            svg += `<polygon points="
        ${_pt(C_ALPHA_MAX, T_EUT)}
        ${_pt(C_BETA_MIN, T_EUT)}
        ${slvAgFwd}
        ${_pt(100, T_MIN)}
        ${_pt(0, T_MIN)}
        ${slvCuRev}
    " fill="rgba(109,40,217,0.13)"/>`;

            // 5. α + L — Cu-side mushy zone (between Cu-liquidus and Cu-solidus).
            //    Along Cu-liquidus left→right (indices 0..35),
            //    down to eutectic point, across to C_ALPHA_MAX at T_EUT,
            //    up Cu-solidus reversed (eutectic → pure-Cu start).
            {
                const liqCu = _pts(LIQ_X.slice(0, 36), LIQ_Y.slice(0, 36));
                svg += `<polygon points="
            ${liqCu}
            ${_pt(C_EUT, T_EUT)}
            ${_pt(C_ALPHA_MAX, T_EUT)}
            ${solCuRev}
        " fill="rgba(251,146,60,0.22)"/>`;
            }

            // 6. β + L — Ag-side mushy zone (between Ag-liquidus and Ag-solidus).
            //    From eutectic point, along Ag-liquidus left→right (indices 35..end),
            //    down to Ag pure-melting corner, along Ag-solidus reversed (top → eutectic end),
            //    close at C_BETA_MIN, T_EUT.
            {
                const liqAg = _pts(LIQ_X.slice(35), LIQ_Y.slice(35));
                svg += `<polygon points="
            ${_pt(C_EUT, T_EUT)}
            ${liqAg}
            ${solAgRev}
            ${_pt(C_BETA_MIN, T_EUT)}
        " fill="rgba(14,165,233,0.22)"/>`;
            }

            // Highlights if on a boundary
            if (highlightBoundary === "liquidus") {
                svg += polyline(LIQ_X, LIQ_Y, 'highlight-liq');
            } else if (highlightBoundary === "solidus") {
                svg += polyline(SOL_CU_X, SOL_CU_Y, 'highlight-sol');
                svg += polyline(SOL_AG_X, SOL_AG_Y, 'highlight-sol');
            } else if (highlightBoundary === "solvus") {
                svg += polyline(SLV_CU_X, SLV_CU_Y, 'highlight-slv');
                svg += polyline(SLV_AG_X, SLV_AG_Y, 'highlight-slv');
            } else if (highlightBoundary === "eutectic_line") {
                svg += `<line x1="${mapX(C_ALPHA_MAX)}" y1="${mapY(T_EUT)}" x2="${mapX(C_BETA_MIN)}" y2="${mapY(T_EUT)}" class="highlight-eut"/>`;
            } else if (highlightBoundary === "eutectic_point") {
                svg += `<circle cx="${mapX(C_EUT)}" cy="${mapY(T_EUT)}" r="22" class="highlight-eutp"/>`;
            }

            // Curves (draw AFTER highlights so they're on top)
            svg += polyline(LIQ_X, LIQ_Y, 'line-liq');
            svg += polyline(SOL_CU_X, SOL_CU_Y, 'line-sol');
            svg += polyline(SOL_AG_X, SOL_AG_Y, 'line-sol');
            svg += polyline(SLV_CU_X, SLV_CU_Y, 'line-slv');
            svg += polyline(SLV_AG_X, SLV_AG_Y, 'line-slv');
            svg += `<line x1="${mapX(C_ALPHA_MAX)}" y1="${mapY(T_EUT)}" x2="${mapX(C_BETA_MIN)}" y2="${mapY(T_EUT)}" class="line-eut"/>`;

            // Eutectic point marker
            svg += `<circle cx="${mapX(C_EUT)}" cy="${mapY(T_EUT)}" r="5" fill="var(--accent-eut)" stroke="#ffffff" stroke-width="2"/>`;

            // Axis end-labels removed

            // Phase region labels — each placed at the visual centroid of its region,
            // well away from all boundary curves so the text is fully inside.
            //
            // Liquid:  broad open zone above liquidus → centre at ~C=50, T=1150
            // α+L:    Cu-side wedge between solidus (x≈4–8%) and liquidus (x≈15–35%)
            //          safe centroid ≈ C=12, T=1030
            // β+L:    Ag-side wedge between liquidus (x≈75–90%) and solidus (x≈92–98%)
            //          safe centroid ≈ C=85, T=940
            // α:      narrow left strip bounded by solidus (above) and solvus (below)
            //          safe centroid ≈ C=2.5, T=650  (well within solvus on the left)
            // β:      narrow right strip bounded by solidus (above) and solvus (below)
            //          safe centroid ≈ C=96.5, T=650
            // α+β:    large central band below eutectic, between the two solvus curves
            //          safe centroid ≈ C=50, T=560
            const lbl = (x, y, txt, color = '#1e293b') =>
                `<text x="${mapX(x)}" y="${mapY(y)}" class="phase-label" text-anchor="middle" fill="${color}">${txt}</text>`;

            svg += lbl(50, 1070, "Liquid", "#7f1d1d");
            svg += lbl(25, 870, "α + L", "#92400e");
            svg += lbl(87, 820, "β + L", "#164e63");
            svg += lbl(2, 820, "α", "#7f1d1d");
            svg += lbl(96.5, 770, "β", "#1e3a8a");
            svg += lbl(50, 480, "α + β", "#3b0764");

            // Curve labels — larger, repositioned so they sit cleanly on the line
            // without overflowing into another region.
            // Liquidus label: mid-curve on Cu side, above the line
            svg += `<text x="${mapX(38)}" y="${mapY(LIQ_Y[18]) - 14}" style="font-size:15px;fill:var(--accent-liq);font-family:'Space Mono';font-weight:700">Liquidus</text>`;
            // Solidus label: on the Cu solidus, to the right of the curve near mid-height
            svg += `<text x="${mapX(SOL_CU_X[6]) + 12}" y="${mapY(SOL_CU_Y[6]) + 6}" style="font-size:15px;fill:var(--accent-sol);font-family:'Space Mono';font-weight:700">Solidus</text>`;
            // Solvus label: on the Cu solvus, below mid-height (inside α region, near the line)
            svg += `<text x="${mapX(SLV_CU_X[6]) + 12}" y="${mapY(SLV_CU_Y[6]) + 6}" style="font-size:15px;fill:var(--accent-slv);font-family:'Space Mono';font-weight:700">Solvus</text>`;

            // Tie line in two-phase regions (both above and below eutectic)
            if (crossX !== null && crossY !== null) {
                const C0 = unmapX(crossX), T = unmapY(crossY);
                const res = classifyPhase(C0, T);
                if (res.leverCL !== undefined && res.leverCS !== undefined) {
                    const lx = mapX(res.leverCL), rx = mapX(res.leverCS), ty = mapY(T);
                    // Solid tie-line (no dash)
                    svg += `<line x1="${lx}" y1="${ty}" x2="${rx}" y2="${ty}" stroke="#d97706" stroke-width="2.5"/>`;
                    // Endpoint circles
                    svg += `<circle cx="${lx}" cy="${ty}" r="6" fill="#d97706" stroke="white" stroke-width="2"/>`;
                    svg += `<circle cx="${rx}" cy="${ty}" r="6" fill="#d97706" stroke="white" stroke-width="2"/>`;
                    // Labels — pick appropriate names based on region
                    const isAboveEut = T > T_EUT + 0.5;
                    const leftLabel = isAboveEut ? `C_L=${res.leverCL.toFixed(1)}` : `Cα=${res.leverCL.toFixed(1)}`;
                    const rightLabel = isAboveEut ? `C_S=${res.leverCS.toFixed(1)}` : `Cβ=${res.leverCS.toFixed(1)}`;
                    svg += `<text x="${lx}" y="${ty - 14}" style="font-size:14px;fill:#92400e;font-family:'Space Mono';font-weight:700" text-anchor="middle">${leftLabel}</text>`;
                    svg += `<text x="${rx}" y="${ty - 14}" style="font-size:14px;fill:#92400e;font-family:'Space Mono';font-weight:700" text-anchor="middle">${rightLabel}</text>`;
                }
            }

            // Crosshair + point
            if (crossX !== null) {
                svg += `<line x1="${crossX}" y1="0" x2="${crossX}" y2="${SVG_H}" stroke="rgba(30,41,59,0.2)" stroke-width="1" stroke-dasharray="4 4"/>`;
                svg += `<line x1="0" y1="${crossY}" x2="${SVG_W}" y2="${crossY}" stroke="rgba(30,41,59,0.2)" stroke-width="1" stroke-dasharray="4 4"/>`;
                svg += `<circle cx="${crossX}" cy="${crossY}" r="8" fill="none" stroke="#1e293b" stroke-width="2" opacity="0.85"/>`;
                svg += `<circle cx="${crossX}" cy="${crossY}" r="4" fill="#1e293b" opacity="0.85"/>`;
            }

            document.getElementById('diagram').innerHTML = svg;
        }

        // =====================================================================
        //  UI UPDATE
        // =====================================================================
        let currentSVGX = null, currentSVGY = null;

        function update() {
            const C0 = parseFloat(document.getElementById('comp-slider').value);
            const T = parseFloat(document.getElementById('temp-slider').value);
            document.getElementById('comp-val').textContent = C0.toFixed(1);
            document.getElementById('temp-val').textContent = T.toFixed(0);

            const sx = mapX(C0), sy = mapY(T);
            currentSVGX = sx; currentSVGY = sy;

            const result = classifyPhase(C0, T);
            const boundary = detectBoundary(C0, T);

            // Draw diagram with highlights
            drawDiagram(boundary, sx, sy);

            // Results panel
            document.getElementById('phase-name').textContent = result.phase;
            document.getElementById('r-comp').textContent = `${C0.toFixed(1)} wt% Ag`;
            document.getElementById('r-temp').textContent = `${T.toFixed(0)} °C`;

            const fracRow = document.getElementById('r-frac-row');
            const clRow = document.getElementById('r-cl-row');
            const csRow = document.getElementById('r-cs-row');

            if (result.fracs) {
                fracRow.style.display = 'flex';
                document.getElementById('r-frac-label').textContent = result.fracs.label;
                document.getElementById('r-frac-val').textContent =
                    `${(result.fracs.a * 100).toFixed(1)}% / ${(result.fracs.b * 100).toFixed(1)}%`;
            } else {
                fracRow.style.display = 'none';
            }
            if (result.leverCL !== undefined && T > T_EUT) {
                clRow.style.display = 'flex'; csRow.style.display = 'flex';
                document.getElementById('r-cl').textContent = `${result.leverCL.toFixed(2)} wt% Ag`;
                document.getElementById('r-cs').textContent = `${result.leverCS.toFixed(2)} wt% Ag`;
            } else {
                clRow.style.display = 'none'; csRow.style.display = 'none';
            }

            // Boundary tag
            const tagArea = document.getElementById('boundary-tag-area');
            if (boundary) {
                const info = {
                    liquidus: ['liq', 'On Liquidus'],
                    solidus: ['sol', 'On Solidus'],
                    solvus: ['slv', 'On Solvus'],
                    eutectic_line: ['eut', 'Eutectic Isotherm'],
                    eutectic_point: ['eutp', '★ Eutectic Point'],
                }[boundary];
                if (info) {
                    tagArea.innerHTML = `<span class="boundary-tag ${info[0]}">${info[1]}</span>`;
                }
            } else {
                tagArea.innerHTML = '';
            }

            drawStructure(result.micro, result.solidFrac);
        }

        // =====================================================================
        //  EVENT LISTENERS
        // =====================================================================
        function clientToViewBox(svgEl, clientX, clientY) {
            const pt = svgEl.createSVGPoint();
            pt.x = clientX; pt.y = clientY;
            return pt.matrixTransform(svgEl.getScreenCTM().inverse());
        }

        document.getElementById('diagram').addEventListener('mousedown', e => {
            const diagram = document.getElementById('diagram');
            const pt = clientToViewBox(diagram, e.clientX, e.clientY);
            const newC = Math.max(0, Math.min(100, unmapX(pt.x)));
            const newT = Math.max(220, Math.min(1180, unmapY(pt.y)));
            document.getElementById('comp-slider').value = newC;
            document.getElementById('temp-slider').value = newT;
            update();
        });

        document.getElementById('comp-slider').addEventListener('input', update);
        document.getElementById('temp-slider').addEventListener('input', update);

        // Initial render
        drawDiagram(null, null, null);
        update();
