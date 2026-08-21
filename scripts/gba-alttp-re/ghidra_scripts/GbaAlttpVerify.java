// @category ALttP GBA
// @keybinding
// @menupath
// @toolbar

import java.math.BigInteger;

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.lang.Register;
import ghidra.program.model.mem.MemoryBlock;
import ghidra.program.model.symbol.Symbol;

public class GbaAlttpVerify extends GhidraScript {
    @Override
    public void run() throws Exception {
        String[] requiredBlocks = {"EWRAM", "IWRAM", "IO", "PALRAM", "VRAM", "OAM", "ROM"};
        for (String name : requiredBlocks) {
            MemoryBlock block = currentProgram.getMemory().getBlock(name);
            if (block == null) throw new IllegalStateException("Missing memory block: " + name);
            println("BLOCK " + name + " " + block.getStart() + ".." + block.getEnd());
        }

        Register tMode = currentProgram.getProgramContext().getRegister("TMode");
        verifyCodeAnchor("entity_damage_routine", 0x080C2160L, tMode);
        verifyCodeAnchor("drop_logic", 0x080C6A10L, tMode);
        verifyLabel("drop_table", 0x0817217AL);
        verifyLabel("text_base", 0x08181448L);
        verifyLabel("link_x", 0x030038F4L);
        verifyLabel("link_y", 0x030038F0L);
        println("VERIFY_OK");
    }

    private void verifyCodeAnchor(String name, long value, Register tMode) throws Exception {
        Address address = verifyLabel(name, value);
        if (tMode == null) throw new IllegalStateException("ARM language has no TMode register");
        BigInteger setting = currentProgram.getProgramContext().getValue(tMode, address, false);
        if (!BigInteger.ONE.equals(setting)) {
            throw new IllegalStateException(name + " is not marked as Thumb code");
        }
    }

    private Address verifyLabel(String name, long value) throws Exception {
        Address address = toAddr(value);
        Symbol symbol = getSymbolAt(address);
        if (symbol == null || !name.equals(symbol.getName())) {
            throw new IllegalStateException("Missing label " + name + " at " + address);
        }
        println("ANCHOR " + name + " " + address);
        return address;
    }
}

