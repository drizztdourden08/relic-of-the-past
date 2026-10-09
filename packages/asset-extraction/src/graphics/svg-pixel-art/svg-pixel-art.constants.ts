/* @layer shared-asset-extraction @kind constants */
const VIEWBOX_RE = /\bviewBox="\s*-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?\s+(\d+)\s+(\d+)\s*"/;
const RECT_RE = /<rect\b([^>]*?)\/?>/g;

export { RECT_RE, VIEWBOX_RE };
