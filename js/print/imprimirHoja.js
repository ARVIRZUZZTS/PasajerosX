// js/print/imprimirHoja.js
// Lienzo generico para impresion en about:blank (version global para scripts clasicos)

window.abrirHojaImpresion = function abrirHojaImpresion({ preset, ancho, alto, titulo } = {}) {
    let w = ancho, h = alto;
    if (!w || !h) {
        if (preset === 'termica80') { w = 900; h = 900; }
        else if (preset === 'termica58') { w = 900; h = 900; }
        else { w = 900; h = 900; } // default
    }
    const features = `width=${w},height=${h},scrollbars=yes,resizable=yes`;
    const win = window.open('', '_blank', features);
    if (!win) return null;
    win.document.open();
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + (titulo || 'Impresion') + '</title></head><body><p>Cargando...</p></body></html>');
    win.document.close();
    return win;
};

window.imprimirHTML = function imprimirHTML({ win, titulo, cssHref, cssCritico, html } = {}) {
    const target = win || window.abrirHojaImpresion({ titulo });
    if (!target) return null;
    const doc = target.document;
    doc.open();
    let head = `<meta charset="utf-8"><title>${esc(titulo || 'Impresion')}</title>`;
    if (cssHref) head += `<link rel="stylesheet" href="${cssHref}">`;
    if (cssCritico) head += `<style>${cssCritico}</style>`;
    doc.write(`<!DOCTYPE html><html><head>${head}</head><body>${html || ''}</body></html>`);
    doc.close();

    const cssLink = cssHref ? doc.querySelector('link[rel="stylesheet"]') : null;
    let closed = false;
    const closeOnce = () => { if (closed) return; closed = true; try { target.close(); } catch (e) {} };
    const printFn = () => {
        target.addEventListener('afterprint', closeOnce, { once: true });
        try { target.print(); } catch (e) { console.error(e); closeOnce(); }
        setTimeout(closeOnce, 1000);
    };

    if (cssLink) {
        let done = false;
        const finish = () => { if (done) return; done = true; printFn(); };
        cssLink.addEventListener('load', finish);
        cssLink.addEventListener('error', finish);
        setTimeout(finish, 1500);
    } else {
        setTimeout(printFn, 0);
    }
    return target;
};

window.esc = function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

window.num = function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
};

window.fmt = function fmt(v) {
    const n = num(v);
    return n === null ? '0.00' : n.toFixed(2);
};

window.fmtSigno = function fmtSigno(v) {
    const n = num(v);
    if (n === null) return '0.00';
    return (n < 0 ? '-' : '') + Math.abs(n).toFixed(2);
};
