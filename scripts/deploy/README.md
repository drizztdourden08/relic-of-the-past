<!-- @layer tooling-scripts @kind doc -->
# Deploy — Linux test VM + Android tester

Push a testing build to a **full Linux VM** (where a real USB controller works) and
to an **Android emulator** from this Windows dev box.

- **WSL2 = build engine only.** It builds the Linux AppImage; it never runs the app
  (its kernel has no HID drivers, so controllers can't be tested there).
- **Full VM (VirtualBox) = the Linux test target.** A passed-through USB controller
  shows up natively so `node-hid`/`usb` enumerate it.
- **Android = emulator/AVD**, deployed via the existing `android:run` (Capacitor).

```
push:linux :  Windows tree --rsync--> WSL ~/relic --build--> AppImage --scp/ssh--> VM (launch + controller)
push:android:  ensure AVD up --> npm run android:run (build:web -> cap sync -> cap run)
```

Commands once everything is set up:

```powershell
npm run push:linux                  # build in WSL, push + launch on the VM
npm run push:linux -- --build-only  # just build the AppImage in WSL (no VM)
npm run emulator:start              # boot the Android AVD
npm run push:android                # ensure emulator up, then deploy the Capacitor build
npm run push:android -- --apk <path>  # install a prebuilt APK instead
```

Local target config lives in `vm.json` (gitignored). Copy `vm.example.json` →
`vm.json` and fill the `vm` block after the VM exists.

---

## Stage 1 — WSL build engine  *(you; ~15 min, mostly downloads)*

WSL2 is already enabled on this machine, so no reboot is expected.

1. **Elevated PowerShell** (Win+X → *Terminal (Admin)*):

   ```powershell
   wsl --install -d Ubuntu-24.04
   wsl --update
   ```

   The first Ubuntu launch asks you to **create a Linux username + password** — set
   them (this password is your `sudo` password below). Install docs:
   <https://learn.microsoft.com/windows/wsl/install>

2. **In the Ubuntu shell**, bootstrap the build toolchain (asks your sudo password):

   ```bash
   bash /mnt/e/GameProjects/relic-of-the-past/scripts/deploy/setup-wsl-builder.sh
   ```

   Installs Node 24 (via nvm) + `node-hid`/`usb` build deps. nvm: <https://github.com/nvm-sh/nvm>

→ **Tell me when this is done.** I'll run `npm run push:linux -- --build-only` to
prove the AppImage builds inside WSL.

---

## Stage 3 — Full Linux test VM  *(you; ~30–45 min)*

1. **Install VirtualBox** (PowerShell — winget is present):

   ```powershell
   winget install -e --id Oracle.VirtualBox
   ```

   Then the **Extension Pack** (needed for USB passthrough) — download and install
   via *File → Tools → Extension Pack Manager*: <https://www.virtualbox.org/wiki/Downloads>

2. **Get the Ubuntu 24.04 Desktop ISO:** <https://ubuntu.com/download/desktop>

3. **Create the VM** (VirtualBox UI): *New* → Type *Linux* / Ubuntu (64-bit) →
   4096 MB+ RAM, 2+ CPUs, 25 GB+ disk → attach the ISO → run the Ubuntu installer
   (normal install, create your user). Guide:
   <https://ubuntu.com/tutorials/install-ubuntu-desktop>

4. **Network so Windows can SSH in** — VM *Settings → Network*, either:
   - keep **NAT** and add a port-forward (Adapter 1 → Advanced → Port Forwarding:
     host `127.0.0.1:2222` → guest `:22`), or
   - add a second **Host-Only** adapter (gives a stable `192.168.56.x` IP).

5. **Controller passthrough** — VM *Settings → USB* → enable **USB 3.0 (xHCI)** →
   click *+* and pick your controller to add a device filter. (Wired pads / USB
   dongles work directly; a Bluetooth controller needs a USB BT adapter passed
   through.) Then start the VM and plug the controller in. USB docs:
   <https://docs.oracle.com/en/virtualization/virtualbox/7.0/user/usb-support.html>

6. **Inside the VM**, run the runtime bootstrap (clone the repo there, or just copy
   the one script over):

   ```bash
   bash setup-vm-runtime.sh
   ```

   Installs SSH + Electron runtime libs + the HID udev rule, and **prints the line
   to paste into `vm.json`** (host IP + user). Log out/in once afterward.

7. **On Windows**, create the target config:

   ```powershell
   Copy-Item scripts\deploy\vm.example.json scripts\deploy\vm.json
   ```

   Edit `vm.json` → set `vm.host` (the VM IP, or `127.0.0.1` if you used NAT
   port-forward), `vm.user`, and optionally `vm.identityFile` (a **WSL-side** key
   path — `scp`/`ssh` run inside WSL). Set up a key once for passwordless push:

   ```bash
   # in WSL:
   ssh-keygen -t ed25519
   ssh-copy-id <user>@<vm-host>
   ```

→ **Tell me when `vm.json` is filled.** I'll run `npm run push:linux` end-to-end
(build → scp → launch on the VM) so you can confirm the controller enumerates.

---

## Stage 5 — Android SDK + emulator  *(you; ~20 min + downloads)*

1. **JDK 17** (PowerShell):

   ```powershell
   winget install -e --id EclipseAdoptium.Temurin.17.JDK
   ```

2. **Android command-line tools** (no full Android Studio needed): download
   "Command line tools only", unzip to e.g. `C:\Android\cmdline-tools\latest\`:
   <https://developer.android.com/studio#command-line-tools-only>

3. **Set env vars** (PowerShell, then reopen the terminal):

   ```powershell
   setx ANDROID_HOME "C:\Android"
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17"
   ```

4. **Install SDK packages + create the AVD**:

   ```powershell
   cd C:\Android\cmdline-tools\latest\bin
   .\sdkmanager.bat "platform-tools" "emulator" "platforms;android-34" "build-tools;34.0.0" "system-images;android-34;google_apis;x86_64"
   .\avdmanager.bat create avd -n rotp_test -k "system-images;android-34;google_apis;x86_64"
   ```

   `sdkmanager` reference: <https://developer.android.com/tools/sdkmanager>
   (Emulator acceleration on Win11 uses WHPX/Hyper-V, already active for WSL2.)

→ **Tell me when this is done.** I'll run `npm run emulator:start` to verify the AVD
boots, then `npm run push:android` to deploy the Capacitor build.

---

## Troubleshooting

- **AppImage won't launch on the VM** — a missing lib; re-run `setup-vm-runtime.sh`.
  Launching over SSH needs `DISPLAY=:0` and you logged into the VM desktop (the
  script sets `DISPLAY`; keep the VM desktop session open).
- **`Permission denied` opening the controller** — log out/in so `plugdev` applies;
  confirm with `ls -l /dev/hidraw*`.
- **VirtualBox VM is very slow / won't start with WSL2** — both share the Hyper-V
  backend; they coexist on VirtualBox 7+ with a minor perf hit. Make sure you're on 7+.
- **`wsl` rsync is slow** — expected on the first sync + `npm install`; later pushes
  are incremental.
- **adb not found** — reopen the terminal after `setx`, or set `ANDROID_HOME`.
