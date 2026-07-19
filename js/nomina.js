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
    document.getElementById('pl-input').focus();
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
        document.getElementById('pl-display').value = placa;
        document.getElementById('c1').value = flota.conductor1 || '';
        document.getElementById('l1').value = flota.licencia1 || '';
        document.getElementById('c2').value = flota.conductor2 || '';
        document.getElementById('l2').value = flota.licencia2 || '';
        document.getElementById('ay').value = '';
        document.getElementById('ma').value = flota.nombre_planilla || '';

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

async function save() {
    const campos = {
        c1: document.getElementById('c1').value.trim(),
        l1: document.getElementById('l1').value.trim(),
        c2: document.getElementById('c2').value.trim() || '-',
        l2: document.getElementById('l2').value.trim() || '0',
        pl: document.getElementById('pl').value.trim(),
        ma: document.getElementById('ma').value.trim(),
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

window.onload = () => {
    loadDatalists();
    actHora();
    setInterval(actHora, 1000);

    document.getElementById('pl-input').addEventListener('change', function() {
        onPlacaSelect(this.value.trim());
    });
};
