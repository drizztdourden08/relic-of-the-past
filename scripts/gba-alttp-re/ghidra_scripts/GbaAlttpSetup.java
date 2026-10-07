// @category ALttP GBA
// @keybinding
// @menupath
// @toolbar

import java.io.File;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.lang.Register;
import ghidra.program.model.mem.Memory;
import ghidra.program.model.mem.MemoryBlock;
import ghidra.program.model.symbol.SourceType;

public class GbaAlttpSetup extends GhidraScript {
    private static final Pattern ANCHOR = Pattern.compile(
        "\\{[^{}]*\\\"name\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"[^{}]*" +
        "\\\"address\\\"\\s*:\\s*\\\"(0x[0-9A-Fa-f]+)\\\"[^{}]*" +
        "\\\"kind\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"[^{}]*\\}"
    );

    @Override
    public void run() throws Exception {
        // This analyzer dominates runtime and produces poor guesses on a raw mixed code/data ROM.
        setAnalysisOption(currentProgram, "Non-Returning Functions - Discovered", "false");
        createBlock("EWRAM", 0x02000000L, 0x40000L, true, true, false);
        createBlock("IWRAM", 0x03000000L, 0x8000L, true, true, true);
        createBlock("IO", 0x04000000L, 0x400L, true, true, false);
        createBlock("PALRAM", 0x05000000L, 0x400L, true, true, false);
        createBlock("VRAM", 0x06000000L, 0x18000L, true, true, false);
        createBlock("OAM", 0x07000000L, 0x400L, true, true, false);

        MemoryBlock rom = currentProgram.getMemory().getBlock(toAddr(0x08000000L));
        if (rom == null) throw new IllegalStateException("ROM was not imported at 0x08000000");
        rom.setName("ROM");
        rom.setRead(true);
        rom.setWrite(false);
        rom.setExecute(true);

        Address entry = toAddr(0x08000000L);
        createLabel(entry, "gba_entry", true, SourceType.USER_DEFINED);
        addEntryPoint(entry);
        disassemble(entry);

        String[] args = getScriptArgs();
        if (args.length < 1) throw new IllegalArgumentException("Pass anchors.json as the first script argument");
        loadAnchors(new File(args[0]));
        println("GBA ALttP memory map and research anchors applied.");
    }

    private void createBlock(String name, long start, long length, boolean read, boolean write, boolean execute)
            throws Exception {
        Memory memory = currentProgram.getMemory();
        if (memory.getBlock(toAddr(start)) != null) return;
        MemoryBlock block = memory.createUninitializedBlock(name, toAddr(start), length, false);
        block.setRead(read);
        block.setWrite(write);
        block.setExecute(execute);
    }

    private void loadAnchors(File file) throws Exception {
        String json = Files.readString(file.toPath(), StandardCharsets.UTF_8);
        Matcher matcher = ANCHOR.matcher(json);
        Register tMode = currentProgram.getProgramContext().getRegister("TMode");
        int count = 0;
        while (matcher.find()) {
            String name = matcher.group(1);
            long value = Long.decode(matcher.group(2));
            String kind = matcher.group(3);
            Address address = toAddr(value);
            createLabel(address, sanitize(name), true, SourceType.USER_DEFINED);
            if ("rom-code".equals(kind)) {
                if (tMode != null) {
                    currentProgram.getProgramContext().setValue(tMode, address, address, BigInteger.ONE);
                }
                disassemble(address);
            }
            count++;
        }
        println("Applied " + count + " anchors from " + file.getAbsolutePath());
    }

    private String sanitize(String value) {
        return value.replaceAll("[^A-Za-z0-9_]", "_");
    }
}
