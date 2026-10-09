/* @layer renderer-lib @kind logic */
import { readCustomLayouts } from './read-custom-layouts';
import { writeCustomLayouts } from './write-custom-layouts';

const deleteCustomLayout = async (id: string): Promise<void> => {
  const { documents } = await readCustomLayouts();
  await writeCustomLayouts(documents.filter((doc) => doc.id !== id));
};

export { deleteCustomLayout };
