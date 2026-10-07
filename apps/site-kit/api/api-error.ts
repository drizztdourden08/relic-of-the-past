/* @layer site-kit @kind logic */
/** What a failed call throws: the status and the server's own one-line message. */
class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export { ApiError, errorMessage };
