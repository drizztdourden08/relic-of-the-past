/* @layer renderer-components @kind hook */
/**
 * THE EDITOR'S OWN STEP, CARRIED TO EVERY NUMBER IN THE PANEL (§56).
 *
 * > "what the hell. we already have a numbered input.... we don't need a new
 * > one."
 *
 * §55 answered "a gap should step by the editor's step" by building a second
 * numeric control (`StepNumberInput`: `− [ValueInput] +` with the spinner
 * hidden). That was a whole component for one prop. `ValueInput` has taken a
 * `step` since §36, which its arrow keys and its spinner already obey, so the
 * only thing missing was a way for the step to REACH the field without being
 * threaded through the ~25 call sites that never asked about it.
 *
 * SO IT IS A CONTEXT, AND `ValueField` USES IT AS A DEFAULT. The same argument
 * `formula-scope.ts` makes for its own: the View knows the editor's step, every
 * field is somewhere under the View, and not one of the intervening components
 * has an opinion about it. A field that passes its own `step` still wins.
 * `opacity` steps by 0.05 whatever the strip says, because 0.05 is a fact about
 * the property and 8 is a fact about the session.
 *
 * THE DEFAULT IS 1, NOT THE STORE'S VALUE. A field rendered outside the
 * provider (an SSR measurement rig, a jsdom fixture) steps by one, which is
 * what every `ValueInput` did before this file existed. The provider is the
 * only thing that reads `hud-editor-view-store`, and it is the View.
 */
import { createContext, useContext } from 'react';

const EditorStepContext = createContext<number>(1);

/** The step a number with no opinion of its own should move by. */
const useEditorStep = (): number => useContext(EditorStepContext);

export { EditorStepContext, useEditorStep };
