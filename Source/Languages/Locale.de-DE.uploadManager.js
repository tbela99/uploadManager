/*
---
name: Locale.de-DE.uploadManager
description: German Language File for uploadManager
authors: Matthias Jobst
requires: [More/Locale]
provides: Locale.de-DE.uploadManager
...
*/

Locale.define('de-DE', 'uploadManager', {
    BROWSE: 'Datei wählen ...',
    CANCEL: 'Abbrechen',
	DROP_FILE_HERE: 'Dateien hier ablegen',
	EMPTY_FILE: 'Die gewählte Datei ist leer',
	FILE_CORRUPTED: 'Fehler beim Hochladen der Datei',
    MAX_FILE_SIZE_EXCEEDED: function (size) {
	
		return 'Datei zu groß (maximale Dateigröße: ' + size + ')'
	},
	PAUSE: 'Pausieren',
	PREFETCH_FAILED: 'Datei-Infos konnten nicht hochgeladen werden',
	RESUME: 'Fortsetzen',
	RETRY: 'Erneut versuchen',
    TOTAL_FILES_SIZE_EXCEEDED: function (size) {
	
		return 'Dateien zu groß (maximale Gesamtgröße ' + size + ')'
	},
	UPLOADING: 'Upload läuft, bitte warten ...',
    UNAUTHORIZED_FILE_TYPE: 'Dateityp nicht erlaubt'
});

