# Info
6502 emulator for JS (original 6502 instruction set).<br>
This emulator does not support Decimal Mode.

# Details
This emulator supports:
* 32Kb of ROM
* 8Kb of RAM
* 8Kb of WRAM

# Usage
To create a cpu object use `CPU()` constructor.
CPU devices can be accessed by:
* ROM - `cpu.rom`
* RAM - `cpu.ram`
* WRAM - `cpu.wrm`

# Custom Registers
Emulator supports custom I/O registers.<br>
To add input register (written to), use `cpu.iregs[addr] = function(byte) {};`.<br>
To add output register (read from), use `cpu.oregs[addr] = function() {};`.

# Runtime
CPU runtime is controlled by `ready` and `interrupt` state:
* reset - `rst`:
Pulls `PC` from RST vector and sets `ready` to true.
* interrupt request - `irq` (executes if interrupt disable flag is false):
Pulls `PC` from IRQ vector and sets `interrupt` to true.
* non-maskable interrupt - `nmi`:
Pulls `PC` from NMI vector and set `interrupt` to true.
* opcode `rti` sets `interrupt` to false.
* opcode `brk` sets `ready` to false.
