<!-- @layer docs @kind doc -->
# Controller Calibration

Calibration tunes the analog inputs of a controller: its sticks and its triggers. It lives under
**Advanced > Controllers**. It pairs with [Input & Controllers](input-controllers.md) for button
mapping and [Haptics](haptics.md) for rumble.

## Where to find it

1. Open **Advanced > Controllers** in the menu.
2. The **Directory** page lists every controller the app can see. Use **Rescan controllers** if
   yours is missing.
3. Each connected controller also has its own **pad page**. It draws the controller with a callout
   for every input, and shows the sticks, triggers and buttons live as you press them.

The **Logs** page lists when controllers connected and disconnected, which helps when a pad keeps
dropping out.

## Calibrating a stick or trigger

On the pad page, each stick and each analog trigger (such as L2 and R2) has a **Calibrate** button.

- **Sticks:** rotate the stick through its full range. The app fits that range and lets you set a
  dead zone, with a tester circle showing the live stick position.
- **Triggers:** set the resting value, the fully pressed value and a dead zone, so partial presses
  register and a resting trigger reads as released.

A stick or trigger that has been calibrated says so on its pad page. Calibration is saved per
controller and applies to every profile.

## Diagnostics

If a controller misbehaves, open **Diagnostics** under **Advanced > Controllers**, or choose
**Run diagnostics** in the Controller box of its pad page. A guided wizard asks you to press the
controller's buttons and move its sticks, then shows what the controller reported. If something
still does not work, you can send the result as a controller report from the same place.

## Checking buttons and rumble

- **Buttons:** press them on the pad page and watch them light up to confirm the controller reports
  what you expect.
- **Rumble:** the pad page has test buttons that fire a vibration, to confirm haptics work.

Button bindings, meaning which controller button maps to which SNES or app action, are saved
separately in your input profile. See [Input & Controllers](input-controllers.md).
