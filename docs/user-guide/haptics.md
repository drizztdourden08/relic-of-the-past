<!-- @layer docs @kind doc -->
# Haptics

Vibration feedback for supported controllers, triggered by in-game events.

---

## Supported Controllers

Haptics work with any controller that supports rumble through the Gamepad API:

- **Nintendo Switch Pro Controller**, v1 and v2
- **Xbox controllers**, including Xbox One and Series X|S
- **PlayStation controllers**, including DualShock 3, DualShock 4, and DualSense
- **8BitDo controllers** such as the Pro 2 and Ultimate
- **GameCube wireless adapter**

Intensity and duration vary by event type.

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

- **Per-event toggle** — turn vibration on or off for each event type on its own
- **Per-profile** — haptic settings are saved per profile

---

## Troubleshooting

If vibration doesn't work:

1. Check that your controller supports rumble
2. Make sure the controller is actually connected, not just keyboard-mapped
3. Open the **Input Calibration** tool from Menu → Advanced → Input Calibration and use its vibration tester to send a test pulse
4. Some Bluetooth connections don't carry rumble, so try a wired connection if you have one
