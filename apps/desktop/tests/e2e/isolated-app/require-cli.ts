/* @layer tests @kind helper */
const E2E_VIA_CLI_ENV = 'ROTP_E2E_VIA_CLI';

const assertLaunchedViaCli = (): void => {
  if (process.env[E2E_VIA_CLI_ENV] === '1') return;
  throw new Error(
    `Refusing to launch the app: ${E2E_VIA_CLI_ENV} is not set. Kept specs run only through the rotp CLI: ` +
      '`rotp worktree e2e <name> [spec-filter...]`. Nothing launches Electron directly.',
  );
};

export { E2E_VIA_CLI_ENV, assertLaunchedViaCli };
