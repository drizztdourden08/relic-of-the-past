/* @layer renderer-components @kind constants */

/* Exit-fullscreen (inward arrows), 16-unit viewBox. */
const FULLSCREEN_EXIT_PATHS = [
  'M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 0a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z',
];

/* Enter-fullscreen (outward arrows), 16-unit viewBox. */
const FULLSCREEN_ENTER_PATHS = [
  'M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5',
];

/* Minimize (bar), 12-unit viewBox. */
const MINIMIZE_PATHS = ['M1 5.5h10v1H1z'];

/* Restore (overlapping squares), 12-unit viewBox. */
const RESTORE_PATHS = ['M3 1h8v8h-2v2H1V3h2V1zm1 1v1h5v5h1V2H4zm-2 2v6h6V4H2z'];

/* Maximize (square frame), 12-unit viewBox. */
const MAXIMIZE_PATHS = ['M1 1h10v10H1V1zm1.2 1.2v7.6h7.6V2.2H2.2z'];

/* Close (×), 12-unit viewBox. */
const CLOSE_PATHS = ['M1.5 0.5L6 5L10.5 0.5L11.5 1.5L7 6L11.5 10.5L10.5 11.5L6 7L1.5 11.5L0.5 10.5L5 6L0.5 1.5Z'];

export {
  FULLSCREEN_EXIT_PATHS,
  FULLSCREEN_ENTER_PATHS,
  MINIMIZE_PATHS,
  RESTORE_PATHS,
  MAXIMIZE_PATHS,
  CLOSE_PATHS,
};
