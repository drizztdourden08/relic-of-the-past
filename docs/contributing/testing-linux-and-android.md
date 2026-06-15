<!-- @layer docs @kind doc -->
# Testing on a Linux VM & Android emulator

Push a testing build of the app to a Linux VM and an Android emulator from a
Windows dev box. The tooling lives in `scripts/deploy/`.

## Commands

```powershell
npm run push:linux                    # build and launch on the VM
npm run push:linux -- --build-only    # build the Linux AppImage only
npm run emulator:start                # boot the Android emulator
npm run push:android                  # build, install, and launch on the emulator
npm run push:android -- --apk <path>  # install a prebuilt APK
```

## Test ROMs

Put ROMs in `./test-roms` (gitignored; created automatically). On each deploy:

- **Linux** — mounted into the VM at `~/test-roms`.
- **Android** — pushed to `/sdcard/Download/test-roms` (open via the in-app file picker).

## Set up the Linux VM

1. Install **VirtualBox 7+** and the **Extension Pack**.
2. Create a VM and install **Ubuntu 26.04 LTS Desktop**.
3. Add a Host-Only network: **File → Tools → Network Manager → Host-only Networks →
   Create** (gives `VirtualBox Host-Only Ethernet Adapter`, `192.168.56.1`).
4. VM **Settings → Network**:
   - **Adapter 1 = NAT** (internet).
   - **Adapter 2 = Host-Only Adapter** → `VirtualBox Host-Only Ethernet Adapter`.
5. Install the VirtualBox Guest Additions, then reboot.
6. In the VM, run `setup-vm-runtime.sh`, then `vm-harden.sh`. This sets up sshd, DNS,
   the Host-Only static IP `192.168.56.50`, and auto-mounts `~/test-roms`.
7. On Windows, copy `scripts/deploy/vm.example.json` to `vm.json` and set `vmName`,
   plus `host` (`192.168.56.50`), `user`, and `identityFile` (an SSH key authorized
   on the VM).

## Set up the Android emulator

1. Install **JDK 21** and the Android command-line tools, then set `ANDROID_HOME`
   (`C:\Android`) and `JAVA_HOME`.
2. Install the SDK packages:

   ```powershell
   sdkmanager platform-tools emulator "platforms;android-36" "build-tools;36.0.0" "system-images;android-36;google_apis;x86_64"
   ```

3. Create the AVD:

   ```powershell
   avdmanager create avd -n rotp_test -k "system-images;android-36;google_apis;x86_64" -d pixel_6
   ```
