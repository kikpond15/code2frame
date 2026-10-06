(() => {
    'use strict';

    // Paper sizes in mm (portrait).
    const PAPERS = {
        A4: [210, 297],
        A3: [297, 420],
        B5: [182, 257],
        Letter: [215.9, 279.4],
    };

    const FONTS = {
        serif: 'Georgia, "Hiragino Mincho ProN", "Yu Mincho", serif',
        sans: '"Helvetica Neue", Arial, "Hiragino Sans", "Yu Gothic", sans-serif',
        mono: 'Inconsolata, Menlo, Consolas, monospace',
    };

    const EXPORT_DPI = 300;
    const STORAGE_KEY = 'code2frame';
    const SAVED_KEYS = ['author', 'paper', 'font', 'orientation', 'color'];

    const $ = (id) => document.getElementById(id);
    const form = $('controls');
    const preview = $('preview');
    const stage = $('stage');

    const state = {
        title: '',
        author: '',
        url: '',
        image: null,
        scale: 85,
        paper: 'A4',
        font: 'serif',
        orientation: 'portrait',
        color: 'white',
    };

    // ---------- layout & drawing ----------

    function paperSize() {
        const [short, long] = PAPERS[state.paper];
        return state.orientation === 'portrait' ? [short, long] : [long, short];
    }

    let qrCache = { text: null, matrix: null };

    // Returns a 2D boolean array of QR modules, or null if there is no URL / it does not fit.
    function qrMatrix(text) {
        if (!text) return null;
        if (qrCache.text === text) return qrCache.matrix;
        let matrix = null;
        try {
            const qr = new QRCode(document.createElement('div'), {
                text,
                correctLevel: QRCode.CorrectLevel.M,
            });
            const model = qr._oQRCode;
            const n = model.getModuleCount();
            matrix = [];
            for (let r = 0; r < n; r++) {
                const row = [];
                for (let c = 0; c < n; c++) row.push(model.isDark(r, c));
                matrix.push(row);
            }
        } catch (e) {
            matrix = null;
        }
        qrCache = { text, matrix };
        return matrix;
    }

    function fitText(ctx, text, size, maxWidth) {
        ctx.font = `${size}px ${FONTS[state.font]}`;
        const w = ctx.measureText(text).width;
        if (w > maxWidth) {
            size *= maxWidth / w;
            ctx.font = `${size}px ${FONTS[state.font]}`;
        }
    }

    // Draws the whole sheet. `k` is canvas pixels per mm.
    function draw(ctx, k, { placeholder = false } = {}) {
        const [W, H] = paperSize();
        const u = Math.min(W, H) / 210; // everything scales with the paper
        const margin = 10 * u;
        const qrSize = 22 * u;
        const gap = 6 * u;
        const dark = state.color === 'black';
        const bg = dark ? '#000' : '#fff';
        const fg = dark ? '#fff' : '#000';

        ctx.setTransform(k, 0, 0, k, 0, 0);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Image: centered on the sheet, kept clear of the caption area.
        const matrix = qrMatrix(state.url);
        const urlSize = 3 * u;
        const lift = matrix ? urlSize + 2 * u : 0; // room for the URL line under the QR
        const boxW = W - margin * 2;
        const boxH = H - (margin + lift + qrSize + gap) * 2;
        if (state.image) {
            const img = state.image;
            const s = Math.min(boxW / img.width, boxH / img.height) * (state.scale / 100);
            const w = img.width * s;
            const h = img.height * s;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        } else if (placeholder) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 0.4 * u;
            ctx.setLineDash([2 * u, 2 * u]);
            ctx.strokeRect(margin, (H - boxH) / 2, boxW, boxH);
            ctx.setLineDash([]);
            ctx.fillStyle = '#999';
            ctx.font = `${6 * u}px ${FONTS.sans}`;
            ctx.textAlign = 'center';
            ctx.fillText('Drop a screenshot here', W / 2, H / 2);
            ctx.textAlign = 'left';
        }

        // Event header (config.js): top-left, inside the space kept clear above the image.
        const event = window.CODE2FRAME_EVENT;
        if (event && event.enabled && event.text) {
            ctx.fillStyle = fg;
            ctx.textBaseline = 'alphabetic';
            // "\n" in the text starts a new line; all lines share the size of the widest one.
            const lines = String(event.text).split('\n');
            ctx.font = `${6.5 * u}px ${FONTS[state.font]}`;
            const widest = lines.reduce((p, c) => (ctx.measureText(c).width > ctx.measureText(p).width ? c : p));
            fitText(ctx, widest, 6.5 * u, boxW);
            const lineHeight = parseFloat(ctx.font) * 1.35;
            const center = event.align === 'center';
            ctx.textAlign = center ? 'center' : 'left';
            lines.forEach((line, i) => {
                ctx.fillText(line, center ? W / 2 : margin, margin + 6.5 * u + i * lineHeight);
            });
            ctx.textAlign = 'left';
        }

        // Caption: title and author bottom-left.
        const textMax = W - margin * 2 - (matrix ? qrSize + gap : 0);
        const bottom = H - margin - lift;
        const authorSize = 6.5 * u;
        ctx.fillStyle = fg;
        ctx.textBaseline = 'alphabetic';
        if (state.author) {
            fitText(ctx, `by ${state.author}`, authorSize, textMax);
            ctx.fillText(`by ${state.author}`, margin, bottom - 1.5 * u);
        }
        if (state.title) {
            fitText(ctx, state.title, 9 * u, textMax);
            ctx.fillText(state.title, margin, bottom - 1.5 * u - (state.author ? authorSize * 1.6 : 0));
        }

        // QR bottom-right with its URL underneath, snapped to whole pixels so modules stay crisp.
        if (matrix) {
            fitText(ctx, state.url, urlSize, boxW);
            ctx.textAlign = 'right';
            ctx.fillText(state.url, W - margin, H - margin - 0.5 * u);
            ctx.textAlign = 'left';

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            const n = matrix.length;
            const quiet = dark ? 2 : 0; // white border so it scans on black paper
            const rawCell = (qrSize * k) / (n + quiet * 2);
            const cell = rawCell >= 4 ? Math.floor(rawCell) : rawCell; // small previews keep the true size
            const size = cell * (n + quiet * 2);
            const x0 = Math.round((W - margin) * k) - size;
            const y0 = Math.round(bottom * k) - size;
            ctx.fillStyle = '#fff';
            ctx.fillRect(x0, y0, size, size);
            ctx.fillStyle = '#000';
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (matrix[r][c]) ctx.fillRect(x0 + (c + quiet) * cell, y0 + (r + quiet) * cell, cell, cell);
                }
            }
        }
    }

    function renderPreview() {
        const [W, H] = paperSize();
        const style = getComputedStyle(stage);
        const availW = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const availH = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const cssScale = Math.min(availW / W, availH / H);
        if (!(cssScale > 0)) return;
        const dpr = window.devicePixelRatio || 1;
        preview.style.width = `${W * cssScale}px`;
        preview.style.height = `${H * cssScale}px`;
        preview.width = Math.round(W * cssScale * dpr);
        preview.height = Math.round(H * cssScale * dpr);
        draw(preview.getContext('2d'), preview.width / W, { placeholder: true });
    }

    function renderExport() {
        const [W, H] = paperSize();
        const k = EXPORT_DPI / 25.4;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(W * k);
        canvas.height = Math.round(H * k);
        draw(canvas.getContext('2d'), canvas.width / W);
        return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    }

    // ---------- state <-> UI ----------

    function readForm() {
        state.title = $('title').value.trim();
        state.author = $('author').value.trim();
        state.url = $('url').value.trim();
        state.scale = Number($('scale').value);
        state.paper = $('paper').value;
        state.font = $('font').value;
        state.orientation = form.elements.orientation.value;
        state.color = form.elements.color.value;
    }

    function update() {
        readForm();
        const [W, H] = paperSize();
        const px = (mm) => Math.round((mm * EXPORT_DPI) / 25.4);
        $('scale-out').textContent = `${state.scale}%`;
        $('size-hint').textContent = `${W} × ${H} mm · ${px(W)} × ${px(H)} px at ${EXPORT_DPI} dpi`;
        $('url-error').hidden = !(state.url && !qrMatrix(state.url));
        renderPreview();
        try {
            const saved = {};
            for (const key of SAVED_KEYS) saved[key] = state[key];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) { /* storage unavailable */ }
    }

    function restore() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) { /* storage unavailable */ }
        if (saved.author) $('author').value = saved.author;
        if (saved.paper in PAPERS) $('paper').value = saved.paper;
        if (saved.font in FONTS) $('font').value = saved.font;
        if (saved.orientation === 'landscape') form.elements.orientation.value = 'landscape';
        if (saved.color === 'black') form.elements.color.value = 'black';
    }

    function loadImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            state.image = img;
            $('file-name').textContent = file.name || 'Pasted image';
            renderPreview();
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            $('file-name').textContent = 'Could not read this image';
        };
        img.src = url;
    }

    // ---------- export ----------

    function fileName() {
        const base = (state.title || 'code2frame').replace(/[\\/:*?"<>|]+/g, '_');
        return `${base}.png`;
    }

    async function withBusy(button, task) {
        button.disabled = true;
        try {
            await task();
        } finally {
            button.disabled = false;
        }
    }

    async function download() {
        const url = URL.createObjectURL(await renderExport());
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName();
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    const pageStyle = document.head.appendChild(document.createElement('style'));

    async function print() {
        const [W, H] = paperSize();
        pageStyle.textContent = `@page { size: ${W}mm ${H}mm; margin: 0; }`;
        const img = $('print-image');
        const url = URL.createObjectURL(await renderExport());
        img.src = url;
        await img.decode();
        window.print();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ---------- events ----------

    form.addEventListener('input', update);
    form.addEventListener('submit', (e) => e.preventDefault());
    $('file').addEventListener('change', (e) => loadImage(e.target.files[0]));
    $('download').addEventListener('click', (e) => withBusy(e.currentTarget, download));
    $('print').addEventListener('click', (e) => withBusy(e.currentTarget, print));

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        document.body.classList.add('dragging');
    });
    window.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget) document.body.classList.remove('dragging');
    });
    window.addEventListener('drop', (e) => {
        e.preventDefault();
        document.body.classList.remove('dragging');
        loadImage(e.dataTransfer.files[0]);
    });
    window.addEventListener('paste', (e) => {
        const file = [...e.clipboardData.files].find((f) => f.type.startsWith('image/'));
        if (file) {
            e.preventDefault();
            loadImage(file);
        }
    });

    new ResizeObserver(renderPreview).observe(stage);
    if (document.fonts) document.fonts.addEventListener('loadingdone', renderPreview);

    restore();
    update();
})();
