<!-- @layer docs @kind doc -->
# Portable Mode

You can run the app from a folder you choose, with your profiles, saves and imported
files kept in that same folder. Move the folder to another drive, another PC or a USB
key and everything comes with it.

---

## Setting it up

Install the app the normal way, then create a folder named `data` next to `Update.exe`
in the installation folder. From the next launch, everything of yours is written there
instead of in your user profile.

If you want it somewhere you choose, such as a USB key or another drive, pick that
location on the installer's first screen and create the `data` folder there.

Your folder ends up looking like this:

```
Relic of the Past/
├── Relic of the Past.exe   ← run this
├── Update.exe
├── data/                   ← everything of yours lives here
└── current/
```

Nothing is written outside that folder, and nothing is left behind on the machine you
run it from.

> **Don't put anything in `current/`.** That folder is replaced completely every time
> the app updates itself. `data` sits beside it for exactly that reason.

---

## Bringing your existing files across

Without a `data` folder, the app uses `%APPDATA%\relic-of-the-past` like any other
Windows app. The default installation folder is:

```
%LOCALAPPDATA%\relic-of-the-past\
├── Update.exe
└── data/          ← create this
```

Your existing profiles and saves aren't deleted, they're just no longer read. They're
still in `%APPDATA%\relic-of-the-past`, so you can copy them into the new `data`
folder to bring them across, or delete the `data` folder to go back to how it was.

---

## macOS and Linux

The same rule, in the place each platform expects.

| Platform | Where `data` goes |
|----------|-------------------|
| Windows  | Beside `Update.exe`, in the app's folder |
| Linux    | Beside the AppImage |
| macOS    | Next to the `.app` bundle, not inside it |

On Linux you can also use AppImage's own convention, a folder named
`<the AppImage's filename>.home`, if you already use that for other apps. Either works.

---

## Updating

A portable copy updates itself in place, exactly like an installed one: the app tells
you when a new version is out and applies it when you accept. Your `data` folder is
untouched by an update.

---

## Things worth knowing

- **Two copies on one machine don't collide.** Only the copy with a `data` folder keeps
  its files beside itself, so the other one carries on using your user profile.
- **Running from a slow USB key is slower to start.** The app is a few hundred MB and
  has to be read from the key each launch.
- **ROMs and assets live in `data` too**, so a portable copy carries everything it
  needs to run once you've imported them.
