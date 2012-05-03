/*
---
name: Locale.fr-FR.uploadManager
description: French Language File for uploadManager
authors: Thierry Bela
requires: [More/Locale]
provides: Locale.fr-FR.uploadManager
...
*/

Locale.define('fr-FR', 'uploadManager', {
    BROWSE: 'Parcourir ...',
    CANCEL: 'Annuler',
	DROP_FILE_HERE: 'Déposer les fichiers ici',
	EMPTY_FILE: 'Le fichier sélectionné est vide',
	FILE_CORRUPTED: 'Le fichier téléchargé est endommagé',
    MAX_FILE_SIZE_EXCEEDED: function (size) {
	
		return 'Fichier trop grand (la taille ne peut excéder ' + size + ')'
	},
	PAUSE: 'Pause',
	PREFETCH_FAILED: 'Impossible de récuperer les infos du fichier',
	RESUME: 'Resume',
	RETRY: 'Réessayer',
    TOTAL_FILES_SIZE_EXCEEDED: function (size) {
	
		return 'Fichier trop grand (le total ne peut excéder ' + size + ')'
	},
	UPLOADING: 'Transfert en cours, veuillez patienter ...',
    UNAUTHORIZED_FILE_TYPE: 'Type de fichier non autorisé'
});
