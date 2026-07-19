const conductorLicenciaMap = new Map();
const planillasMap = new Map();

// Obtener codR desde la URL
const params = new URLSearchParams(window.location.search);
const codR = params.get('codR');

// Volver a ver.html con el mismo codR
function back() {
    const fecha = document.getElementById('fe').value || params.get('fecha');
    window.location.href = `ver.html?codR=${codR}&fecha=${encodeURIComponent(fecha)}`;
}
// Obtener datos del reporte y colocarlos como placeholder
function getReporte() {
    fetch(`php/common/reporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('c1').placeholder = data.con1 || 'CONDUCTOR 1';
            document.getElementById('l1').placeholder = data.lic1 || 'LICENCIA 1';
            document.getElementById('c2').placeholder = data.con2 || 'CONDUCTOR 2';
            document.getElementById('l2').placeholder = data.lic2 || 'LICENCIA 2';
            document.getElementById('ay').placeholder = data.ayudante || 'AYUDANTE';
            document.getElementById('dt').placeholder = data.destino || 'DESTINO';
            document.getElementById('pl').placeholder = data.placa || 'PLACA';
            document.getElementById('ma').placeholder = data.marca || 'MARCA';
            document.getElementById('fe').placeholder = data.fecha || 'FECHA';
            document.getElementById('hr').placeholder = data.hora || 'HORA';
            document.getElementById('ca').placeholder = data.carril || 'CARRIL';
            cargarDisenoBus(data.marca);
        })
        .catch(error => console.error('Error al obtener el reporte:', error));
}
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
// Guardar (solo si se ingresan valores nuevos)
// Guardar (solo si se ingresan valores nuevos)
async function save() {

    const marcaInput = document.getElementById('ma').value || document.getElementById('ma').placeholder;
    const marcasExistentes = await getMarcasExistentes();
    
    if (marcaInput && !marcasExistentes.includes(marcaInput)) {
        alert("ESA MARCA NO EXISTE");
        return;
    }

    // Primero verificar asientos ocupados
    const marca = document.getElementById('ma').value || document.getElementById('ma').placeholder;
    const asientosOcupados = await getAsientosOcupados(marca);
    
    
    // Verificar si hay asientos duplicados en los inputs
    const pasajerosInputs = document.querySelectorAll('#dinamic .pasajero');
    let asientosDuplicados = [];
    let asientosInvalidos = [];
    
    pasajerosInputs.forEach(div => {
        const asientoInput = div.querySelector('.as');
        const asiento = asientoInput.value.trim() || asientoInput.placeholder;
        
        // Verificar si el asiento está ocupado
        if (asientosOcupados.includes(asiento.toString()) && asientoInput.value.trim() !== '') {
            asientosInvalidos.push(asiento);
        }
        
        // Verificar duplicados entre los inputs
        pasajerosInputs.forEach(otherDiv => {
            if (div !== otherDiv) {
                const otherAsientoInput = otherDiv.querySelector('.as');
                const otherAsiento = otherAsientoInput.value.trim() || otherAsientoInput.placeholder;
                if (asiento === otherAsiento && asientoInput.value.trim() !== '') {
                    asientosDuplicados.push(asiento);
                }
            }
        });
    });
    
    // Eliminar duplicados en los arrays
    asientosDuplicados = [...new Set(asientosDuplicados)];
    asientosInvalidos = [...new Set(asientosInvalidos)];
    
    // Mostrar alertas si hay problemas
    if (asientosDuplicados.length > 0 || asientosInvalidos.length > 0) {
        let mensaje = '';
        
        if (asientosDuplicados.length > 0) {
            mensaje += `Los siguientes asientos están duplicados: ${asientosDuplicados.join(', ')}\n`;
        }
        
        if (asientosInvalidos.length > 0) {
            mensaje += `Los siguientes asientos ya están ocupados: ${asientosInvalidos.join(', ')}\n`;
            mensaje += "Puede guardarlos en 0 (cero) si desea marcarlos como vacíos.";
        }
        
        alert(mensaje);
        return; // Detener el guardado
    }
    
    // Continuar con el guardado si no hay problemas
    guardarDatos();
    reload();
}

async function getAsientosOcupados(marca) {
    try {
        const codR = new URLSearchParams(window.location.search).get('codR');
        
        // Obtener pasajeros existentes
        const pasajerosResponse = await fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`);
        const pasajeros = await pasajerosResponse.json();
        
        return pasajeros.map(p => p.asiento.toString());
    } catch (error) {
        console.error('Error al obtener asientos ocupados:', error);
        return [];
    }
}

async function guardarDatos() {
    const codR = new URLSearchParams(window.location.search).get('codR');
    const marcaInput = document.getElementById('ma').value || document.getElementById('ma').placeholder;
    const fechaInput = document.getElementById('fe').value || document.getElementById('fe').placeholder;

    const marcasExistentes = await getMarcasExistentes();
    
    if (marcaInput && !marcasExistentes.includes(marcaInput)) {
        alert("ESA MARCA NO EXISTE");
        return;
    }

    const datosReporte = {
        codR: codR,
        con1: document.getElementById('c1').value || undefined,
        lic1: document.getElementById('l1').value || undefined,
        con2: document.getElementById('c2').value || undefined,
        lic2: document.getElementById('l2').value || undefined,
        ayudante: document.getElementById('ay').value || undefined,
        destino: document.getElementById('dt').value || undefined,
        placa: document.getElementById('pl').value || undefined,
        marca: marcaInput,
        fecha: fechaInput,
        hora: document.getElementById('hr').value || undefined,
        carril: document.getElementById('ca').value || undefined
    };

    try {
        // Guardar reporte
        await fetch('php/editar/updateReporte.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReporte)
        });

        // Procesar pasajeros
        const pasajerosActualizar = [];
        const pasajerosBorrar = [];
        
        document.querySelectorAll('#dinamic .pasajero').forEach(div => {
            const asientoInput = div.querySelector('.as');
            const nombreInput = div.querySelector('.nm');
            const ciInput = div.querySelector('.ci');
            const precioInput = div.querySelector('.pr');
        
            const asiento = asientoInput.value.trim();
            const nombre = nombreInput.value.trim();
            const ci = ciInput.value.trim();
            const precio = precioInput.value.trim();
        
            const codP = parseInt(div.id);
            
            // Si el asiento es 0, marcamos para borrar
            if (asiento === '0') {
                pasajerosBorrar.push(codP);
            } 
            // Si hay cambios (valor diferente al placeholder o diferente de vacío)
            else if (asiento !== asientoInput.placeholder || 
                     nombre !== nombreInput.placeholder || 
                     ci !== ciInput.placeholder || 
                     precio !== precioInput.placeholder) {
                pasajerosActualizar.push({ 
                    codR, 
                    codP, 
                    asiento: asiento || asientoInput.placeholder,
                    nombre: nombre || nombreInput.placeholder,
                    ci: ci || ciInput.placeholder,
                    precio: precio || precioInput.placeholder
                });
            }
        });

        // Primero borramos los pasajeros marcados con 0
        if (pasajerosBorrar.length > 0) {
            const deleteResponse = await fetch('php/editar/deletePasajero.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codR, pasajeros: pasajerosBorrar })
            });
            const deleteResult = await deleteResponse.json();
            console.log('Resultado borrado:', deleteResult);
            
            if (!deleteResult.success) {
                throw new Error(deleteResult.error || "Error al borrar pasajeros");
            }
        }

        // Luego actualizamos los demás
        if (pasajerosActualizar.length > 0) {
            const updateResponse = await fetch('php/editar/updatePasajero.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pasajerosActualizar)
            });
            const updateResult = await updateResponse.json();
            console.log('Resultado actualización:', updateResult);
            
            if (!updateResult.success) {
                throw new Error(updateResult.error || "Error al actualizar pasajeros");
            }
        }

        location.reload();
        
    } catch (error) {
        console.error('Error en guardarDatos:', error);
        alert("Ocurrió un error al guardar: " + error.message);
    }
}
async function getMarcasExistentes() {
    try {
        const response = await fetch('php/common/getList.php');
        const lists = await response.json();
        return lists.ma || []; // Asume que 'marca' es una de las listas devueltas por getList.php
    } catch (error) {
        console.error("Error al obtener marcas existentes:", error);
        return [];
    }
}
async function cargarDisenoBus(marca) {
  try {
    const codR = new URLSearchParams(window.location.search).get('codR');
    const busElement = document.getElementById('bus');
    busElement.innerHTML = '';
    
    // Obtener diseño del bus y pasajeros en paralelo
    const [disenoResponse, pasajerosResponse] = await Promise.all([
      fetch(`php/common/getBus.php?nombre=${encodeURIComponent(marca)}`),
      fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
    ]);
    
    const [disenoData, pasajeros] = await Promise.all([
      disenoResponse.json(),
      pasajerosResponse.json()
    ]);
    
    // Extraer los asientos ocupados
    const asientosOcupados = pasajeros.map(p => p.asiento);
    
    disenoData.forEach(item => {
      const div = document.createElement('div');
      const posX = parseInt(item.posX) || 0;
      const posY = parseInt(item.posY) || 0;
      
      // Configuración común
      div.style.position = 'absolute';
      div.style.left = `${posX}px`;
      div.style.top = `${posY}px`;
      div.style.borderRadius = '5px';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      
      if (item.tipo === 'asiento') {
        div.className = 'asiento';
        div.textContent = item.numAs;
        div.style.width = '40px';
        div.style.height = '40px';
        
        // Verificar si el asiento está ocupado
        const estaOcupado = asientosOcupados.some(a => a.toString() === item.numAs.toString());
        div.classList.add(estaOcupado ? 'asOcu' : 'asLib');
        
      } else {
        div.className = 'extra';
        const img = document.createElement('img');
        
        const tipoConfig = {
          'puerta': { src: 'img/puerta.png', class: 'elePue', width: 30, height: 30 },
          'baño': { src: 'img/bath.png', class: 'eleBan', width: 30, height: 30 },
          'tv': { src: 'img/tv.png', class: 'eleTv', width: 30, height: 30 },
          '2do piso': { src: 'img/2do.png', class: 'ele2', width: 300, height: 30 }
        };
        
        img.src = tipoConfig[item.tipo].src;
        img.alt = item.tipo;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        div.classList.add(tipoConfig[item.tipo].class);
        div.style.width = `${tipoConfig[item.tipo].width}px`;
        div.style.height = `${tipoConfig[item.tipo].height}px`;
        div.appendChild(img);
      }
      
      busElement.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar el diseño del bus:', error);
  }
}

function obtenerPasajeros(codR) {
    fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = ''; // Limpiar contenido anterio
            data.forEach(pasajero => {
                const div = document.createElement('div');
                div.classList.add('pasajero');
                div.id = pasajero.codP;

                const inputSit = document.createElement('input');
                inputSit.type = 'number';
                inputSit.placeholder = pasajero.asiento;
                inputSit.classList.add('as');

                const inputNombre = document.createElement('input');
                inputNombre.type = 'text';
                inputNombre.placeholder = pasajero.nombre;
                inputNombre.classList.add('nm');

                const inputCi = document.createElement('input');
                inputCi.type = 'number';
                inputCi.placeholder = pasajero.ci;
                inputCi.classList.add('ci');

                const inputPr = document.createElement('input');
                inputPr.type = 'number';
                inputPr.placeholder = pasajero.precio;
                inputPr.classList.add('pr');

                div.appendChild(inputSit);
                div.appendChild(inputNombre);
                div.appendChild(inputCi);
                div.appendChild(inputPr);
                contenedor.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error al obtener los pasajeros:', error);
        });
}
function actualizarFechaHoraFooter() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

window.onload = () => {
    getReporte();
    actualizarFechaHoraFooter();
    setInterval(actualizarFechaHoraFooter, 1000); 
    obtenerPasajeros(codR);
    setFecha();
    loadDatalists();
};
function setFecha() {
    document.getElementById("fecha").textContent = "FECHA SELECCIONADA: " + params.get('fecha');
}

document.addEventListener('keydown', function(e) {
     if (e.key === 'Enter') {
        e.preventDefault();
        save(); // Ejecutar función de guardado
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        back(); // Volver a ver.html
    }
    const editableClasses = ['as', 'nm', 'ci', 'pr'];
    const active = document.activeElement;
    if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        (!active || !editableClasses.some(cls => active.classList.contains(cls)))
    ) {
        const firstInput = document.querySelector('#dinamic .pasajero .as'); // Primer campo de asiento
        if (firstInput) {
            e.preventDefault();
            firstInput.focus();
            firstInput.select();
        }
        return; // No continuar con navegación, ya se enfocó
    }
    if (['ArrowUp', 'ArrowDown'].includes(e.key) && document.activeElement.type === 'number') {
        e.preventDefault();
    }

    const current = document.activeElement;
    if (!current || !current.classList.contains('as') && !current.classList.contains('nm') && !current.classList.contains('ci') && !current.classList.contains('pr')) return;

    const currentDiv = current.closest('.pasajero');
    if (!currentDiv) return;

    const rows = Array.from(document.querySelectorAll('#dinamic .pasajero'));

    const currentIndex = rows.indexOf(currentDiv);
    if (currentIndex === -1) return;

    const fieldClass = current.classList[0];

    if (e.key === 'ArrowDown' && currentIndex < rows.length - 1) {
        e.preventDefault();
        const nextInput = rows[currentIndex + 1].querySelector(`.${fieldClass}`);
        if (nextInput) nextInput.focus();
    }

    if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        const prevInput = rows[currentIndex - 1].querySelector(`.${fieldClass}`);
        if (prevInput) prevInput.focus();
    }

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const order = ['as', 'nm', 'ci', 'pr'];
        const currentPos = order.indexOf(fieldClass);
        if (currentPos > 0) {
            const leftInput = currentDiv.querySelector(`.${order[currentPos - 1]}`);
            if (leftInput) leftInput.focus();
        }
    }

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        const order = ['as', 'nm', 'ci', 'pr'];
        const currentPos = order.indexOf(fieldClass);
        if (currentPos < order.length - 1) {
            const rightInput = currentDiv.querySelector(`.${order[currentPos + 1]}`);
            if (rightInput) rightInput.focus();
        }
    }
    const lista = document.getElementById('lista');
    if (!lista) return;

    const SCROLL_AMOUNT = 68; // Puedes ajustar este valor

    switch (event.key) {
        case 'ArrowUp':
            lista.scrollTop -= SCROLL_AMOUNT;
            event.preventDefault();
            break;
        case 'ArrowDown':
            lista.scrollTop += SCROLL_AMOUNT;
            event.preventDefault();
            break;
    }
});
