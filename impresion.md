
crea una nueva opcion de impresion en ver.html con el nombre de ORDEN DE SALIDA, y ahi al imprimir tendriamos este formato 
div rotate 90deg
    div
    	logoXXF.png
    	h1 orden de salida
    /div
    div flex
    	div width 60%
    		h3 conductor:...${reporte.conductor1}
    		h3 conductor:...${reporte.conductor2}
    		h3 marca:...${flota.marca}
    		h3 destino:...${reporte.destino}
    	/div
    	div width 40%
    		h3 Brevet:...${reporte.licencia1}
    		h3 Brevet:...${reporte.licencia2}
    		h3 Placa:...${reporte.placa}
    		h3 Hr. Salida:...${reporte.hora}
    	/div
    /div	
    h3 SANTA CRUZ ....${reporte.fecha}
    div flex space-around
    	h3 border-top 1px solid black Administrador
    	h3 border-top 1px solid black V°B° JEFE SECC. TECNICA
    /div 
/div 