/* @layer hub-core @kind types */
type JarSlot = 'session' | 'oauth';
type Jar = Partial<Record<JarSlot, string>>;

export type { JarSlot, Jar };
