/* @layer site-kit @kind logic */
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export { errorMessage };
