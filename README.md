# Info
6502 emulator for JS.<br>
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
