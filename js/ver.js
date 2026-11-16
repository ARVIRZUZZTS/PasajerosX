const params = new URLSearchParams(window.location.search);
const codR = params.get('codR');
window.onload = () => {
    renderEntradas();
    obtenerDatosReporte(codR);
    obtenerPasajeros(codR);
    actualizarFechaHoraFooter();
    setInterval(actualizarFechaHoraFooter, 1000); 
    setFecha();
    setTitleDat(codR);
};
function back() {
    window.location = "menu.html";
}
function edit() {
    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');
    const fecha = encodeURIComponent(params.get('fecha'));
    window.location.href = `editar.html?codR=${codR}&fecha=${fecha}`;
}
function add(asiento) {
    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');
    const fecha = encodeURIComponent(params.get("fecha"));
    const c1 = encodeURIComponent(document.getElementById('c1').textContent.trim());
    const pl = encodeURIComponent(document.getElementById('pl').textContent.trim());
    const placa = encodeURIComponent(document.getElementById('pl').textContent.trim());
    const fe = encodeURIComponent(document.getElementById('fe').textContent.trim());
    const dt = encodeURIComponent(document.getElementById('dt').textContent.trim());
    const as = encodeURIComponent(asiento);
    const hh = encodeURIComponent(document.getElementById('hr').textContent.trim());
    window.location.href = `pasajero.html?fecha=${fecha}&codR=${codR}&c1=${c1}&pl=${pl}&placa=${placa}&fe=${fe}&dt=${dt}&as=${as}&hh=${hh}`;
}

function renderEntradas() {
    const cont = document.getElementById('entradas');
    if (!cont) return;
    cont.innerHTML = '';

    const col1 = document.createElement('div');
    const col2 = document.createElement('div');

    const fields = [
        { label: 'PROPIETARIO:', id: 'propietario', col: 1 },
        { label: 'CONDUCTOR 1:', id: 'c1', col: 1 },
        { label: 'CONDUCTOR 2:', id: 'c2', col: 1 },
        { label: 'AYUDANTE:', id: 'ay', col: 1 },
        { label: 'PLACA:', id: 'pl', col: 1 },
        { label: 'FECHA:', id: 'fe', col: 1 },
        { label: 'MARCA:', id: 'marca', col: 2 },
        { label: 'LICENCIA 1:', id: 'l1', col: 2 },
        { label: 'LICENCIA 2:', id: 'l2', col: 2 },
        { label: 'DESTINO:', id: 'dt', col: 2 },
        { label: 'PLANILLA:', id: 'placa', col: 2 },
        { label: 'HORA:', id: 'hr', col: 2 },
        { label: 'CARRIL:', id: 'ca', col: 2 }
    ];

    fields.forEach(f => {
        const row = document.createElement('div');
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = f.label;
        const value = document.createElement('span');
        value.className = 'value';
        value.id = f.id;
        value.textContent = '-';
        row.appendChild(label);
        row.appendChild(value);
        if (f.col === 1) col1.appendChild(row);
        else col2.appendChild(row);
    });

    cont.appendChild(col1);
    cont.appendChild(col2);
}

function obtenerDatosReporte(codR) {
    fetch(`php/common/reporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('c1').textContent = data.con1 || '';
            document.getElementById('l1').textContent = data.lic1 || '';
            document.getElementById('c2').textContent = data.con2 || '';
            document.getElementById('l2').textContent = data.lic2 || '';
            document.getElementById('ay').textContent = data.ayudante || '';
            document.getElementById('dt').textContent = data.destino || '';
            document.getElementById('pl').textContent = data.placa || '';
            document.getElementById('fe').textContent = data.fecha || '';
            document.getElementById('hr').textContent = data.hora || '';
            document.getElementById('ca').textContent = data.carril || '';
            if (data.placa) {
                fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(data.placa)}`)
                    .then(res => res.json())
                    .then(flota => {
                        document.getElementById('placa').textContent = flota?.nombre_planilla || 'SIN PLANILLA';
                        document.getElementById('propietario').textContent = flota?.propietario || '-';
                        document.getElementById('marca').textContent = flota?.marca || '-';
                    })
                    .catch(() => {
                        document.getElementById('placa').textContent = 'SIN PLANILLA';
                    });
                cargarDisenoBus(data.placa);
            } else {
                document.getElementById('placa').textContent = '';
                document.getElementById('propietario').textContent = '';
                document.getElementById('marca').textContent = '';
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del reporte:', error);
        });
}
function actualizarFechaHoraFooter() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
function obtenerPasajeros(codR) {
    fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = ''; // Limpiar contenido anterior
            
            if (data.length === 0) {
                // Mostrar mensaje cuando no hay pasajeros
                const mensaje = document.createElement('h3');
                mensaje.textContent = 'NO HAY PASAJEROS EN ESTE BUS';
                mensaje.style.textAlign = 'center';
                mensaje.style.width = '100%';
                mensaje.style.margin = '20px 0';
                mensaje.style.color = '#666';
                contenedor.appendChild(mensaje);
            } else {
                // Procesar pasajeros si los hay
                data.forEach(pasajero => {
                    const div = document.createElement('div');
                    div.classList.add('pasajero');

                    const h3Sit = document.createElement('label');
                    h3Sit.textContent = pasajero.asiento;
                    h3Sit.classList.add('as');

                    const h3Nombre = document.createElement('label');
                    h3Nombre.textContent = pasajero.nombre;
                    h3Nombre.classList.add('nm');

                    const h3Ci = document.createElement('label');
                    h3Ci.textContent = pasajero.ci;
                    h3Ci.classList.add('ci');

                    const h3Pr = document.createElement('label');
                    h3Pr.textContent = pasajero.precio;
                    h3Pr.classList.add('pr');

                    const printButton = document.createElement('button');
                    printButton.setAttribute('onclick', `printy(${pasajero.codP})`);
                    printButton.classList.add('pp');
                    const img = document.createElement('img');
                    img.src = 'img/printW.png';
                    img.alt = 'Imprimir';
                    printButton.appendChild(img);

                    div.appendChild(h3Sit);
                    div.appendChild(h3Nombre);
                    div.appendChild(h3Ci);
                    div.appendChild(h3Pr);
                    div.appendChild(printButton);
                    
                    contenedor.appendChild(div);
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los pasajeros:', error);
            // También puedes mostrar un mensaje de error en la interfaz si lo deseas
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = '<h3 style="text-align: center; width: 100%; margin: 20px 0; color: #f00;">Error al cargar los pasajeros</h3>';
        });
}

async function cargarDisenoBus(placa) {
  try {
    const codR = new URLSearchParams(window.location.search).get('codR');
    const busElement = document.getElementById('bus');
    busElement.innerHTML = '';
    
    // Obtener diseño del bus, pasajeros y bloqueados en paralelo
    const [disenoResponse, pasajerosResponse, bloqueadosResponse] = await Promise.all([
      fetch(`php/common/getBus.php?placa=${encodeURIComponent(placa)}`),
      fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`),
      fetch(`php/diario/getBloqueados.php?codR=${encodeURIComponent(codR)}`)
    ]);
    
    const [disenoData, pasajeros, bloqueados] = await Promise.all([
      disenoResponse.json(),
      pasajerosResponse.json(),
      bloqueadosResponse.json()
    ]);
    
    // Extraer los asientos ocupados y bloqueados
    const asientosOcupados = pasajeros.map(p => p.asiento);
    const asientosBloqueados = Array.isArray(bloqueados) ? bloqueados.map(b => b.asiento) : [];
    
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
        
        // Verificar si el asiento está ocupado o bloqueado
        const estaOcupado = asientosOcupados.some(a => a.toString() === item.numAs.toString());
        const estaBloqueado = asientosBloqueados.some(a => a.toString() === item.numAs.toString());
        if (estaOcupado) {
          div.classList.add('asOcu');
        } else if (estaBloqueado) {
          div.classList.add('asBloq');
        } else {
          div.classList.add('asLib');
          // Hacer el asiento clickeable
          div.style.cursor = 'pointer';
          div.addEventListener('click', () => {
            add(item.numAs);
          });
        }
        
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


function setFecha() {
    const params = new URLSearchParams(window.location.search);
    document.getElementById("fecha").textContent = "FECHA SELECCIONADA: " + params.get('fecha');
}
function setTitleDat(codR){
    document.getElementById("titleDat").textContent = "REPORTE N° " + codR;
}

const PRINT_CSS_HREF = new URL('css/print-ver.css', window.location.href).href;
const LOGO_URL = new URL('img/logXXF.png', window.location.href).href;
const PRINT_CSS_CRITICO = '@page { size: A4 portrait; margin: 0.5cm; }';

function printy(codP) {
    const horaActual = document.getElementById("hora").textContent;
    const fechaActual = document.getElementById("fe").textContent;

    const datos = {
        c1: document.getElementById("c1").textContent,
        l1: document.getElementById("l1").textContent,
        c2: document.getElementById("c2").textContent,
        l2: document.getElementById("l2").textContent,
        ay: document.getElementById("ay").textContent,
        dt: document.getElementById("dt").textContent,
        pl: document.getElementById("pl").textContent,
        placa: document.getElementById("placa").textContent,
        fe: fechaActual,
        hr: document.getElementById("hr").textContent,
        ca: document.getElementById("ca").textContent,
        marca: document.getElementById("marca").textContent,
        horaActual: horaActual
    };

    if (codP == 0) {
        const cantidad = prompt("Cuántas copias de la lista deseas imprimir?", "1");
        if (cantidad === null) return;
        const numCopias = parseInt(cantidad);
        if (isNaN(numCopias) || numCopias <= 0) {
            alert("Por favor ingresa un número válido mayor que 0");
            return;
        }

        const codR = new URLSearchParams(window.location.search).get('codR');
        const win = abrirHojaImpresion({ preset: 'a4', titulo: 'Lista de pasajeros' });
        if (!win) {
            alert("Permite las ventanas emergentes e intenta de nuevo.");
            return;
        }

        fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
            .then(response => response.json())
            .then(data => {
                const copies = [];
                for (let i = 0; i < numCopias; i++) {
                    const breakStyle = i < numCopias - 1 ? ' style="page-break-after: always;"' : '';
                    copies.push(`
                        <div class="copia-lista"${breakStyle}>
                            <div id="topPrint">
                                <img id="imgPr" src="${esc(LOGO_URL)}" alt="Logo">
                                <div><h2 id="lbsc">LINEA DE BUSES EXP SANTA CRUZ</h2></div>
                                <div><h3 class="tizq">CONDUCTOR 1: ${esc(datos.c1)} (Licencia: ${esc(datos.l1)})</h3></div>
                                <div><h3 class="tizq">CONDUCTOR 2: ${esc(datos.c2)} (Licencia: ${esc(datos.l2)})</h3></div>
                                <div>
                                    <h3 class="tizq">PLACA: ${esc(datos.pl)}</h3>
                                    <h3>DESTINO: ${esc(datos.dt)}</h3>
                                </div>
                                <div>
                                    <h3 class="tizq">FECHA: ${esc(datos.fe)}</h3>
                                    <h3>HORA: ${esc(datos.hr)}</h3>
                                </div>
                            </div>
                            <hr>
                            <div id="titlesPr">
                                <h3 class="asP">N°</h3>
                                <h3 class="nmP">NOMBRE</h3>
                                <h3 class="ciP">CI</h3>
                            </div>
                            <div id="pasajerosPrint">
                                ${data.map(pasajero => `
                                    <div class="pasajeroPrint">
                                        <h3 class="asP">${esc(pasajero.asiento)}</h3>
                                        <h3 class="nmP">${esc(pasajero.nombre)}</h3>
                                        <h3 class="ciP">${esc(pasajero.ci)}</h3>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `);
                }
                imprimirHTML({ win, titulo: 'Lista de pasajeros', cssHref: PRINT_CSS_HREF, cssCritico: PRINT_CSS_CRITICO, html: copies.join('') });
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error al cargar la lista de pasajeros");
                try { win.close(); } catch (e) {}
            });
    } else if (codP == -1) {
        const cantidad = prompt(`Cuántos tickets vacíos para el ${datos.pl} deseas imprimir?`, "1");
        if (cantidad === null) return;
        const numTickets = parseInt(cantidad);
        if (isNaN(numTickets) || numTickets <= 0) {
            alert("Por favor ingresa un número válido mayor que 0");
            return;
        }

        const win = abrirHojaImpresion({ ancho: 900, alto: 900, titulo: 'Ticket vacío' });
        if (!win) {
            alert("Permite las ventanas emergentes e intenta de nuevo.");
            return;
        }

        const ticketHTML = `
            <div id="pasajeroPrintBody">
                <img id="imgPr2" src="${esc(LOGO_URL)}" alt="Logo">
                <div id="adver">
                    <div id="fact">
                        <h4 class="marNon strCent">EXIJA SU</h4>
                        <h1 class="marNon strCent">FACTURA</h1>
                    </div>
                    <div><h3>ESTE BOLETO CONSTITUYE RESERVA DE PASAJE</h3></div>
                </div>
                <div><h3 id="dtP" class="cien">De SC a: ${esc(datos.dt)}</h3></div>
                <div><h3 id="nmP" class="cien big">NOMBRE: </h3></div>
                <div><h3 class="ciPr big">CI/CEL: </h3></div>
                <div>
                    <h3 class="pl">PLACA: </h3>
                    <h3 class="ca">CARRIL: ${esc(datos.ca)}</h3>
                </div>
                <div>
                    <h3 id="fechaPrint" class="big">FECHA: ${esc(datos.fe)}</h3>
                    <h3 id="hrP" class="big">HORA: </h3>
                </div>
                <div>
                    <h3 id="prP" class="big">PRECIO: </h3>
                    <h3 id="asP" class="big">ASIENTO: </h3>
                </div>
                <div><h3 id="emP" class="big">EMITIDO POR: </h3></div>
                <h1 id="bv">¡¡BUEN VIAJE!!</h1>
                <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>No valido para credito fiscal.</p>
            </div>
        `;

        let html = '';
        for (let i = 0; i < numTickets; i++) {
            html += ticketHTML;
            if (i < numTickets - 1) {
                html += '<div style="page-break-after: always;"></div>';
            }
        }
        imprimirHTML({ win, titulo: 'Ticket vacío', cssHref: PRINT_CSS_HREF, cssCritico: PRINT_CSS_CRITICO, html });
    } else if (codP == -2) {
        const descuento = prompt(`CUANTO ES EL DESCUENTO?`, "1");
        if (descuento === null) return;
        const descu = parseInt(descuento);
        if (isNaN(descu) || descu <= 0) {
            alert("Por favor ingresa un descuento valido");
            return;
        }

        const codR = new URLSearchParams(window.location.search).get('codR');
        const win = abrirHojaImpresion({ ancho: 900, alto: 900, titulo: 'Detalle' });
        if (!win) {
            alert("Permite las ventanas emergentes e intenta de nuevo.");
            return;
        }

        fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
            .then(response => response.json())
            .then(data => {
                let total = 0;
                const grouped = data.reduce((acc, pasajero) => {
                    const precio = parseFloat(pasajero.precio) || 0;
                    acc[precio] = (acc[precio] || 0) + 1;
                    total += precio;
                    return acc;
                }, {});

                const preciosHTML = Object.entries(grouped).map(([precio, cantidad]) => {
                    const resultado = cantidad * precio;
                    return `<h3>${esc(cantidad)} * ${esc(precio)} Bs = ${esc(resultado)} Bs</h3>`;
                }).join('');

                const saldo = total - descu;
                const html = `
                    <div id="pasajeroPrintBody">
                        <img id="imgPr2" src="${esc(LOGO_URL)}" alt="Logo">
                        <div id="detalle">
                            <h3 class="botBor lefty">DETALLE DE PASAJES</h3>
                            <div id="precios" class="botBor lefty">${preciosHTML}</div>
                            <h3 id="totalText" class="righty">TOTAL: ${esc(total)} Bs</h3>
                        </div>
                        <br>
                        <div><h3 id="descue" class="marNon">DESCUENTO:...${esc(descu)}.Bs..................</h3></div>
                        <div><h3 id="saldo" class="marNon lefty">SALDO: ${esc(saldo)} Bs</h3></div>
                        <h3 class="blank">---</h3>
                    </div>
                `;
                imprimirHTML({ win, titulo: 'Detalle', cssHref: PRINT_CSS_HREF, cssCritico: PRINT_CSS_CRITICO, html });
            })
            .catch(error => {
                console.error('Error al obtener los pasajeros:', error);
                alert("Error al cargar los pasajeros");
                try { win.close(); } catch (e) {}
            });
    } else {
        showPrintOptionsModal(codP, datos);
    }
}

function showPrintOptionsModal(codP, datos) {
    const modal = document.createElement('div');
    modal.id = 'printOptionsModal';
    modal.className = 'print-options-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'printOptionsTitle');

    modal.innerHTML = `
        <div class="print-options-card">
            <h2 id="printOptionsTitle">Opciones de Impresión</h2>
            <p>Seleccione el formato de impresión:</p>
            <div class="print-options-actions">
                <button id="printFull" class="print-option-btn">COMPLETO</button>
                <button id="printPrice" class="print-option-btn">SOLO PRECIO</button>
                <button id="printTime" class="print-option-btn">SOLO HORA</button>
                <button id="printEmpty" class="print-option-btn">VACIO</button>
                <button id="printCancel" class="print-option-btn cancel-btn">CANCELAR</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const firstOption = modal.querySelector('.print-option-btn');
    if (firstOption) firstOption.focus();

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (modal.parentNode) document.body.removeChild(modal);
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    const openAndPrint = (option) => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        const win = abrirHojaImpresion({ ancho: 900, alto: 900, titulo: 'Ticket' });
        if (!win) {
            alert("Permite las ventanas emergentes e intenta de nuevo.");
            return;
        }
        printIndividualTicket(codP, datos, option, win);
    };

    document.getElementById('printFull').addEventListener('click', () => openAndPrint('full'));
    document.getElementById('printPrice').addEventListener('click', () => openAndPrint('price'));
    document.getElementById('printTime').addEventListener('click', () => openAndPrint('time'));
    document.getElementById('printEmpty').addEventListener('click', () => openAndPrint('empty'));

    document.getElementById('printCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
}

function printIndividualTicket(codP, datos, option, win) {
    const pasajeros = document.querySelectorAll("#dinamic .pasajero");
    let pasajeroEncontrado = null;

    pasajeros.forEach(pasajeroDiv => {
        const boton = pasajeroDiv.querySelector("button");
        if (boton && boton.getAttribute("onclick") === `printy(${codP})`) {
            pasajeroEncontrado = {
                asiento: pasajeroDiv.querySelector(".as").textContent,
                nombre: pasajeroDiv.querySelector(".nm").textContent,
                ci: pasajeroDiv.querySelector(".ci").textContent,
                precio: pasajeroDiv.querySelector(".pr").textContent
            };
        }
    });

    if (!pasajeroEncontrado) {
        alert("No se encontró el pasajero especificado");
        if (win) { try { win.close(); } catch (e) {} }
        return;
    }

    const html = `
        <div id="pasajeroPrintBody">
            <img id="imgPr2" src="${esc(LOGO_URL)}" alt="Logo">
            <div id="adver">
                <div id="fact">
                    <h4 class="marNon strCent">EXIJA SU</h4>
                    <h1 class="marNon strCent">FACTURA</h1>
                </div>
                <div><h3>ESTE BOLETO CONSTITUYE RESERVA DE PASAJE</h3></div>
            </div>
            <div><h3 id="dtP" class="cien">De SC a: ${esc(datos.dt)}</h3></div>
            <div><h3 id="nmP" class="cien">NOMBRE: ${esc(pasajeroEncontrado.nombre)}</h3></div>
            <div><h3 class="ciPr">CI/CEL: ${esc(pasajeroEncontrado.ci)}</h3></div>
            <div>
                <h3 class="pl">PLACA: ${esc(datos.pl)}</h3>
                <h3 class="ca">CARRIL: ${esc(datos.ca)}</h3>
            </div>
            <div>
                <h3 id="fechaPrint">FECHA: ${esc(datos.fe)}</h3>
                <h3 id="hrP">HORA: ${option === 'full' || option === 'time' ? esc(datos.hr) : ''}</h3>
            </div>
            <div>
                <h3 id="prP">PRECIO: ${option === 'full' || option === 'price' ? esc(pasajeroEncontrado.precio) : ''}</h3>
                <h3 id="asP">ASIENTO: ${esc(pasajeroEncontrado.asiento)}</h3>
            </div>
            <div><h3 id="emP" class="big">EMITIDO POR: </h3></div>
            <h1 id="bv">¡¡BUEN VIAJE!!</h1>
            <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>No valido para credito fiscal.</p>
        </div>
    `;

    imprimirHTML({ win, titulo: 'Ticket', cssHref: PRINT_CSS_HREF, cssCritico: PRINT_CSS_CRITICO, html });
}

function printOrdenSalida() {
    const datos = {
        c1: document.getElementById("c1").textContent,
        c2: document.getElementById("c2").textContent,
        l1: document.getElementById("l1").textContent,
        l2: document.getElementById("l2").textContent,
        dt: document.getElementById("dt").textContent,
        pl: document.getElementById("pl").textContent,
        fe: document.getElementById("fe").textContent,
        hr: document.getElementById("hr").textContent,
        marca: document.getElementById("marca").textContent
    };

    const win = abrirHojaImpresion({ preset: 'a4', titulo: 'Orden de salida' });
    if (!win) {
        alert("Permite las ventanas emergentes e intenta de nuevo.");
        return;
    }

    const copyHTML = `
        <div class="os-copy">
            <div class="os-content">
                <div class="os-header">
                    <img class="os-logo" src="${esc(LOGO_URL)}" alt="Logo">
                    <h2 class="os-salida">ORDEN DE SALIDA</h2>
                </div>
                <div class="os-body">
                    <div class="os-left">
                        <h4>CONDUCTOR:<span>..</span>${esc(datos.c1)}<span>..</span></h4>
                        <h4>CONDUCTOR:<span>..</span>${esc(datos.c2)}<span>..</span></h4>
                        <h4>MARCA:<span>..</span>${esc(datos.marca)}<span>..</span></h4>
                        <h4>DESTINO:<span>..</span>${esc(datos.dt)}<span>..</span></h4>
                    </div>
                    <div class="os-right">
                        <h4>BREVET:${esc(datos.l1)}</h4>
                        <h4>BREVET:${esc(datos.l2)}</h4>
                        <h4>PLACA:${esc(datos.pl)}</h4>
                        <h4>HR.SALIDA:${esc(datos.hr)}</h4>
                    </div>
                </div>
                <h5 class="os-fecha">..SANTA..CRUZ.....${esc(datos.fe)}..</h5>
                <div class="os-signatures">
                    <h4 class="os-sig">Administrador</h4>
                    <h4 class="os-sig">VºBº JEFE SECC. TECNICA</h4>
                </div>
            </div>
        </div>
    `;

    const html = copyHTML.replace('<div class="os-copy">', '<div class="os-copy" style="page-break-after: always;">') + copyHTML;
    imprimirHTML({ win, titulo: 'Orden de salida', cssHref: PRINT_CSS_HREF, cssCritico: PRINT_CSS_CRITICO, html });
}
function del() {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este reporte?");
    if (!confirmacion) return;

    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');

    fetch(`php/editar/eliminarReporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location = "menu.html"; 
            } else {
                alert("Error al eliminar: " + (data.error || "Error desconocido"));
            }
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
            alert("Ocurrió un error al intentar eliminar el reporte.");
        });
}

document.addEventListener('keydown', (event) => {
    const lista = document.getElementById('lista');
    if (!lista) return;

    const SCROLL_AMOUNT = 60; // Puedes ajustar este valor

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