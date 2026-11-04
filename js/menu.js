const DEV_MODE_KEY = 'menu_dev_mode';
const DEV_DATE_KEY = 'menu_dev_date';

function todayDDMMYYYY() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function toFlatpickrDate(ddmmyyyy) {
    const [dia, mes, anio] = ddmmyyyy.split('/');
    return `${anio}-${mes}-${dia}`;
}

let devMode = localStorage.getItem(DEV_MODE_KEY) === '1';
let fechaSeleccionada = devMode && localStorage.getItem(DEV_DATE_KEY)
    ? localStorage.getItem(DEV_DATE_KEY)
    : todayDDMMYYYY();

if (devMode && !localStorage.getItem(DEV_DATE_KEY)) {
    localStorage.setItem(DEV_DATE_KEY, fechaSeleccionada);
}

let fpInstance = null;

function actualizarFechaHora() {
    const ahora = new Date();

    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const fechaEl = document.getElementById('fecha');
    const horaEl = document.getElementById('hora');
    if (fechaEl) fechaEl.textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
    if (horaEl) horaEl.textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

function updateDevBadge(on) {
    let badge = document.getElementById('dev-badge');
    if (on) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'dev-badge';
            badge.textContent = 'MODO DEV';
            badge.style.cssText = 'background:#ffeb3b;color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;margin-left:8px;';
            const headerDiv = document.querySelector('#app-header header div') || document.querySelector('#app-header div');
            if (headerDiv) headerDiv.appendChild(badge);
        }
    } else if (badge) {
        badge.remove();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        devMode = !devMode;
        localStorage.setItem(DEV_MODE_KEY, devMode ? '1' : '0');

        if (devMode) {
            if (!localStorage.getItem(DEV_DATE_KEY)) {
                localStorage.setItem(DEV_DATE_KEY, fechaSeleccionada);
            }
            updateDevBadge(true);
        } else {
            localStorage.removeItem(DEV_DATE_KEY);
            fechaSeleccionada = todayDDMMYYYY();
            updateDevBadge(false);
            if (fpInstance) {
                fpInstance.setDate('today', true);
            }
            obtenerreportes();
        }
    }
});

function diario() {
    const fecha = encodeURIComponent(fechaSeleccionada);
    window.location.href = `diario.html?fecha=${fecha}`;
}

function crear() {
    const fecha = encodeURIComponent(fechaSeleccionada);
    window.location.href = `nomina.html?fecha=${fecha}`;
}

function planilla() {
    window.location = "planillas.html";
}

function flota() {
    window.location = "flota.html";
}

function chofer() {
    window.location = "chofer.html";
}

function salidas() {
    const fecha = encodeURIComponent(fechaSeleccionada);
    window.location.href = `buses.html?fecha=${fecha}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const initialDate = devMode && localStorage.getItem(DEV_DATE_KEY)
        ? toFlatpickrDate(localStorage.getItem(DEV_DATE_KEY))
        : 'today';

    fpInstance = flatpickr("#calendario", {
        inline: true,
        locale: "es",
        dateFormat: "Y-m-d",
        defaultDate: initialDate,
        onChange: function(selectedDates, dateStr, instance) {
            const fecha = selectedDates[0];
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();

            fechaSeleccionada = `${dia}/${mes}/${anio}`;
            console.log("Fecha seleccionada:", fechaSeleccionada);

            if (devMode) {
                localStorage.setItem(DEV_DATE_KEY, fechaSeleccionada);
            }

            obtenerreportes();
        }
    });

    if (devMode) {
        updateDevBadge(true);
    }

    obtenerreportes();
});

function obtenerreportes() {
    fetch('php/menu/obtenerreportes.php')
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            if (!contenedor) return;
            contenedor.innerHTML = '';

            const filtrados = fechaSeleccionada
                ? data.filter(r => r.fecha === fechaSeleccionada)
                : data;

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<h2>NO HAY NOMINAS PARA ESTA FECHA</h2>';
                return;
            }

            filtrados.forEach(reporte => {
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.classList.add('reporte-boton');
                boton.onclick = () => {
                    const fecha = encodeURIComponent(fechaSeleccionada);
                    window.location.href = `ver.html?codR=${reporte.codR}&fecha=${fecha}`;
                };

                const div = document.createElement('div');
                div.classList.add('reporte-info');
                const h2CodR = document.createElement('h2');
                h2CodR.textContent = `Reporte N° ${reporte.codR}`;
                const h2Placa = document.createElement('h2');
                h2Placa.textContent = reporte.placa;
                const h2Fecha = document.createElement('h2');
                h2Fecha.textContent = reporte.fecha;

                div.appendChild(h2CodR);
                div.appendChild(h2Placa);
                div.appendChild(h2Fecha);
                boton.appendChild(div);
                contenedor.appendChild(boton);
            });
        })
        .catch(error => {
            console.error('Error al obtener los reportes:', error);
        });
}
