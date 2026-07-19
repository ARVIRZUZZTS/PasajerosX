const conductorLicenciaMap = new Map();
const planillasMap = new Map();

async function loadDatalists() {
    try {
        console.time('Carga completa');
        
        // 1. Cargar datos desde el servidor
        console.time('Fetch datos');
        const response = await fetch('php/common/getList.php');
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const lists = await response.json();
        console.timeEnd('Fetch datos');
        console.log("Datos recibidos:", { 
            conductores: lists.conLic?.length || 0, 
            planillas: lists.planillasCompletas?.length || 0 
        });

        // 2. Procesar pares conductor-licencia
        console.time('Procesar conductores');
        if (lists.conLic?.length) {
            lists.conLic.forEach(pair => {
                const [conductor, licencia] = pair.split('&');
                if (conductor && licencia) {
                    conductorLicenciaMap.set(conductor.trim(), licencia.trim());
                }
            });
        }
        console.timeEnd('Procesar conductores');

        // 3. Procesar datos de planillas (nuevo)
        console.time('Procesar planillas');
        if (lists.planillasCompletas?.length) {
            lists.planillasCompletas.forEach(planilla => {
                planillasMap.set(planilla.nombre, {
                    placa: planilla.placa,
                    conductor: planilla.conductor,
                    licencia: planilla.licencia
                });
            });
        } else {
            // Datos por defecto (backup)
            const planillasDefault = {
                "EAY JHONNY CABALLERO": { placa: "3056-EAY", conductor: "HUGO GABRIEL RASGUIDO", licencia: "8036400" },
                "BNE CARMEN VELASCO": { placa: "1803-BNE", conductor: "-", licencia: "0" },
                "FIU MIGUELINA PEREDO": { placa: "1800-FIU", conductor: "MARIO CRUZ LACATO", licencia: "7995969" },
                "DER REINALDO ALBERTO": { placa: "2537-DER", conductor: "REINALDO JORGE OCZACHOQUE", licencia: "3531243" },
                "UKF JHONNY CABALLERO": { placa: "2996-UKF", conductor: "JHONNY VARGAS HERBAS", licencia: "3780185" },
                "CPE ELOY TERCEROS": { placa: "2447-CPE", conductor: "ELOY TERCEROS MONTAÑO", licencia: "4512727" },
                "RXU JHONNY CABALLERO": { placa: "2494-RXU", conductor: "CALIXTO ANDIA QUINTEROS", licencia: "2951649" },
                "TFU RUTH CABALLERO": { placa: "2550-TFU", conductor: "DEMETRIO GALINDO MERIDA", licencia: "4438619" },
                "UKE ERICK MENDOZA": { placa: "1194-UKE", conductor: "ERICK MENDOZA MONTESINOS", licencia: "6472193" },
                "UTA JHONNY CABALLERO": { placa: "2830-UTA", conductor: "ARIEL VARGAS VALLEJOS", licencia: "7939232" },
                "KUX VIVIAN CABALLERO": { placa: "1461-KUX", conductor: "WILSON LAZARTE MONTAÑO", licencia: "8691695" },
                "EYR JUAN QUISPE LLAMPA": { placa: "1580-EYR", conductor: "JUAN QUISPE LLAMPAS", licencia: "4321568" },
                "YXG JHONNY VARGAS": { placa: "2130-YXG", conductor: "JHONNY VARGAS", licencia: "6053938" },
                "DKT RICHAR IRUSTA": { placa: "2447-DKT", conductor: "RICHAR IRUSTA JIMENEZ", licencia: "4560090" },
                "YNF JHONNY CABALLERO": { placa: "2701-YNF", conductor: "ARCENIO CABALLERO V.", licencia: "3567742" },
                "PCT ALEX SANDRO VILLARROEL": { placa: "2218-PCT", conductor: "ALEX SANDRO VILLARROEL ROMERO", licencia: "4512363" },
                "KGD VICTOR HUGO VELASCO": { placa: "2264-KGD", conductor: "VICTOR HUGO VELARSCO CAERO", licencia: "4403658" }
            };
            Object.entries(planillasDefault).forEach(([nombre, datos]) => {
                planillasMap.set(nombre, datos);
            });
        }
        console.timeEnd('Procesar planillas');

        // 4. Llenar datalists
        console.time('Llenar datalists');
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

        // Conductores (combinados)
        fillDatalist('c1-list', [...new Set([...(lists.c1 || []), ...(lists.c2 || [])])]);
        fillDatalist('c2-list', [...new Set([...(lists.c1 || []), ...(lists.c2 || [])])]);
        
        // Planillas/Marcas
        fillDatalist('ma-list', [...planillasMap.keys()]);
        
        // Otros datalists
        for (const [key, values] of Object.entries(lists)) {
            if (['conLic', 'c1', 'c2', 'planillasCompletas'].includes(key)) continue;
            fillDatalist(`${key}-list`, values);
        }
        console.timeEnd('Llenar datalists');

        // 5. Configurar autocompletados
        console.time('Configurar eventos');
        
        // Autocompletado conductor->licencia
        const setupConductorLicencia = (conductorId, licenciaId) => {
            const conductorInput = document.getElementById(conductorId);
            const licenciaInput = document.getElementById(licenciaId);
            
            if (!conductorInput || !licenciaInput) return;
            
            const updateLicencia = () => {
                const valor = conductorInput.value.trim();
                licenciaInput.value = conductorLicenciaMap.get(valor) || '';
            };
            
            conductorInput.addEventListener('input', updateLicencia);
            conductorInput.addEventListener('change', updateLicencia);
        };

        setupConductorLicencia('c1', 'l1');
        setupConductorLicencia('c2', 'l2');
        
        // Autocompletado planilla (nuevo)
        const setupPlanillas = () => {
            const planillaInput = document.getElementById('ma');
            const placaInput = document.getElementById('pl');
            const conductorInput = document.getElementById('c1');
            const licenciaInput = document.getElementById('l1');
            
            if (!planillaInput || !placaInput || !conductorInput || !licenciaInput) return;
            
            planillaInput.addEventListener('change', function() {
                const planilla = this.value.trim();
                const datos = planillasMap.get(planilla);
                
                if (datos) {
                    placaInput.value = datos.placa;
                    conductorInput.value = datos.conductor;
                    licenciaInput.value = datos.licencia;
                    
                    // Forzar actualización de eventos
                    conductorInput.dispatchEvent(new Event('input'));
                    console.log(`Planilla "${planilla}" cargada:`, datos);
                }
            });
        };
        
        setupPlanillas();
        console.timeEnd('Configurar eventos');

        console.timeEnd('Carga completa');
        
    } catch (error) {
        console.error("Error crítico:", error);
        alert("Error al cargar datos. Por favor recarga la página.");
    }
}


function back() {
    window.location = "menu.html";
}

async function save() {
    // Validación básica en cliente
    const marcaInput = document.getElementById('ma').value.trim();
    
    if (marcaInput) {
        const marcasExistentes = await getMarcasExistentes();
        const marcaExiste = marcasExistentes.some(
            marca => marca.toLowerCase() === marcaInput.toLowerCase()
        );

        if (!marcaExiste) {
            alert("ESA MARCA NO EXISTE");
            return;
        }
    }

    const campos = {
        c1: document.getElementById('c1').value.trim(),
        l1: document.getElementById('l1').value.trim(),
        c2: document.getElementById('c2').value.trim() || '-',
        l2: document.getElementById('l2').value.trim() || '0',
        pl: document.getElementById('pl').value.trim(),
        ma: marcaInput,
        dt: document.getElementById('dt').value.trim(),
        fe: document.getElementById('fe').value.trim(),
        hr: document.getElementById('hr').value.trim(),
        ay: document.getElementById('ay').value.trim() || '-',
        ca: document.getElementById('ca').value.trim() || '30',
    };

    // Validación de campos obligatorios
    const nombresCampos = {
        c1: 'CONDUCTOR I',
        l1: 'LICENCIA I',
        pl: 'PLACA',
        ma: 'MARCA',
        dt: 'DESTINO',
        fe: 'FECHA',
        hr: 'HORA'
    };

    const faltan = Object.entries(nombresCampos)
        .filter(([key]) => !campos[key])
        .map(([_, nombre]) => nombre);

    if (faltan.length > 0) {
        alert(`Faltan datos obligatorios:\n${faltan.join('\n')}`);
        return;
    }

    // Enviar datos al servidor
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
            throw new Error(result.error + (result.debug ? `\n${result.debug}` : ''));
        }

        if (!result.codR) {
            throw new Error("No se recibió el código de reporte");
        }

        // Redirigir a ver.html con los parámetros
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

async function getMarcasExistentes() {
    try {
        const response = await fetch('php/common/getList.php');
        const lists = await response.json();
        return lists.ma || [];
    } catch (error) {
        console.error("Error al obtener marcas:", error);
        return [];
    }
}

// Función para cargar la fecha y hora actual
function fechaHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit' };
    document.getElementById('hr').value = ahora.toLocaleTimeString('es-ES', opcionesHora);
    
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    if (fechaParam) {
        const fechaDecodificada = decodeURIComponent(fechaParam);
        document.getElementById('fecha').textContent = "FECHA SELECCIONADA: " + fechaDecodificada;
        document.getElementById('fe').value = fechaDecodificada;
    }
}

// Función para actualizar la hora en el footer
function actHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

// Inicialización
window.onload = () => {
    fechaHora();
    setInterval(actHora, 1000);
    loadDatalists();
};