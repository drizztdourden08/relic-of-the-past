/* @layer renderer-components @kind constants */
// Gizmo geometry constants (shared by hit-test + render).
const AXIS_LEN = 48;           // Length of axis arrows in px
const ARROW_SIZE = 8;          // Arrow head size
const HANDLE_RADIUS = 5;       // Hit radius for handles
const CROSS_SIZE = 8;          // Cross mark size on axes
const CROSS_OFFSET = 0.55;     // Position of resize cross along axis (0-1)
const UNIFORM_OFFSET = 0.7;    // Position of uniform resize on diagonal
const ROTATE_OFFSET = 1.3;     // Rotation handle distance (multiplier of AXIS_LEN)
const CENTER_RADIUS = 7;       // Center move handle size
const VERTEX_RADIUS = 4;       // Vertex point radius
const RADIUS_HANDLE_DIST = 16; // Distance from vertex to radius handle

export { AXIS_LEN, ARROW_SIZE, HANDLE_RADIUS, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS, VERTEX_RADIUS, RADIUS_HANDLE_DIST };
