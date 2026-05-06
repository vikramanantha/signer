document.addEventListener('DOMContentLoaded', () => {
    // ── Year → border color mapping ──────────────────────────────────────
    const YEAR_COLORS = {
        '2026': '#306c54',
        '2025': '#2c2f73',
        '2024': '#834399',
        '2023': '#f5a623',
        '2022': '#87ceeb',
        '2021': '#4caf50',
        '2020': '#e74c3c',
    };
    const DATE_COLOR = '#6d6e71';

    // ── DOM Elements ─────────────────────────────────────────────────────
    const monthInput = document.getElementById('month-input');
    const dayInput = document.getElementById('day-input');
    const yearInput = document.getElementById('year-input');
    const productInput = document.getElementById('product-input');
    const borderCheck = document.getElementById('border-check');
    const whiteBgCheck = document.getElementById('white-bg-check');
    const longFormCheck = document.getElementById('long-form-check');

    // Monogram sliders
    const wRatioSlider = document.getElementById('w-ratio-slider');
    const barRatioSlider = document.getElementById('bar-ratio-slider');
    const gapRatioSlider = document.getElementById('gap-ratio-slider');
    const crossbarSlider = document.getElementById('crossbar-slider');
    const vSlideSlider = document.getElementById('v-slide-slider');
    const wRatioValue = document.getElementById('w-ratio-value');
    const barRatioValue = document.getElementById('bar-ratio-value');
    const gapRatioValue = document.getElementById('gap-ratio-value');
    const crossbarValue = document.getElementById('crossbar-value');
    const vSlideValue = document.getElementById('v-slide-value');

    // Date style sliders
    const oSizeSlider = document.getElementById('o-size-slider');
    const barGapSlider = document.getElementById('bar-gap-slider');
    const barWeightSlider = document.getElementById('bar-weight-slider');
    const oOffsetSlider = document.getElementById('o-offset-slider');
    const dateOffsetSlider = document.getElementById('date-offset-slider');
    const dateLetterSpacingSlider = document.getElementById('date-letter-spacing-slider');
    const dateSpacingSlider = document.getElementById('date-spacing-slider');
    const oSizeValue = document.getElementById('o-size-value');
    const barGapValue = document.getElementById('bar-gap-value');
    const barWeightValue = document.getElementById('bar-weight-value');
    const oOffsetValue = document.getElementById('o-offset-value');
    const dateOffsetValue = document.getElementById('date-offset-value');
    const dateLetterSpacingValue = document.getElementById('date-letter-spacing-value');
    const dateSpacingValue = document.getElementById('date-spacing-value');

    // Layout sliders
    const textSizeSlider = document.getElementById('text-size-slider');
    const nameLetterSpacingSlider = document.getElementById('name-letter-spacing-slider');
    const ikramXSlider = document.getElementById('ikram-x-slider');
    const nanthaXSlider = document.getElementById('nantha-x-slider');
    const borderThicknessSlider = document.getElementById('border-thickness-slider');
    const borderRadiusSlider = document.getElementById('border-radius-slider');
    const paddingTopSlider = document.getElementById('padding-top-slider');
    const paddingRightSlider = document.getElementById('padding-right-slider');
    const paddingBottomSlider = document.getElementById('padding-bottom-slider');
    const paddingLeftSlider = document.getElementById('padding-left-slider');
    const textSizeValue = document.getElementById('text-size-value');
    const nameLetterSpacingValue = document.getElementById('name-letter-spacing-value');
    const ikramXValue = document.getElementById('ikram-x-value');
    const nanthaXValue = document.getElementById('nantha-x-value');
    const borderThicknessValue = document.getElementById('border-thickness-value');
    const borderRadiusValue = document.getElementById('border-radius-value');
    const paddingTopValue = document.getElementById('padding-top-value');
    const paddingRightValue = document.getElementById('padding-right-value');
    const paddingBottomValue = document.getElementById('padding-bottom-value');
    const paddingLeftValue = document.getElementById('padding-left-value');
    const nanthaOffsetSlider = document.getElementById('nantha-offset-slider');
    const nanthaOffsetValue = document.getElementById('nantha-offset-value');

    // Corner radius sliders
    const cornerTLSlider = document.getElementById('corner-tl-slider');
    const cornerTRSlider = document.getElementById('corner-tr-slider');
    const cornerVInnerLSlider = document.getElementById('corner-v-inner-l-slider');
    const cornerVInnerRSlider = document.getElementById('corner-v-inner-r-slider');
    const cornerBLSlider = document.getElementById('corner-bl-slider');
    const cornerBRSlider = document.getElementById('corner-br-slider');
    const cornerAInnerLSlider = document.getElementById('corner-a-inner-l-slider');
    const cornerAInnerRSlider = document.getElementById('corner-a-inner-r-slider');
    const cornerTLValue = document.getElementById('corner-tl-value');
    const cornerTRValue = document.getElementById('corner-tr-value');
    const cornerVInnerLValue = document.getElementById('corner-v-inner-l-value');
    const cornerVInnerRValue = document.getElementById('corner-v-inner-r-value');
    const cornerBLValue = document.getElementById('corner-bl-value');
    const cornerBRValue = document.getElementById('corner-br-value');
    const cornerAInnerLValue = document.getElementById('corner-a-inner-l-value');
    const cornerAInnerRValue = document.getElementById('corner-a-inner-r-value');

    // Corner radius enable checkboxes
    const cornerTLEnable = document.getElementById('corner-tl-enable');
    const cornerTREnable = document.getElementById('corner-tr-enable');
    const cornerVInnerLEnable = document.getElementById('corner-v-inner-l-enable');
    const cornerVInnerREnable = document.getElementById('corner-v-inner-r-enable');
    const cornerBLEnable = document.getElementById('corner-bl-enable');
    const cornerBREnable = document.getElementById('corner-br-enable');
    const cornerAInnerLEnable = document.getElementById('corner-a-inner-l-enable');
    const cornerAInnerREnable = document.getElementById('corner-a-inner-r-enable');

    const canvas = document.getElementById('signer-canvas');
    const ctx = canvas.getContext('2d');
    const generateBtn = document.getElementById('generate-btn');
    const downloadLink = document.getElementById('download-link');
    const colorPreview = document.getElementById('color-preview');
    const colorCtx = colorPreview.getContext('2d');

    // ── Helpers ──────────────────────────────────────────────────────────

    function hexToRgb(hex) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
        ];
    }

    function fontStr(bold, size) {
        return `${bold ? '700' : '400'} ${size}px 'Product Sans', sans-serif`;
    }

    /**
     * PIL-compatible text bounding box.
     * Returns [x0, y0, x1, y1] relative to draw point.
     * Expects ctx.textBaseline = 'top'.
     */
    function _bbox(tctx, text, font) {
        if (font) tctx.font = font;
        const m = tctx.measureText(text);
        return [
            -(m.actualBoundingBoxLeft || 0),
            -(m.actualBoundingBoxAscent || 0),
            (m.actualBoundingBoxRight || m.width),
            (m.actualBoundingBoxDescent || 0),
        ];
    }

    /**
     * Measure text width with custom per‑character spacing.
     */
    function measureSpacedText(tctx, text, font, letterSpacing) {
        if (!text) return 0;
        if (font) tctx.font = font;
        let width = 0;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const bb = _bbox(tctx, ch);
            width += (bb[2] - bb[0]);
            if (i < text.length - 1) width += letterSpacing;
        }
        return width;
    }

    function measureYearWithStylizedO(tctx, year, font, charSpacing) {
        if (!year) return 0;
        if (font) tctx.font = font;
        const yr_head = year[0];
        const yr_tail = year.slice(2);
        const w_head = measureSpacedText(tctx, yr_head, font, charSpacing);
        const w_tail = yr_tail ? measureSpacedText(tctx, yr_tail, font, charSpacing) : 0;
        const z_bb = _bbox(tctx, '0', font);
        const z_w = z_bb[2] - z_bb[0];
        const gap_before_o = charSpacing;
        const gap_after_o = yr_tail ? charSpacing : 0;
        return w_head + gap_before_o + z_w + gap_after_o + w_tail;
    }

    /**
     * Draw text one glyph at a time with custom spacing between characters.
     */
    function drawSpacedText(tctx, text, x, y, font, letterSpacing) {
        if (!text) return;
        if (font) tctx.font = font;
        let cursorX = x;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const bb = _bbox(tctx, ch);
            tctx.fillText(ch, cursorX, y);
            cursorX += (bb[2] - bb[0]);
            if (i < text.length - 1) cursorX += letterSpacing;
        }
    }

    // ── Monogram metrics helper (lightweight, no rendering) ──────────────

    function getMonogramMetrics(h, wRatio, barRatio, gapRatio, vSlide, maxCornerR = 6) {
        const w = h * wRatio;
        const gap = h * gapRatio;
        const dlen = Math.hypot(w, h);
        // A's top offset from diagonal: gap * dlen / w
        const aTopOffset = gap * dlen / w;

        // V slides diagonally along the A's left leg angle.
        // The left leg goes from (0, H) to (W, 0), so for a vertical
        // displacement of vSlide*h upward, the horizontal displacement
        // is vSlide*h * (W/H) = vSlide*w to the right.
        const vSlideY = vSlide * h;   // V moves up by this much
        const vSlideX = vSlide * w;   // V moves right by this much

        // Approximate outer pad used in makeVAMonogram so content bbox
        // matches the drawn bitmap including blur/rounding.
        const SS = 4;
        const r_ss = Math.max(2, maxCornerR * SS);
        const PAD = r_ss * 3 + 4;
        const pad = Math.floor(PAD / SS);

        return {
            vTop: 0,
            vSlideX: vSlideX,         // horizontal offset of V
            aTop: vSlideY + aTopOffset,
            totalHeight: h + vSlideY,  // A stays at bottom, V slides up
            totalWidth: w + vSlideX,   // V slides right, so total width grows
            pad,
        };
    }

    // ── Custom VA Monogram ──────────────────────────────────────────────

    function makeVAMonogram(h, fill, wRatio, barRatio, gapRatio, vSlide, crossbarPos, cornerRadii = {tl: 6, tr: 6, vil: 6, vir: 6, bl: 6, br: 6, ail: 6, air: 6}) {
        const w = h * wRatio;
        const bar = h * barRatio;
        const gap = h * gapRatio;

        // 4× supersampling for smooth rendering
        const SS = 4;
        const W = w * SS, H = h * SS, B = bar * SS, G = gap * SS;

        // V slides diagonally along the A's left leg angle.
        // Vertical component: vSlide * H upward
        // Horizontal component: vSlide * W to the right (same angle as left leg)
        const VSY = vSlide * H;  // vertical slide at 4× scale
        const VSX = vSlide * W;  // horizontal slide at 4× scale

        // PAD based on the largest corner radius requested
        const maxR = Math.max(cornerRadii.tl, cornerRadii.tr, cornerRadii.vil, cornerRadii.vir, cornerRadii.bl, cornerRadii.br, cornerRadii.ail, cornerRadii.air, 1);
        const PAD = Math.max(2, maxR * SS) * 3 + 4;

        const iw = Math.floor(W + VSX) + 2 * PAD;  // wider for horizontal slide
        const ih = Math.floor(H + VSY) + 2 * PAD;   // taller for vertical slide
        const P = PAD;

        // ── Diagonal geometry ────────────────────────────────────────
        const dlen = Math.hypot(W, H);
        const NX = H / dlen, NY = W / dlen;

        const lx = (d, y) => W - W * (y - d * NY) / H + d * NX;
        const ly = (d, x) => H * (W + d * NX - x) / W + d * NY;

        const GU = -G, GL = G, VI = -(G + B), AI = G + B;

        // ── V polygons (shifted up-right diagonally by VSX, 0) ────────
        // In canvas coords: V is at top, shifted right by VSX.
        // A is shifted down by VSY (anchored at bottom-left area).
        const v_bar = [
            [P + VSX, P],
            [P + VSX + B, P],
            [P + VSX + B, P + ly(GU, B)],
            [P + VSX, P + ly(GU, 0)],
        ];
        const v_diag = [
            [P + VSX + Math.max(B, lx(VI, 0)), P],
            [P + VSX + Math.min(W, lx(GU, 0)), P],
            [P + VSX + B, P + ly(GU, B)],
            [P + VSX + B, P + ly(VI, B)],
        ];

        // ── A polygons (shifted down by VSY, anchored at x=0) ─────────
        const a_bar = [
            [P + W, P + VSY + ly(GL, W)],
            [P + W, P + VSY + H],
            [P + W - B, P + VSY + H],
            [P + W - B, P + VSY + ly(GL, W - B)],
        ];
        const a_diag = [
            [P + W - B, P + VSY + ly(GL, W - B)],
            [P + Math.max(0, lx(GL, H)), P + VSY + H],
            [P, P + VSY + H],
            [P + Math.min(W - B, lx(AI, H)), P + VSY + H],
            [P + W - B, P + VSY + ly(AI, W - B)],
        ];

        // ── A: crossbar ──────────────────────────────────────────────
        // Free section on right leg's inner edge: from ly(AI, W-B) to H
        const free_top = ly(AI, W - B);
        const free_bottom = H;
        const free_height = free_bottom - free_top;
        const cb_center = free_top + crossbarPos * free_height;
        const cb_half = B / 2; // thickness = B (same as legs)
        const cb_y_top = Math.max(free_top, cb_center - cb_half);
        const cb_y_bot = Math.min(free_bottom, cb_center + cb_half);

        const a_xbar = [
            [P + lx(AI, cb_y_top), P + VSY + cb_y_top],
            [P + W - B, P + VSY + cb_y_top],
            [P + W - B, P + VSY + cb_y_bot],
            [P + lx(AI, cb_y_bot), P + VSY + cb_y_bot],
        ];

        const polygons = [v_bar, v_diag, a_bar, a_diag, a_xbar];

        // ── Draw mask (white on black at 4× scale) ──────────────────
        const maskC = document.createElement('canvas');
        maskC.width = iw; maskC.height = ih;
        const mc = maskC.getContext('2d');
        mc.fillStyle = '#000';
        mc.fillRect(0, 0, iw, ih);
        mc.fillStyle = '#fff';
        for (const poly of polygons) {
            mc.beginPath();
            mc.moveTo(Math.round(poly[0][0]), Math.round(poly[0][1]));
            for (let i = 1; i < poly.length; i++) {
                mc.lineTo(Math.round(poly[i][0]), Math.round(poly[i][1]));
            }
            mc.closePath();
            mc.fill();
        }

        // ── Per-corner rounding ──────────────────────────────────────
        // Start from the sharp mask, then for each enabled corner composite
        // a locally-blurred version clipped to that corner's region.
        const finalC = document.createElement('canvas');
        finalC.width = iw; finalC.height = ih;
        const fc = finalC.getContext('2d');
        fc.drawImage(maskC, 0, 0);  // start sharp

        // Corner anchor points at SS scale:
        //   TL  = outer top-left of V (left bar)
        //   TR  = outer top-right of V (diagonal)
        //   VIL = V top inner-left notch (right side of bar)
        //   VIR = V top inner-right notch (left side of diagonal)
        //   BL  = outer bottom-left of A
        //   BR  = outer bottom-right of A
        //   AIL = A inner bottom-left (inner edge of diagonal at base)
        //   AIR = A inner bottom-right (inner edge of right bar at base)
        const cornerDefs = [
            { r: cornerRadii.tl, x: P + VSX,     y: P           },
            { r: cornerRadii.tr, x: P + VSX + W, y: P           },
            { r: cornerRadii.vil, x: P + VSX + B, y: P          },
            { r: cornerRadii.vir, x: P + VSX + Math.max(B, lx(VI, 0)), y: P },
            { r: cornerRadii.bl, x: P,           y: P + VSY + H },
            { r: cornerRadii.br, x: P + W,       y: P + VSY + H },
            { r: cornerRadii.ail, x: P + Math.min(W - B, lx(AI, H)), y: P + VSY + H },
            { r: cornerRadii.air, x: P + (W - B),                    y: P + VSY + H },
        ];

        for (const corner of cornerDefs) {
            if (corner.r <= 0) continue;
            const r_ss = corner.r * SS;
            const clip_r = r_ss * 4; // large enough to cover full blur spread

            // Build a blurred+thresholded version of the full mask at this radius
            const blurC = document.createElement('canvas');
            blurC.width = iw; blurC.height = ih;
            const bc = blurC.getContext('2d');
            try { bc.filter = `blur(${r_ss}px)`; } catch (_) {}
            bc.drawImage(maskC, 0, 0);
            try { bc.filter = 'none'; } catch (_) {}

            const imgData = bc.getImageData(0, 0, iw, ih);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = d[i] > 128 ? 255 : 0;
                d[i] = d[i + 1] = d[i + 2] = v;
                d[i + 3] = 255;
            }
            bc.putImageData(imgData, 0, 0);

            // Composite: clip to a circle at the corner, then paint rounded version
            fc.save();
            fc.beginPath();
            fc.arc(corner.x, corner.y, clip_r, 0, 2 * Math.PI);
            fc.clip();
            fc.drawImage(blurC, 0, 0);
            fc.restore();
        }

        // ── Downscale (LANCZOS-like via high quality) ────────────────
        const ow = Math.floor(iw / SS), oh = Math.floor(ih / SS);
        const outC = document.createElement('canvas');
        outC.width = ow; outC.height = oh;
        const oc = outC.getContext('2d');
        oc.imageSmoothingEnabled = true;
        oc.imageSmoothingQuality = 'high';
        oc.drawImage(finalC, 0, 0, ow, oh);

        // ── Colorize: red channel → alpha, apply fill color ──────────
        const outData = oc.getImageData(0, 0, ow, oh);
        const od = outData.data;
        const [cr, cg, cb_color] = hexToRgb(fill);
        for (let i = 0; i < od.length; i += 4) {
            const alpha = od[i]; // red channel = mask intensity
            od[i] = cr;
            od[i + 1] = cg;
            od[i + 2] = cb_color;
            od[i + 3] = alpha;
        }
        oc.putImageData(outData, 0, 0);

        return {
            canvas: outC,
            pad: Math.floor(PAD / SS),
        };
    }

    // ── Core sticker generation ─────────────────────────────────────────

    function generateSticker({
        month = '', day = '', year = '', product = '',
        hasBorder = true, whiteBg = true, longForm = true,
        wRatio = 0.70, barRatio = 0.130, gapRatio = 0.088,
        vSlide = 0.19, crossbarPos = 0.60,
        oSize = 0.80, barGap = 0.127, barWeight = 0.130, oOffset = -0.19, dateOffset = 0.00,
        textSize = 213,
        paddingTop = 46, paddingRight = 113, paddingBottom = 46, paddingLeft = 9,
        nanthaOffset = 0.18,
        nameLetterSpacingFactor = 0.135,
        dateLetterSpacingFactor = 0.135,
        dateSpacingFactor = 1.01,
        ikramOffsetX = -0.10, nanthaOffsetX = 0.15,
        borderThickness = 35, borderRadius = 52,
        cornerTL = 6, cornerTR = 6, cornerVInnerL = 6, cornerVInnerR = 6, cornerBL = 6, cornerBR = 6, cornerAInnerL = 6, cornerAInnerR = 6,
    }) {
        // ── Sizing constants ─────────────────────────────────────────
        const VA_HEIGHT = 420;
        const SMALL     = textSize;
        const BORDER_W  = borderThickness;
        const BORDER_R  = borderRadius;
        const INNER_GAP = 14;
        const INNER_R   = 38;
        const LETTER_GAP = 5;

        // ── Scratch canvas for measurements ──────────────────────────
        const sc = document.createElement('canvas');
        sc.width = 1; sc.height = 1;
        const sd = sc.getContext('2d');
        sd.textBaseline = 'top';

        const fs = fontStr(true, SMALL);
        const NAME_LETTER_SPACING = SMALL * nameLetterSpacingFactor;

        // ── Monogram metrics (for layout, before rendering) ──────────
        const maxCornerR = Math.max(cornerTL, cornerTR, cornerVInnerL, cornerVInnerR, cornerBL, cornerBR, cornerAInnerL, cornerAInnerR);
        const metrics = getMonogramMetrics(VA_HEIGHT, wRatio, barRatio, gapRatio, vSlide, maxCornerR);
        const va_w = metrics.totalWidth;   // includes horizontal slide
        const va_h = metrics.totalHeight;  // includes vertical slide
        const va_base_w = VA_HEIGHT * wRatio; // base monogram width (no slide)

        // Text alignment: top of "ikram" aligns with V top,
        //                  top of "nantha" aligns with A top
        const v_xheight_y = metrics.vTop;   // = 0
        const a_xheight_y = metrics.aTop;   // where A starts

        let ik_bb, na_bb, ik_w, na_w;
        if (longForm) {
            ik_bb = _bbox(sd, 'ikram', fs);
            na_bb = _bbox(sd, 'nantha', fs);
            ik_w = measureSpacedText(sd, 'ikram', fs, NAME_LETTER_SPACING);
            na_w = measureSpacedText(sd, 'nantha', fs, NAME_LETTER_SPACING);
        } else {
            ik_w = na_w = 0;
        }

        // ── Text block dimensions ────────────────────────────────────
        // "ikram" is placed after the V (which is shifted right by vSlideX)
        // "nantha" is placed after the A (which starts at x=0, base width)
        let line1_w, line2_w;
        if (longForm) {
            // V right edge = vSlideX + base_w; "ikram" starts after that
            line1_w = metrics.vSlideX + va_base_w + LETTER_GAP + ik_w;
            // A right edge = base_w; "nantha" starts after that
            line2_w = va_base_w + LETTER_GAP + na_w;
        } else {
            line1_w = va_w;
            line2_w = va_w;
        }
        const text_block_w = Math.max(line1_w, line2_w);

        // ── Layout positions (relative to origin 0,0) ────────────────
        const va_x = 0, va_y = 0;
        
        // Anchor points for padding measurement (actual visual edges, not including pad)
        const anchor_top = va_y;  // top of V
        const anchor_left = va_x; // left of V
        const anchor_bottom = va_y + va_h; // bottom of A
        let anchor_right; // right of "nantha" (calculated below)

        let ik_draw_x, ik_draw_y, ik_rendered;
        let na_draw_x, na_draw_y, na_rendered;

        if (longForm) {
            // Top of "ikram" aligns with V top; V is shifted right by vSlideX
            ik_draw_y = va_y + v_xheight_y - ik_bb[1];
            ik_draw_x = va_x + metrics.vSlideX + va_base_w + LETTER_GAP + ikramOffsetX * SMALL;
            ik_rendered = [
                ik_draw_x + ik_bb[0], ik_draw_y + ik_bb[1],
                ik_draw_x + ik_bb[2], ik_draw_y + ik_bb[3],
            ];

            // Top of "nantha" aligns with A top; A starts at x=0
            na_draw_y = va_y + a_xheight_y - na_bb[1] + nanthaOffset * SMALL;
            na_draw_x = va_x + va_base_w + LETTER_GAP + nanthaOffsetX * SMALL;
            na_rendered = [
                na_draw_x + na_bb[0], na_draw_y + na_bb[1],
                na_draw_x + na_bb[2], na_draw_y + na_bb[3],
            ];
            anchor_right = na_rendered[2]; // right edge of "nantha"
        } else {
            anchor_right = va_x + va_w; // right edge of monogram
        }

        // A_rendered: actual A section bounds for date positioning
        const A_rendered = [va_x, va_y + metrics.aTop, va_x + va_base_w, va_y + va_h];

        // ── Content bounding box (for layout calculations, includes pad for rendering)
        const VA_rendered = [
            va_x - metrics.pad,
            va_y - metrics.pad,
            va_x + va_w + metrics.pad,
            va_y + va_h + metrics.pad,
        ];
        let content_top = 0, content_left = 0;
        let content_right, content_bottom;
        if (longForm) {
            content_left   = Math.min(VA_rendered[0], ik_rendered[0], na_rendered[0]);
            content_top    = Math.min(VA_rendered[1], ik_rendered[1], na_rendered[1]);
            content_right  = Math.max(VA_rendered[2], ik_rendered[2], na_rendered[2]);
            content_bottom = Math.max(VA_rendered[3], ik_rendered[3], na_rendered[3]);
        } else {
            content_right  = VA_rendered[2];
            content_bottom = VA_rendered[3];
        }

        // ── Date measurement ─────────────────────────────────────────
        const has_date = !!(month || day || year) && longForm;
        let date_region_top, date_region_bot, date_avail_h;
        let date_prefix, full_date, dfs, fd, d_bb, dh, dw;
        let date_x_start;
        let dt;

        if (has_date && year) {
            if (longForm) {
                // Gap strictly under "nantha" down to bottom of A
                date_region_top = na_rendered[3] + 3;
            date_region_bot = A_rendered[3];
            } else {
                // Non-long-form: keep using the A body as the date band
                date_region_top = A_rendered[1] + (A_rendered[3] - A_rendered[1]) * 0.45;
                date_region_bot = A_rendered[3];
            }
            date_avail_h = date_region_bot - date_region_top;

            // Build date string
            date_prefix = '';
            if (month) date_prefix += month;
            if (day) date_prefix += ' ' + day;
            if (date_prefix) date_prefix += ' ';
            full_date = date_prefix + year;

            // Find font size that fits (height constraint first)
            dfs = Math.max(20, Math.floor(date_avail_h * 1.8));
            fd = fontStr(true, dfs);
            d_bb = _bbox(sd, (month || '') + (day || '') + (year || ''), fd);
            dh = d_bb[3] - d_bb[1];
            while (dh > date_avail_h && dfs > 20) {
                dfs--;
                fd = fontStr(true, dfs);
                d_bb = _bbox(sd, (month || '') + (day || '') + (year || ''), fd);
                dh = d_bb[3] - d_bb[1];
            }

            // Width: shrink date font to keep it inside the existing sticker width.
            // Letter spacing is included in this measurement so adding content or spacing
            // can trigger a downscale, preserving overall width.
            const DATE_CHAR_SPACING = dfs * dateLetterSpacingFactor;
            const DATE_TOKEN_GAP = dfs * 0.33 * dateSpacingFactor;
            if (longForm) {
                date_x_start = na_rendered[0];
            } else {
                date_x_start = A_rendered[2] + LETTER_GAP;
            }
            const max_date_w = content_right - date_x_start + 10;
            const measureDateW = () => {
                const parts = [];
                if (month) parts.push(measureSpacedText(sd, month, fd, DATE_CHAR_SPACING));
                if (day) parts.push(measureSpacedText(sd, day, fd, DATE_CHAR_SPACING));
                if (year) parts.push(measureYearWithStylizedO(sd, year, fd, DATE_CHAR_SPACING));
                if (!parts.length) return 0;
                return parts.reduce((a, b) => a + b, 0) + DATE_TOKEN_GAP * (parts.length - 1);
            };
            dw = measureDateW();
            while (dw > max_date_w && dfs > 20) {
                dfs--;
                fd = fontStr(true, dfs);
                d_bb = _bbox(sd, (month || '') + (day || '') + (year || ''), fd);
                dh = d_bb[3] - d_bb[1];
                // recompute spacings at the new font size
                const DATE_CHAR_SPACING_NOW = dfs * dateLetterSpacingFactor;
                const DATE_TOKEN_GAP_NOW = dfs * 0.33 * dateSpacingFactor;
                const parts = [];
                if (month) parts.push(measureSpacedText(sd, month, fd, DATE_CHAR_SPACING_NOW));
                if (day) parts.push(measureSpacedText(sd, day, fd, DATE_CHAR_SPACING_NOW));
                if (year) parts.push(measureYearWithStylizedO(sd, year, fd, DATE_CHAR_SPACING_NOW));
                dw = parts.reduce((a, b) => a + b, 0) + (parts.length > 1 ? DATE_TOKEN_GAP_NOW * (parts.length - 1) : 0);
            }
        } else if (has_date && !year) {
            dt = '';
            if (month) dt += month;
            if (day) dt += ' ' + day;
            dt = dt.trim();
        }

        // ── Product measurement ──────────────────────────────────────
        const has_product = !!(product && product.trim());
        const product_gap = 15;
        let prod_fs, fp, p_bb, pw, product_h = 0;

        if (has_product) {
            prod_fs = 110;
            fp = fontStr(true, prod_fs);
            p_bb = _bbox(sd, product, fp);
            pw = p_bb[2] - p_bb[0];
            while (pw > text_block_w && prod_fs > 20) {
                prod_fs -= 2;
                fp = fontStr(true, prod_fs);
                p_bb = _bbox(sd, product, fp);
                pw = p_bb[2] - p_bb[0];
            }
            product_h = (p_bb[3] - p_bb[1]) + product_gap;
        }

        // ── Canvas size ──────────────────────────────────────────────
        const bt = hasBorder ? (BORDER_W + INNER_GAP) : 0;
        
        // Calculate canvas size based on anchor points + padding
        const anchor_w = anchor_right - anchor_left;
        const anchor_h = anchor_bottom - anchor_top + (has_product ? product_h : 0);
        
        const canvas_w = Math.floor(anchor_w + paddingLeft + paddingRight + 2 * bt);
        const canvas_h = Math.floor(anchor_h + paddingTop + paddingBottom + 2 * bt);

        // ── Create output canvas ─────────────────────────────────────
        const outC = document.createElement('canvas');
        outC.width = canvas_w;
        outC.height = canvas_h;
        const oc = outC.getContext('2d');
        oc.textBaseline = 'top';

        // NOTE: We keep the canvas fully transparent by default.
        // Any white background is drawn only inside a rounded shape so that
        // the small slivers outside the border remain transparent.

        // ── Draw border ──────────────────────────────────────────────
        if (hasBorder) {
            const borderColor = YEAR_COLORS[year] || '#333333';
            const hw = BORDER_W / 2;

            // Outer border stroke
            oc.strokeStyle = borderColor;
            oc.lineWidth = BORDER_W;
            oc.beginPath();
            oc.roundRect(hw, hw, canvas_w - 2 * hw, canvas_h - 2 * hw, BORDER_R + INNER_GAP);
            oc.stroke();
        }

        // ── White panel (optional) ───────────────────────────────────
        // When whiteBg is enabled, fill a rounded rectangle; outside that
        // shape stays transparent. If there is no border, we still keep
        // the same general rounded shape.
        if (whiteBg) {
            // Keep white panel flush with the border's inner edge (no transparent gap).
            const im = hasBorder ? BORDER_W : INNER_GAP;
            const x = im;
            const y = im;
            const w = canvas_w - 2 * im;
            const h = canvas_h - 2 * im;
            const panelRadius = hasBorder
                ? Math.max(0, (BORDER_R + INNER_GAP) - (BORDER_W / 2))
                : INNER_R;
            oc.fillStyle = '#ffffff';
            oc.beginPath();
            oc.roundRect(x, y, w, h, panelRadius);
            oc.fill();
        }

        // ── Content offset ───────────────────────────────────────────
        // Position anchor points at the specified padding distances from inner border
        const ox = bt + paddingLeft - anchor_left;
        const oy = bt + paddingTop - anchor_top;

        // ── Draw VA monogram ─────────────────────────────────────────
        const vaResult = makeVAMonogram(
            VA_HEIGHT,
            '#000000',
            wRatio,
            barRatio,
            gapRatio,
            vSlide,
            crossbarPos,
            { tl: cornerTL, tr: cornerTR, vil: cornerVInnerL, vir: cornerVInnerR, bl: cornerBL, br: cornerBR, ail: cornerAInnerL, air: cornerAInnerR }
        );
        const paste_x = Math.floor(va_x + ox) - vaResult.pad;
        const paste_y = Math.floor(va_y + oy) - vaResult.pad;
        oc.drawImage(vaResult.canvas, paste_x, paste_y);

        // ── Draw "ikram" ─────────────────────────────────────────────
        if (longForm) {
            oc.font = fs;
            oc.fillStyle = '#000000';
            drawSpacedText(oc, 'ikram', ik_draw_x + ox, ik_draw_y + oy, fs, NAME_LETTER_SPACING);
        }

        // ── Draw "nantha" ────────────────────────────────────────────
        if (longForm) {
            oc.font = fs;
            oc.fillStyle = '#000000';
            drawSpacedText(oc, 'nantha', na_draw_x + ox, na_draw_y + oy, fs, NAME_LETTER_SPACING);
        }

        // ── Draw date ────────────────────────────────────────────────
        if (has_date && year) {
            let date_x;
            if (longForm) {
                date_x = na_rendered[0] + ox;
            } else {
                date_x = A_rendered[2] + LETTER_GAP + ox;
            }

            // For long-form: center the date in the vertical gap
            // between the bottom of "nantha" and the bottom of the A,
            // so it's clearly under "nantha" but not sitting on the A's base.
            let date_draw_y;
            if (longForm) {
                const gap_center = (date_region_top + date_region_bot) / 2;
                const text_center = (d_bb[1] + d_bb[3]) / 2;
                date_draw_y = (gap_center + oy) - text_center;
            } else {
                // Non-long-form: keep the previous top alignment within A-body band
                date_draw_y = (date_region_top + oy) - d_bb[1];
            }
            date_draw_y += Math.floor(dfs * dateOffset);

            const DATE_CHAR_SPACING = dfs * dateLetterSpacingFactor;
            const DATE_TOKEN_GAP = dfs * 0.33 * dateSpacingFactor;

            let cur_x = date_x;

            // Month token
            if (month) {
                oc.font = fd;
                oc.fillStyle = DATE_COLOR;
                drawSpacedText(oc, month, cur_x, date_draw_y, fd, DATE_CHAR_SPACING);
                cur_x += measureSpacedText(sd, month, fd, DATE_CHAR_SPACING);
                if (day || year) cur_x += DATE_TOKEN_GAP;
            }

            // Day token
            if (day) {
                oc.font = fd;
                oc.fillStyle = DATE_COLOR;
                drawSpacedText(oc, day, cur_x, date_draw_y, fd, DATE_CHAR_SPACING);
                cur_x += measureSpacedText(sd, day, fd, DATE_CHAR_SPACING);
                if (year) cur_x += DATE_TOKEN_GAP;
            }

            // Year token (stylized "o" replacing the 0)
            if (year) {
                const yr_head = year[0];
                const yr_tail = year.slice(2);

                // head digit
                oc.font = fd;
                oc.fillStyle = DATE_COLOR;
                drawSpacedText(oc, yr_head, cur_x, date_draw_y, fd, DATE_CHAR_SPACING);
                cur_x += measureSpacedText(sd, yr_head, fd, DATE_CHAR_SPACING);

                // slot spacing between head and stylized "o"
                cur_x += DATE_CHAR_SPACING;

                // Part 2: small "o" with underline (replaces the "0" in the year)
                const o_fs = Math.floor(dfs * oSize);
                const fo = fontStr(true, o_fs);
                const o_bb = _bbox(sd, 'o', fo);
                const o_w = o_bb[2] - o_bb[0];

                // Measure the "0" glyph in the date font for proper spacing
                const z_bb = _bbox(sd, '0', fd);
                const z_w = z_bb[2] - z_bb[0];

                const o_slot_x = cur_x;

                // Default position: bottom-align "o" with the date digits
                // Then apply vertical offset
                const o_draw_y_default = date_draw_y + d_bb[3] - o_bb[3];
                const o_draw_y = o_draw_y_default + Math.floor(dfs * oOffset);

                // Center "o" horizontally in the space a "0" would take
                const o_pad = (z_w - o_w) / 2;
                const o_x = o_slot_x + o_pad;

                oc.font = fo;
                oc.fillStyle = DATE_COLOR;
                oc.fillText('o', o_x, o_draw_y);

                // Underline right below the "o"
                const o_rendered_bottom = o_draw_y + o_bb[3];
                const ul_gap = Math.max(1, Math.floor(dfs * barGap));
                const ul_y = o_rendered_bottom + ul_gap;
                const ul_w = Math.max(2, Math.floor(dfs * barWeight));

                // Center the underline in the "0" space
                const ul_center_x = o_slot_x + z_w / 2;
                const ul_half_w = o_w / 2;

                oc.strokeStyle = DATE_COLOR;
                oc.lineWidth = ul_w;
                oc.lineCap = 'butt';
                oc.beginPath();
                oc.moveTo(ul_center_x - ul_half_w, ul_y);
                oc.lineTo(ul_center_x + ul_half_w, ul_y);
                oc.stroke();

                cur_x = o_slot_x + z_w;

                // slot spacing between stylized "o" and the tail digits
                if (yr_tail) cur_x += DATE_CHAR_SPACING;

                // tail digits
                if (yr_tail) {
                    oc.font = fd;
                    oc.fillStyle = DATE_COLOR;
                    drawSpacedText(oc, yr_tail, cur_x, date_draw_y, fd, DATE_CHAR_SPACING);
                }
            }

        } else if (has_date && !year && dt) {
            if (longForm) {
                const date_x_noyear = na_rendered[0] + ox;
                const dr_top = na_rendered[3] + 3;
                const dr_bot = A_rendered[3];
                const da_h = dr_bot - dr_top;

                let dfs2 = Math.max(20, Math.floor(da_h * 1.8));
                let fd2 = fontStr(true, dfs2);
                const DATE_CHAR_SPACING2 = dfs2 * dateLetterSpacingFactor;
                const DATE_TOKEN_GAP2 = dfs2 * 0.33 * dateSpacingFactor;
                let d2_bb = _bbox(sd, dt, fd2);
                let dh2 = d2_bb[3] - d2_bb[1];
                while (dh2 > da_h && dfs2 > 20) {
                    dfs2--;
                    fd2 = fontStr(true, dfs2);
                    d2_bb = _bbox(sd, dt, fd2);
                    dh2 = d2_bb[3] - d2_bb[1];
                }

                const ddy = (dr_bot + oy) - d2_bb[3] + Math.floor(dfs2 * dateOffset);
                oc.font = fd2;
                oc.fillStyle = DATE_COLOR;
                let curx = date_x_noyear;
                if (month) {
                    drawSpacedText(oc, month, curx, ddy, fd2, DATE_CHAR_SPACING2);
                    curx += measureSpacedText(sd, month, fd2, DATE_CHAR_SPACING2);
                    if (day) curx += DATE_TOKEN_GAP2;
                }
                if (day) {
                    drawSpacedText(oc, day, curx, ddy, fd2, DATE_CHAR_SPACING2);
                }
            }
        }

        // ── Draw product name ────────────────────────────────────────
        if (has_product) {
            const p_y = (content_bottom + oy) + product_gap - p_bb[1];
            oc.font = fp;
            oc.fillStyle = DATE_COLOR;
            oc.fillText(product, bt + paddingLeft, p_y);
        }

        // ── Crop transparent ─────────────────────────────────────────
        if (!whiteBg && !hasBorder) {
            const cropData = oc.getImageData(0, 0, canvas_w, canvas_h);
            const cd = cropData.data;
            let minX = canvas_w, minY = canvas_h, maxX = 0, maxY = 0;
            for (let y = 0; y < canvas_h; y++) {
                for (let x = 0; x < canvas_w; x++) {
                    if (cd[(y * canvas_w + x) * 4 + 3] > 0) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX > minX && maxY > minY) {
                const p = 8;
                minX = Math.max(0, minX - p);
                minY = Math.max(0, minY - p);
                maxX = Math.min(canvas_w, maxX + p);
                maxY = Math.min(canvas_h, maxY + p);
                const cw = maxX - minX, ch = maxY - minY;
                const cropped = oc.getImageData(minX, minY, cw, ch);
                outC.width = cw;
                outC.height = ch;
                oc.putImageData(cropped, 0, 0);
            }
        }

        return outC;
    }

    // ── UI Functions ─────────────────────────────────────────────────────

    function getParams() {
        return {
            month: monthInput.value.trim(),
            day: dayInput.value.trim(),
            year: yearInput.value.trim(),
            product: productInput.value.trim(),
            hasBorder: borderCheck.checked,
            whiteBg: whiteBgCheck.checked,
            longForm: longFormCheck.checked,
            wRatio: parseFloat(wRatioSlider.value),
            barRatio: parseFloat(barRatioSlider.value),
            gapRatio: parseFloat(gapRatioSlider.value),
            crossbarPos: parseFloat(crossbarSlider.value),
            vSlide: parseFloat(vSlideSlider.value),
            oSize: parseFloat(oSizeSlider.value),
            barGap: parseFloat(barGapSlider.value),
            barWeight: parseFloat(barWeightSlider.value),
            oOffset: parseFloat(oOffsetSlider.value),
            dateOffset: parseFloat(dateOffsetSlider.value),
            textSize: parseInt(textSizeSlider.value),
            nameLetterSpacingFactor: parseFloat(nameLetterSpacingSlider.value),
            dateLetterSpacingFactor: parseFloat(dateLetterSpacingSlider.value),
            dateSpacingFactor: parseFloat(dateSpacingSlider.value),
            ikramOffsetX: parseFloat(ikramXSlider.value),
            nanthaOffsetX: parseFloat(nanthaXSlider.value),
            paddingTop: parseInt(paddingTopSlider.value),
            paddingRight: parseInt(paddingRightSlider.value),
            paddingBottom: parseInt(paddingBottomSlider.value),
            paddingLeft: parseInt(paddingLeftSlider.value),
            nanthaOffset: parseFloat(nanthaOffsetSlider.value),
            borderThickness: parseInt(borderThicknessSlider.value),
            borderRadius: parseInt(borderRadiusSlider.value),
            cornerTL: cornerTLEnable.checked ? parseInt(cornerTLSlider.value) : 0,
            cornerTR: cornerTREnable.checked ? parseInt(cornerTRSlider.value) : 0,
            cornerVInnerL: cornerVInnerLEnable.checked ? parseInt(cornerVInnerLSlider.value) : 0,
            cornerVInnerR: cornerVInnerREnable.checked ? parseInt(cornerVInnerRSlider.value) : 0,
            cornerBL: cornerBLEnable.checked ? parseInt(cornerBLSlider.value) : 0,
            cornerBR: cornerBREnable.checked ? parseInt(cornerBRSlider.value) : 0,
            cornerAInnerL: cornerAInnerLEnable.checked ? parseInt(cornerAInnerLSlider.value) : 0,
            cornerAInnerR: cornerAInnerREnable.checked ? parseInt(cornerAInnerRSlider.value) : 0,
        };
    }

    function updateSliderLabels() {
        wRatioValue.textContent = parseFloat(wRatioSlider.value).toFixed(2);
        barRatioValue.textContent = parseFloat(barRatioSlider.value).toFixed(3);
        gapRatioValue.textContent = parseFloat(gapRatioSlider.value).toFixed(3);
        crossbarValue.textContent = parseFloat(crossbarSlider.value).toFixed(2);
        vSlideValue.textContent = parseFloat(vSlideSlider.value).toFixed(2);
        oSizeValue.textContent = parseFloat(oSizeSlider.value).toFixed(2);
        barGapValue.textContent = parseFloat(barGapSlider.value).toFixed(3);
        barWeightValue.textContent = parseFloat(barWeightSlider.value).toFixed(3);
        oOffsetValue.textContent = parseFloat(oOffsetSlider.value).toFixed(2);
        dateOffsetValue.textContent = parseFloat(dateOffsetSlider.value).toFixed(2);
        dateLetterSpacingValue.textContent = parseFloat(dateLetterSpacingSlider.value).toFixed(3);
        dateSpacingValue.textContent = parseFloat(dateSpacingSlider.value).toFixed(2);
        textSizeValue.textContent = textSizeSlider.value;
        nameLetterSpacingValue.textContent = parseFloat(nameLetterSpacingSlider.value).toFixed(3);
        ikramXValue.textContent = parseFloat(ikramXSlider.value).toFixed(2);
        nanthaXValue.textContent = parseFloat(nanthaXSlider.value).toFixed(2);
        paddingTopValue.textContent = paddingTopSlider.value;
        paddingRightValue.textContent = paddingRightSlider.value;
        paddingBottomValue.textContent = paddingBottomSlider.value;
        paddingLeftValue.textContent = paddingLeftSlider.value;
        borderThicknessValue.textContent = borderThicknessSlider.value;
        borderRadiusValue.textContent = borderRadiusSlider.value;
        nanthaOffsetValue.textContent = parseFloat(nanthaOffsetSlider.value).toFixed(2);
        cornerTLValue.textContent = cornerTLSlider.value;
        cornerTRValue.textContent = cornerTRSlider.value;
        cornerVInnerLValue.textContent = cornerVInnerLSlider.value;
        cornerVInnerRValue.textContent = cornerVInnerRSlider.value;
        cornerBLValue.textContent = cornerBLSlider.value;
        cornerBRValue.textContent = cornerBRSlider.value;
        cornerAInnerLValue.textContent = cornerAInnerLSlider.value;
        cornerAInnerRValue.textContent = cornerAInnerRSlider.value;
    }

    function updateColorPreview() {
        const year = yearInput.value.trim();
        const color = YEAR_COLORS[year] || '#333333';
        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, 60, 20);
    }

    let renderPending = false;

    function scheduleRender() {
        if (renderPending) return;
        renderPending = true;
        requestAnimationFrame(() => {
            renderPending = false;
            render();
        });
    }

    function render() {
        try {
            const params = getParams();
            const result = generateSticker(params);

            // Display on canvas
            canvas.width = result.width;
            canvas.height = result.height;
            ctx.drawImage(result, 0, 0);

            // Toggle checkerboard background for transparent previews
            if (!params.whiteBg) {
                canvas.classList.add('transparent-bg');
            } else {
                canvas.classList.remove('transparent-bg');
            }

            // Update download link
            const parts = ['VA'];
            if (params.month) parts.push(params.month);
            if (params.day) parts.push(params.day);
            if (params.year) parts.push(params.year);
            if (params.product) parts.push(params.product);
            const fname = parts.join('-') + '.png';

            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.download = fname;
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'Download Sticker';
        } catch (e) {
            console.error('Render error:', e);
        }
    }

    // ── Event Listeners ──────────────────────────────────────────────────

    // Text inputs → live re-render
    [monthInput, dayInput, yearInput, productInput].forEach(el => {
        el.addEventListener('input', () => {
            updateColorPreview();
            scheduleRender();
        });
    });

    // Checkboxes → re-render
    [borderCheck, whiteBgCheck, longFormCheck].forEach(el => {
        el.addEventListener('change', scheduleRender);
    });

    // Sliders → update labels + re-render
    [wRatioSlider, barRatioSlider, gapRatioSlider, crossbarSlider, vSlideSlider,
     oSizeSlider, barGapSlider, barWeightSlider, oOffsetSlider, dateOffsetSlider, dateLetterSpacingSlider, dateSpacingSlider,
     textSizeSlider, nameLetterSpacingSlider,
     ikramXSlider, nanthaXSlider,
     borderThicknessSlider, borderRadiusSlider,
     paddingTopSlider, paddingRightSlider, paddingBottomSlider, paddingLeftSlider,
     nanthaOffsetSlider,
     cornerTLSlider, cornerTRSlider, cornerVInnerLSlider, cornerVInnerRSlider,
     cornerBLSlider, cornerBRSlider, cornerAInnerLSlider, cornerAInnerRSlider,
     cornerTLEnable, cornerTREnable, cornerVInnerLEnable, cornerVInnerREnable,
     cornerBLEnable, cornerBREnable, cornerAInnerLEnable, cornerAInnerREnable].forEach(el => {
        el.addEventListener('input', () => {
            updateSliderLabels();
            scheduleRender();
        });
    });

    // Generate button
    generateBtn.addEventListener('click', render);

    // ── Initial render ───────────────────────────────────────────────────
    updateSliderLabels();
    updateColorPreview();

    // Wait for Product Sans font to load, then render
    document.fonts.ready.then(() => {
        render();
    });
});
