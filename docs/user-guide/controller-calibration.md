<!-- @layer docs @kind doc -->
# Controller Calibration

The **Input Calibration** view (Menu → controller diagnostics / the input-tester page) detects your
controller and tunes its analog inputs. Complements [Input & Controllers](input-controllers.md)
(button mapping) and [Haptics](haptics.md) (rumble).

## What you can calibrate

- **Detection** — auto-detects connected controllers (Gamepad API + HID).
- **Stick calibration wizard** — rotate each stick through its full range; the tool fits the range and
  lets you set a **dead zone** per stick. A visual tester circle shows live stick position.
- **Trigger calibration** — per analog axis (L2/R2/…): base value, max value, and deadzone, so partial
  presses and resting values read correctly.
- **Button mapping check** — press buttons to see them light up; confirms the device reports as expected.
- **Vibration test** — fire rumble to confirm haptics work on the device.

## How it's stored

- **Stick calibration** — global, keyed per device (VID:PID).
- **Trigger calibration** — per device **and** per axis.
- Both persist via the Electron `input` domain (`readStickCalibration`/`writeStickCalibration`,
  `readTriggerCalibration`/`writeTriggerCalibration`), so a controller stays calibrated across profiles.

Button **bindings** (which controller button maps to which SNES/app action) are saved separately as
per-profile input profiles — see [Input & Controllers](input-controllers.md).
