const POLL_DEV_KEY = 'poll_dev_mode';

function pollDevEnabled() {
    return localStorage.getItem(POLL_DEV_KEY) === '1';
}

async function obtenerIntervaloPeticiones(pagina) {
    const hora = new Date().toTimeString().slice(0, 5);
    try {
        const res = await fetch(`php/config/getConfigPeticiones.php?pagina=${encodeURIComponent(pagina)}&hora=${encodeURIComponent(hora)}`);
        const data = await res.json();
        const intervalo = parseInt(data.intervalo_seg, 10);
        return Number.isFinite(intervalo) && intervalo > 0 ? intervalo : 10;
    } catch (e) {
        return 10;
    }
}

function iniciarPollingConfigurable(pagina, callback) {
    let timer = null;
    let stopped = false;

    async function tick() {
        if (stopped) return;
        try { await callback(); } catch (e) { console.error(e); }
        const segundos = await obtenerIntervaloPeticiones(pagina);
        if (stopped) return;
        timer = setTimeout(tick, segundos * 1000);
    }

    tick();
    const reeval = setInterval(async () => {
        if (stopped) return;
        const segundos = await obtenerIntervaloPeticiones(pagina);
        clearTimeout(timer);
        timer = setTimeout(tick, segundos * 1000);
    }, 60000);

    return function detener() {
        stopped = true;
        clearTimeout(timer);
        clearInterval(reeval);
    };
}

function crearPanelDevPeticiones(contenedorId) {
    if (!pollDevEnabled()) return;
    const cont = document.getElementById(contenedorId);
    if (!cont) return;
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;bottom:10px;right:10px;background:#111;color:#fff;padding:10px;border-radius:8px;z-index:9999;font-size:12px;';
    panel.innerHTML = '<strong>DEV PETICIONES</strong><br>Ctrl+Shift+P para ocultar';
    cont.appendChild(panel);
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        const actual = localStorage.getItem(POLL_DEV_KEY) === '1';
        localStorage.setItem(POLL_DEV_KEY, actual ? '0' : '1');
        location.reload();
    }
});
