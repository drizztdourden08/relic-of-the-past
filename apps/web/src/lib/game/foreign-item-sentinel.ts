/* @layer bridge-wasm @kind data */
/**
 * The foreign-item sentinel as the core defines it (foreign_item.c FOREIGN_ITEM_ID), mirrored
 * so a plan can carry it without a running core. tests/randomizer/ap-online-core.keep.test.ts
 * parses the C source and fails the moment the two disagree.
 *
 * The icon ids are the same item held up with a game icon: id FOREIGN_ICON_FIRST_ID + n shows
 * picture n of foreign-icons.4bpp (FOREIGN_ICON_FILES order). Mirrored from the core's
 * FOREIGN_ICON_FIRST and FOREIGN_ICON_LAST the same way.
 */
const FOREIGN_ITEM_ID = 0xfe;
const FOREIGN_ICON_FIRST_ID = 0xb0;
const FOREIGN_ICON_LAST_ID = 0xbf;

/** Whether |id| is one of the icon ids. */
const isForeignIconId = (id: number): boolean => id >= FOREIGN_ICON_FIRST_ID && id <= FOREIGN_ICON_LAST_ID;

export { FOREIGN_ICON_FIRST_ID, FOREIGN_ICON_LAST_ID, FOREIGN_ITEM_ID, isForeignIconId };
