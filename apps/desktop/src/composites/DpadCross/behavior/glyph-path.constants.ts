/* @layer renderer-components @kind constants */
const ACCENT_CLASS = 'input-icon__accent';
const PATH_TAG = /<path\b[^>]*>/g;
const PATH_DATA = /\sd="([^"]*)"/;
const PATH_NUMBER = /-?\d+(?:\.\d+)?/g;

export { ACCENT_CLASS, PATH_DATA, PATH_NUMBER, PATH_TAG };
