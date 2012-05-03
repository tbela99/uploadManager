/*
---
name: Locale.en-US.uploadManager
description: English Language File for uploadManager
authors: Thierry Bela
requires: [More/Locale]
provides: Locale.en-US.uploadManager
...
*/

Locale.define('en-US', 'uploadManager', {
    BROWSE: 'Browse ...',
    CANCEL: 'Cancel',
	DROP_FILE_HERE: 'Drop files here',
	EMPTY_FILE: 'The selected file is empty',
	FILE_CORRUPTED: 'Uploaded file has been corrupted',
    MAX_FILE_SIZE_EXCEEDED: function (size) {
	
		return 'File too big (size must not exceed ' + size + ')'
	},
	PAUSE: 'Pause',
	PREFETCH_FAILED: 'Failed to prefetch file infos',
	RESUME: 'Resume',
	RETRY: 'Retry',
    TOTAL_FILES_SIZE_EXCEEDED: function (size) {
	
		return 'File too big (total size must not exceed ' + size + ')'
	},
	UPLOADING: 'uploading, please wait ...',
    UNAUTHORIZED_FILE_TYPE: 'Unauthorized file type'
});
