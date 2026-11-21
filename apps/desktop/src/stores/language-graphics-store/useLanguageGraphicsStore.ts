/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { NO_LANGUAGE_GRAPHICS } from './language-graphics.constants';
import type { LanguageGraphicsStore } from './language-graphics-store.type';

const useLanguageGraphicsStore = create<LanguageGraphicsStore>()((set) => ({
  ...NO_LANGUAGE_GRAPHICS,
  setAvailability: ({ pieces, japanese }) => set({ pieces, japanese }),
}));

export { useLanguageGraphicsStore };
