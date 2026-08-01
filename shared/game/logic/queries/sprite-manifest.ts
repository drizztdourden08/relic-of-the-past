/* @layer shared-game @kind logic */
let spritesBase = '/sprites/items/';

const setSpritesBase = (base: string): void => {
  spritesBase = base;
};

const getSpritesBase = (): string => spritesBase;

const getSpritePath = (file: string): string => `${getSpritesBase()}${file}.png`;

export { getSpritePath, getSpritesBase, setSpritesBase };
