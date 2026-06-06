<!-- @layer docs @kind doc -->
# Haptics

Vibration feedback for supported controllers, triggered by in-game events.

---

## Supported Controllers

Haptics work with any controller that supports rumble/vibration through the Gamepad API:

- **Nintendo Switch Pro Controller** (v1 and v2)
- **Xbox controllers** (Xbox One, Series X|S)
- **PlayStation controllers** (DualShock 3, DualShock 4, DualSense)
- **8BitDo controllers** (Pro 2, Ultimate, etc.)
- **GameCube wireless adapter**

The vibration intensity and duration varies by event type.

---

## Events

Each event can be individually toggled on or off in Profile Settings → Haptics:

| Event | Description |
|-------|-------------|
| Sword swing | Light pulse on each sword attack |
| Hookshot impact | Medium vibration when hookshot connects |
| Damage taken | Sharp vibration when Link takes damage |
| Boss kill | Strong, sustained vibration on boss defeat |
| Locked door | Short buzz when hitting a locked door |
| Item pickup | Gentle pulse on collecting an item |
| Bomb explosion | Heavy rumble on bomb detonation |
| Fall into pit | Medium vibration on falling |

---

## Configuration

- **Per-event toggle** — enable or disable vibration for each event type individually
- **Per-profile** — haptic settings are stored per-profile

---

## Troubleshooting

If vibration doesn't work:
1. Verify your controller supports rumble
2. Check that the controller is properly connected (not just keyboard-mapped)
3. Use the **Input Calibration** tool (Menu → Advanced → Input Calibration) — it has a vibration tester that sends a test pulse
4. Some Bluetooth connections may not support rumble — try wired if available
