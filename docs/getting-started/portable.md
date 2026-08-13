<!-- @layer docs @kind doc -->
# Portable Mode

You can run the app from a folder you choose, with your profiles, saves and imported
files kept in that same folder. Move the folder to another drive, another PC or a USB
key and everything comes with it.

---

## Setting it up

Download `rotp-windows-portable.zip` and unzip it wherever you want it. That's the
whole setup: a portable copy keeps its data beside itself from the first launch.

Your folder looks like this:

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

## Turning a normal installation portable

An installed copy uses `%APPDATA%\relic-of-the-past` like any other Windows app. If
you'd rather it kept its files with itself, create a folder named `data` next to
`Update.exe` in the installation folder:

```
%LOCALAPPDATA%\relic-of-the-past\
├── Update.exe
└── data/          ← create this
```

From the next launch, everything is written there instead.

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

- **Two copies on one machine don't collide.** An installed copy and a portable one
  keep separate data, because only the portable one has a `data` folder.
- **Running from a slow USB key is slower to start.** The app is a few hundred MB and
  has to be read from the key each launch.
- **ROMs and assets live in `data` too**, so a portable copy carries everything it
  needs to run once you've imported them.
