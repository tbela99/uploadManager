/*
---
name: Locale.en-CO.uploadManager
description: Espanish-Colombia Language File for uploadManager
authors: David Avellaneda
requires: [More/Locale]
provides: Locale.es-CO.uploadManager
...
*/

Locale.define('es-CO', 'uploadManager', {
    BROWSE: 'Buscar...',
    CANCEL: 'Cancelar',
	DROP_FILE_HERE: 'Suelta archivos aquí',
	EMPTY_FILE: 'El archivo seleccionado está vacío',
	FILE_CORRUPTED: 'El archivo subido ha sido corrompido',
    MAX_FILE_SIZE_EXCEEDED: function (size) {
		return 'Archivo muy grande (el tamaño no debe exceder ' + size + ')'
	},
	PAUSE: 'Pausar',
	PREFETCH_FAILED: 'No se pudo cargar la información del archivo',
	RESUME: 'Resumir',
	RETRY: 'Reintentar',
    TOTAL_FILES_SIZE_EXCEEDED: function (size) {
	
		return 'Archivo muy grande (el tamaño no debe exceder ' + size + ')'
	},
	UPLOADING: 'subiendo, por favor espere ...',
    UNAUTHORIZED_FILE_TYPE: 'Tipo de archivo no autorizado'
});
