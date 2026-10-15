// @category ALttP GBA

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigInteger;

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;
import ghidra.program.model.lang.Register;

public class GbaAlttpDecompile extends GhidraScript {
    private static final long[] TARGETS = {
        0x080E5570L, // Palace gatekeeper (entity F5)
        0x080E57FCL, // Gatekeeper/Riddle actor shared helper (entity F6)
        0x080D6478L, // Riddle Quest actor (entity F7)
        0x080C66A4L, // Entity replacement helper reached by an F8-specific branch
        0x080C68BCL, // Generic update path containing the observed F8 branch
        0x0807B7C0L, // Palace room tag 0x40
        0x0807B244L, // Palace room tag 0x41
        0x0807A088L, // Palace room tag 0x42
        0x0810BEB0L, // Mothula (entity 88)
        0x080FDE64L, // Arrghus (entity 8C)
        0x0810255CL, // Arrghus puff (entity 8D)
        0x0810411CL, // Helmasaur King (entity 92)
        0x080F1B20L, // Blind (entity CE)
        0x0807FF10L, // Dungeon room layer/state loader
        0x08080D00L, // Dungeon room header loader
        0x080CB638L, // Dungeon entity record loader
        0x080CB6B4L  // Normal dungeon entity initializer
    };

    @Override
    public void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length != 1) throw new IllegalArgumentException("Expected output path");
        DecompInterface decompiler = new DecompInterface();
        decompiler.openProgram(currentProgram);
        StringBuilder output = new StringBuilder();
        Register tMode = currentProgram.getProgramContext().getRegister("TMode");
        for (long value : TARGETS) {
            Address address = toAddr(value);
            Function function = getFunctionAt(address);
            if (function == null) function = getFunctionContaining(address);
            if (function == null) {
                if (tMode != null && currentProgram.getListing().getInstructionAt(address) == null) {
                    currentProgram.getProgramContext().setValue(tMode, address, address, BigInteger.ONE);
                }
                disassemble(address);
                function = createFunction(address, null);
            }
            output.append(String.format("\n===== 0x%08X =====\n", value));
            if (function == null) {
                output.append("NO_FUNCTION\n");
                continue;
            }
            DecompileResults result = decompiler.decompileFunction(function, 120, monitor);
            if (!result.decompileCompleted()) {
                output.append("DECOMPILE_FAILED: ").append(result.getErrorMessage()).append('\n');
                continue;
            }
            output.append(result.getDecompiledFunction().getC()).append('\n');
        }
        decompiler.dispose();
        Files.writeString(Path.of(args[0]), output.toString(), StandardCharsets.UTF_8);
        println("WROTE " + args[0]);
    }
}
