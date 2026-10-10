/* @layer shared-hud @kind constants */
const MAX_EXPR_LENGTH = 500;

const REFUSED_FUNCTIONS = ['random'] as const;

const REFUSED_MESSAGE: Readonly<Record<(typeof REFUSED_FUNCTIONS)[number], string>> = {
  random: 'random() re-rolls on every frame, so a layout using it can never be previewed, diffed or reproduced',
};

export { MAX_EXPR_LENGTH, REFUSED_FUNCTIONS, REFUSED_MESSAGE };
