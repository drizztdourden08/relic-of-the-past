/* @layer tooling-scripts @kind logic */

const parseArgs = (argv) => {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const body = arg.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      options[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      options[body] = next;
      i++;
    } else {
      options[body] = true;
    }
  }

  return { positional, options };
};

const flag = (options, name) => options[name] === true || options[name] === 'true';

export { flag, parseArgs };
