/**
 * Functions for handling files (downloads, uploads, etc.)
 * @module @lumjs/web-core/files
 */
'use strict';

/**
 * Initiate a file download.
 * @alias module:@lumjs/web-core/files.download
 * @param {(string|File)} data - Data to download.
 * @param {object} [opts] Options.
 * @param {string} [opts.name] Filename to use.
 * 
 * This option is **MANDATORY** if `data` is a string.
 * It's not used at all if data is a File object.
 * 
 * @param {string} [opts.type] MIME type for download.
 * 
 * Only used if `data` is a string.
 * 
 * @returns {void}
 */
function download(data, opts = {}) {

  if (typeof data === 'string') {
    let filename = opts.filename ?? opts.name;

    if (typeof filename !== 'string' || filename.trim() === '') {
      throw new RangeError('must specify a filename with string data');
    }

    data = new File([data], filename, opts);
  }
  else if (!(data instanceof File)) {
    throw new TypeError('data must be a string or a File object');
  }

  let url = URL.createObjectURL(data);
  let a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', data.name);

  document.body.append(a);
  a.click();
  a.remove();
  
  URL.revokeObjectURL(url);
}

module.exports = { download };
