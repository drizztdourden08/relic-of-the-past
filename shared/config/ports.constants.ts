/* @layer shared-config @kind constants */
/**
 * The project's fixed block of local ports, and the one place a port number is written.
 * The block starts at 1991, the year the game was released. Each role sits at a fixed
 * offset from the base, and a checkout with port slot N (see port-slot.ts) shifts the whole
 * block by 10 x N, so two checkouts never serve on the same port. The main checkout is
 * slot 0.
 */
const PORT_BASE = 1991;
const PORTS_PER_SLOT = 10;

const PORT_OFFSET = {
  /** The app's renderer dev server (electron-vite dev). */
  renderer: 0,
  /** A component catalogue. None today; the offset stays reserved. */
  catalogue: 1,
  /** The Sanctuary website dev server. */
  site: 2,
  /** The Sanctuary API, run locally by the functions-framework. */
  siteApi: 3,
  /** A static file server, for install manifests and previews. */
  static: 4,
  /** The mGBA Lua socket tracer that reads the second cartridge live. */
  mgbaTracer: 5,
} as const;

type PortRole = keyof typeof PORT_OFFSET;

/** The Archipelago server's default port. Not ours: it belongs to the multiworld protocol. */
const ARCHIPELAGO_DEFAULT_PORT = 38281;

const portFor = (role: PortRole, slot = 0): number => PORT_BASE + PORTS_PER_SLOT * slot + PORT_OFFSET[role];

export { ARCHIPELAGO_DEFAULT_PORT, PORT_BASE, PORT_OFFSET, PORTS_PER_SLOT, portFor };
export type { PortRole };
