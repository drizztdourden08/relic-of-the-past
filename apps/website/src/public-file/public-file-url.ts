/* @layer website-site @kind logic */
const publicFileUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export { publicFileUrl };
