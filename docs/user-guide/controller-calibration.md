<!-- @layer docs @kind doc -->
# Controller Calibration

The **Input Calibration** view, reached from Menu → controller diagnostics or the input-tester page,
detects your controller and tunes its analog inputs. It pairs with
[Input & Controllers](input-controllers.md) for button mapping and [Haptics](haptics.md) for rumble.

## What you can calibrate

- **Detection** — finds connected controllers through the Gamepad API and HID.
- **Stick calibration wizard** — rotate each stick through its full range. The tool fits that range and
  lets you set a dead zone per stick, with a tester circle showing the live stick position.
- **Trigger calibration** — per analog axis such as L2 and R2: base value, max value, and deadzone, so
  partial presses and resting values read correctly.
- **Button mapping check** — press buttons to see them light up and confirm the device reports what you
  expect.
- **Vibration test** — fire rumble to confirm haptics work on the device.

## How it's stored

- **Stick calibration** — global, keyed per device by VID:PID.
- **Trigger calibration** — saved per device and per axis.
- Both persist through the Electron `input` domain (`readStickCalibration`/`writeStickCalibration`,
  `readTriggerCalibration`/`writeTriggerCalibration`), so a controller stays calibrated across profiles.

Button bindings, meaning which controller button maps to which SNES or app action, are saved
separately as per-profile input profiles. See [Input & Controllers](input-controllers.md).
