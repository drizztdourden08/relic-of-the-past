/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';

/** Step 1 — explains what the report does before asking for anything. */
const IntroStep = () => {
  return (
    <>
      <Text as="p">
        This walks through reporting a controller that isn't working right. It takes four short steps:
        a quick explanation (this one), your contact info, a guided run through the controller's inputs
        (Gamepad Diagnostics), and a final review before anything is sent.
      </Text>
      <Text as="p">
        The report includes the controller model we detected, the closest match in our known-controller
        database, the type of connection detected, the raw HID data read from the device, and the
        diagnostics report captured in the next step, all of it visible to you before you send it.
      </Text>
    </>
  );
};

export { IntroStep };
