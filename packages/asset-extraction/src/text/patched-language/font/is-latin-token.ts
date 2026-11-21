/* @layer shared-asset-extraction @kind logic */
const isLatinToken = (token: string): boolean => !/\p{L}/u.test(token) || /^[\p{Script=Latin}\P{L}]+$/u.test(token);

export { isLatinToken };
