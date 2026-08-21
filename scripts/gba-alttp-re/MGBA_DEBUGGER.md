# mGBA debugger notes

The official Windows mGBA build omits its terminal debugger but includes the supported
GDB remote stub. Launch the Qt application:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/debug-mgba.ps1
```

In mGBA, choose **Tools > Start GDB server...** and use port `2345`. The first run can
trigger a Windows Firewall prompt; allow only networks you trust. mGBA 0.10.5 binds
the server to all interfaces (`0.0.0.0`), so stop the server when the capture is done.
The SDL executable's `-g` option did not start a listener in this pinned Windows build.

Verify the connection with a read-only probe:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/verify-mgba-gdb.ps1
```

Then connect ARM GDB interactively from a second terminal:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/connect-gdb.ps1
```

The portable build keeps emulator settings beside the ignored executable. Save files
and save states remain local inputs and must not be committed.

mGBA does not implement GDB's remote detach packet. Use GDB's `disconnect` command
instead of `detach` so the client closes without treating this as an error. The
pinned mGBA server can retain stale no-ack protocol state after a client exits. Stop
and restart the GDB server from the Tools menu before opening another GDB session.
The verifier accepts a complete register/RAM sample even if GDB itself returns a
nonzero exit status while closing this limited remote connection.

Useful GDB commands for this project:

```text
watch *(unsigned short*)0x030038F0
watch *(unsigned short*)0x030038F4
watch *(unsigned char*)0x03003102
watch *(unsigned char*)0x030031D8
watch *(unsigned int*)0x03003D28
break *0x080C2160
break *0x080C6A10
continue
stepi
x/64bx 0x03003100
x/8wx 0x03003D20
```

GDB watchpoints stop when the value changes. At a hit, record the reported program
counter and inspect nearby instructions.
ROM PCs collected during an idle control run and a doorway-transition run can be fed
to `trace-diff.mjs`.

Suggested first capture:

1. Load a state immediately before entering an ordinary dungeon room.
2. Record an idle trace without crossing the threshold.
3. Reload, record the doorway transition, and stop once room entities appear.
4. Compare the logs with `trace-diff.mjs`.
5. Add candidate PCs to `anchors.json`, rerun `import-ghidra.ps1 -Overwrite`, and
   inspect only those functions in Ghidra.
