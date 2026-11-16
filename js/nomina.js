async function loadDatalists() {
    try {
        const flotaResponse = await fetch('php/flota/getFlota.php');
        if (!flotaResponse.ok) throw new Error('Error al cargar flota');
        const flotas = await flotaResponse.json();

        const plList = document.getElementById('pl-list');
        const fragment = document.createDocumentFragment();
        const placas = [...new Set(flotas.map(f => f.placa).filter(Boolean))].sort();
        placas.forEach(placa => {
            const option = document.createElement('option');
            option.value = placa;
            fragment.appendChild(option);
        });
        plList.innerHTML = '';
        plList.appendChild(fragment);

        const response = await fetch('php/common/getList.php');
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const lists = await response.json();

        const dtList = document.getElementById('dt-list');
        const dtFragment = document.createDocumentFragment();
        (lists.dt || []).forEach(destino => {
            const option = document.createElement('option');
            option.value = destino;
            dtFragment.appendChild(option);
        });
        dtList.innerHTML = '';
        dtList.appendChild(dtFragment);

        const fillDatalist = (id, items) => {
            const datalist = document.getElementById(id);
            if (!datalist) return;
            const fragment = document.createDocumentFragment();
            (items || []).slice(0, 1000).forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                fragment.appendChild(option);
            });
            datalist.innerHTML = '';
            datalist.appendChild(fragment);
        };
        fillDatalist('hr-list', lists.hr);
        fillDatalist('ca-list', lists.ca);

        const choferResponse = await fetch('php/chofer/getChofer.php');
        if (choferResponse.ok) {
            const choferes = await choferResponse.json();
            const choferList = document.getElementById('chofer-list');
            if (choferList && choferes?.length) {
                const cf = document.createDocumentFragment();
                choferes.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.nombre_chofer;
                    cf.appendChild(option);
                });
                choferList.innerHTML = '';
                choferList.appendChild(cf);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar datos. Por favor recarga la página.");
    }
}

function back() {
    window.location = "menu.html";
}

function resetPlaca() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'flex';
    document.getElementById('pl').value = '';
    document.getElementById('pl-input').value = '';
    document.getElementById('pl-display').value = '';
    document.getElementById('pl-display').placeholder = '';
    document.getElementById('propietario').value = '';
    document.getElementById('c1').value = '';
    document.getElementById('c1').placeholder = '';
    document.getElementById('l1').value = '';
    document.getElementById('l1').placeholder = '';
    document.getElementById('l1').placeholder = '';
    document.getElementById('c2').value = '';
    document.getElementById('c2').placeholder = '';
    document.getElementById('l2').value = '';
    document.getElementById('l2').placeholder = '';
    document.getElementById('placa').value = '';
    document.getElementById('placa').placeholder = '';
    document.getElementById('pl-input').focus();
    const sm = document.getElementById('seatMap');
    if (sm) sm.innerHTML = '';
    window.reservadosSeleccionados = new Set();
    const ar = document.getElementById('asientos_reservados');
    if (ar) ar.value = '';
}

async function onPlacaSelect(placa) {
    if (!placa) return;

    try {
        const response = await fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(placa)}`);
        if (!response.ok) throw new Error('Error al obtener datos de flota');
        const flota = await response.json();

        if (!flota || flota.error) {
            alert('No se encontraron datos para la placa seleccionada');
            return;
        }

        document.getElementById('pl').value = placa;
        document.getElementById('pl-display').value = '';
        document.getElementById('pl-display').placeholder = placa;
        document.getElementById('propietario').value = flota.propietario || '';
        document.getElementById('c1').value = '';
        document.getElementById('c1').placeholder = flota.conductor1 || '';
        document.getElementById('l1').value = '';
        document.getElementById('l1').placeholder = flota.licencia1 || '';
        document.getElementById('c2').value = '';
        document.getElementById('c2').placeholder = flota.conductor2 || '';
        document.getElementById('l2').value = '';
        document.getElementById('l2').placeholder = flota.licencia2 || '';
        document.getElementById('ay').value = '';
        document.getElementById('placa').value = '';
        document.getElementById('placa').placeholder = flota.nombre_planilla || '';
        if (flota.nombre_planilla) renderSeatMap(flota.nombre_planilla);

        const params = new URLSearchParams(window.location.search);
        const fechaParam = params.get("fecha");
        if (fechaParam) {
            const fechaDecodificada = decodeURIComponent(fechaParam);
            document.getElementById('fecha').textContent = "FECHA SELECCIONADA: " + fechaDecodificada;
            document.getElementById('fe').value = fechaDecodificada;
        } else {
            const ahora = new Date();
            const dia = String(ahora.getDate()).padStart(2, '0');
            const mes = String(ahora.getMonth() + 1).padStart(2, '0');
            const anio = ahora.getFullYear();
            document.getElementById('fe').value = `${dia}/${mes}/${anio}`;
        }

        const ahora = new Date();
        const opcionesHora = { hour: '2-digit', minute: '2-digit' };
        document.getElementById('hr').value = ahora.toLocaleTimeString('es-ES', opcionesHora);

        document.getElementById('ca').value = '30';

        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
    } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar datos de la placa");
    }
}

function setupChoferAutocomplete() {
    const choferMap = new Map();
    fetch('php/chofer/getChofer.php')
        .then(r => r.json())
        .then(choferes => {
            if (choferes?.length) {
                choferes.forEach(c => choferMap.set(c.nombre_chofer, c.licencia));
            }
        });

    const setup = (conductorId, licenciaId) => {
        const condInput = document.getElementById(conductorId);
        const licInput = document.getElementById(licenciaId);
        if (!condInput || !licInput) return;
        condInput.addEventListener('change', () => {
            const nombre = condInput.value.trim();
            const licencia = choferMap.get(nombre);
            if (licencia) {
                licInput.value = licencia;
            }
        });
    };
    setup('c1', 'l1');
    setup('c2', 'l2');
}

const getVal = (id) => {
    const el = document.getElementById(id);
    return el.value.trim() || el.placeholder.trim();
};

async function save() {
    const campos = {
        c1: getVal('c1'),
        l1: getVal('l1'),
        c2: getVal('c2') || '-',
        l2: getVal('l2') || '0',
        pl: document.getElementById('pl').value.trim(),
        placa: getVal('placa'),
        dt: document.getElementById('dt').value.trim(),
        fe: document.getElementById('fe').value.trim(),
        hr: document.getElementById('hr').value.trim(),
        ay: document.getElementById('ay').value.trim() || '-',
        ca: document.getElementById('ca').value.trim() || '30',
    };

    if (!campos.pl) {
        alert("Debe seleccionar una placa primero");
        return;
    }

    const nombresCampos = {
        dt: 'DESTINO',
        hr: 'HORA'
    };

    const faltan = Object.entries(nombresCampos)
        .filter(([key]) => !campos[key])
        .map(([_, nombre]) => nombre);

    if (faltan.length > 0) {
        alert(`Faltan datos obligatorios:\n${faltan.join('\n')}`);
        return;
    }

    try {
        const formData = new FormData();
        for (let key in campos) {
            formData.append(key, campos[key]);
        }
        formData.append('reservas', document.getElementById('reservas')?.checked ? '1' : '0');
        const reservadosInput = document.getElementById('asientos_reservados').value.trim();
        const reservadosFinal = reservadosInput || Array.from(window.reservadosSeleccionados || []).join(',');
        formData.append('asientos_reservados', reservadosFinal);

        const response = await fetch('php/nomina/nuevaNomina.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        if (!result.codR) {
            throw new Error("No se recibió el código de reporte");
        }

        redirectToVerPage(result.codR, campos.fe);
    } catch (error) {
        console.error("Error al guardar:", error);
        alert(`Error al guardar: ${error.message}`);
    }
}

function redirectToVerPage(codR, fecha) {
    const fechaCodificada = encodeURIComponent(fecha);
    window.location.href = `ver.html?codR=${codR}&fecha=${fechaCodificada}`;
}

function actHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

window.reservadosSeleccionados = window.reservadosSeleccionados || new Set();

async function renderSeatMap(planillaNombre) {
    const container = document.getElementById('seatMapModal');
    if (!container) return;
    container.innerHTML = '';
    try {
        const res = await fetch(`php/common/getBus.php?nombre=${encodeURIComponent(planillaNombre)}`);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const seatSize = 36;
        const seats = data.filter(i => i.tipo === 'asiento');
        const maxPosX = seats.reduce((m, i) => Math.max(m, parseInt(i.posX) || 0), 0);
        const maxPosY = seats.reduce((m, i) => Math.max(m, parseInt(i.posY) || 0), 0);
        const availableWidth = container.clientWidth || container.offsetWidth || 0;
        const availableHeight = container.clientHeight || container.offsetHeight || 0;
        let factorX = (availableWidth > 0 && maxPosX > 0) ? ((availableWidth - seatSize) / maxPosX) : 1;
        let factorY = (availableHeight > 0 && maxPosY > 0) ? ((availableHeight - seatSize) / maxPosY) : 1;
        let factor = Math.min(factorX, factorY, 1);
        if (!isFinite(factor) || factor <= 0) factor = 0.82;

        data.forEach(item => {
            if (item.tipo !== 'asiento') return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.numAs;
            btn.style.position = 'absolute';
            btn.style.left = Math.round((parseInt(item.posX) || 0) * factor) + 'px';
            btn.style.top = Math.round((parseInt(item.posY) || 0) * factor) + 'px';
            btn.className = window.reservadosSeleccionados.has(String(item.numAs)) ? 'seat-reservado' : 'seat-libre';
            btn.addEventListener('click', () => {
                const key = String(item.numAs);
                if (window.reservadosSeleccionados.has(key)) {
                    window.reservadosSeleccionados.delete(key);
                    btn.className = 'seat-libre';
                } else {
                    window.reservadosSeleccionados.add(key);
                    btn.className = 'seat-reservado';
                }
                updateModalCount();
            });
            container.appendChild(btn);
        });
        updateModalCount();
    } catch (e) {
        console.error('Error cargando mapa de asientos', e);
    }
}

function updateModalCount() {
    const el = document.getElementById('modalCount');
    if (el) el.textContent = window.reservadosSeleccionados.size;
}

function closeModal() {
    const modal = document.getElementById('modalReservas');
    if (modal) modal.style.display = 'none';
}

window.onload = () => {
    loadDatalists();
    actHora();
    setInterval(actHora, 1000);
    setupChoferAutocomplete();

    const reservasCb = document.getElementById('reservas');
    const btnReservas = document.getElementById('btnReservas');
    const modal = document.getElementById('modalReservas');

    function updateBtn() {
        if (reservasCb.checked) {
            btnReservas.disabled = false;
            btnReservas.classList.add('enabled');
        } else {
            btnReservas.disabled = true;
            btnReservas.classList.remove('enabled');
            if (modal) modal.style.display = 'none';
            window.reservadosSeleccionados.clear();
            const hidden = document.getElementById('asientos_reservados');
            if (hidden) hidden.value = '';
        }
    }
    if (reservasCb) reservasCb.addEventListener('change', updateBtn);
    updateBtn();

    if (btnReservas) {
        btnReservas.addEventListener('click', () => {
            if (btnReservas.disabled) return;
            const planilla = document.getElementById('placa').placeholder;
            if (!planilla) {
                alert('Seleccione una placa primero');
                return;
            }
            if (modal) modal.style.display = 'flex';
            renderSeatMap(planilla);
        });
    }
    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    const cancelBtn = document.getElementById('modalCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    const confirmBtn = document.getElementById('modalConfirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const hidden = document.getElementById('asientos_reservados');
            if (hidden) hidden.value = Array.from(window.reservadosSeleccionados).join(',');
            closeModal();
        });
    }

    document.getElementById('pl-input').addEventListener('change', function() {
        onPlacaSelect(this.value.trim());
    });

    const inputs = document.querySelectorAll('#step2 input');
    inputs.forEach((input, i) => {
        input.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            (inputs[i + 1] || document.getElementById('save')).focus();
        });
    });    
};
