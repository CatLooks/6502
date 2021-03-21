/*

	======== CPU ========

	$0000 - $1FFF ram      8K
	$6000 - $7FFF save ram 8K

	$8000 - $FFFF rom     32K

	$FFFA - $FFFB irq address (interrupt)
	$FFFC - $FFFD reset address (label)
	$FFFE - $FFFF nmi address (interrupt)	

*/

function CPU() {
	this.rom = new Uint8Array(32768);
	this.wrm = new Uint8Array(8192);
	this.ram = new Uint8Array(8192);

	this.ready = false;

	this.a = 0x00;
	this.x = 0x00;
	this.y = 0x00;
	this.s = 0x30;
	this.p = 0x00;
	this.i = 0x00;

	return this;
};

CPU.prototype.tick = function() {
	switch (this.pullb()) {
		// ==================== PHL ====================
		case 0x08:
		// PHP
		this.pushb(this.p | 0x30);
		break;
		case 0x28:
		// PLP
		this.p = this.popb();
		break;
		case 0x48:
		// PHA
		this.pushb(this.a);
		break;
		case 0x68:
		// PLA
		this.a = this.popb();
		this.nz(this.a);
		break;

		// ==================== S/C ====================
		case 0x18:
		// CLC
		this.sbit(0, 0);
		break;
		case 0x38:
		// SEC
		this.sbit(0, 1);
		break;
		case 0x58:
		// CLI
		this.sbit(2, 0);
		break;
		case 0x78:
		// SEI
		this.sbit(2, 1);
		break;
		case 0xB8:
		// CLV
		this.sbit(6, 0);
		break;
		case 0xD8:
		// CLD
		this.sbit(3, 0);
		break;
		case 0xF8:
		// SED
		this.sbit(3, 1);
		break;

		// ==================== BON ====================
		case 0x10:
		// BPL
		rel = this.op("imd");
		if (this.bit(7) == 0) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0x30:
		// BMI
		rel = this.op("imd");
		if (this.bit(7)) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0x50:
		// BVC
		rel = this.op("imd");
		if (this.bit(6) == 0) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0x70:
		// BVS
		rel = this.op("imd");
		if (this.bit(6)) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0x90:
		// BCC
		rel = this.op("imd");
		if (this.bit(0) == 0) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0xB0:
		// BCS
		rel = this.op("imd");
		if (this.bit(0)) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0xD0:
		// BNE
		rel = this.op("imd");
		if (this.bit(1) == 0) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;
		case 0xF0:
		// BEQ
		rel = this.op("imd");
		if (this.bit(1)) {
			this.i += rel - (rel & 0x80) * 2;
		};
		break;

		// ==================== OTH ====================
		case 0x20:
		// JSR
		addr = this.op("abs");
		this.pushw(this.i - 1 & 0xFFFF);
		this.i = addr;
		break;
		case 0x24:
		// BIT zp
		val = this.get(this.op("zp"));
		this.sbit(6, val >> 6 & 1);
		this.nz(val);
		break;
		case 0x2C:
		// BIT abs
		val = this.get(this.op("abs"));
		this.sbit(6, val >> 6 & 1);
		this.nz(val);
		break;
		case 0x4C:
		// JMP abs
		this.i = this.op("abs");
		break;
		case 0x6C:
		// JMP ind
		this.i = this.op("ind");
		break;

		// ==================== ORA ====================
		case 0x09:
		// ORA imd
		this.a |= this.op("imd");
		this.nz(this.a);
		break;
		case 0x0D:
		// ORA abs
		this.a |= this.get(this.op("abs"));
		this.nz(this.a);
		break;
		case 0x1D:
		// ORA abs, x
		this.a |= this.get(this.op("absx"));
		this.nz(this.a);
		break;
		case 0x19:
		// ORA abs, y
		this.a |= this.get(this.op("absy"));
		this.nz(this.a);
		break;
		case 0x05:
		// ORA zp
		this.a |= this.get(this.op("zp"));
		this.nz(this.a);
		break;
		case 0x15:
		// ORA zp, x
		this.a |= this.get(this.op("zpx"));
		this.nz(this.a);
		break;
		case 0x01:
		// ORA ind, x
		this.a |= this.get(this.op("indx"));
		this.nz(this.a);
		break;
		case 0x11:
		// ORA ind, y
		this.a |= this.get(this.op("indy"));
		this.nz(this.a);
		break;

		// ==================== ASL ====================
		case 0x0A:
		// ASL
		this.a = asl(this.a);
		break;
		case 0x0E:
		// ASL abs
		this.apply(this.op("abs"), asl);
		break;
		case 0x1E:
		// ASL abs, x
		this.apply(this.op("absx"), asl);
		break;
		case 0x06:
		// ASL zp
		this.apply(this.op("zp"), asl);
		break;
		case 0x16:
		// ASL zp, x
		this.apply(this.op("zpx"), asl);
		break;

		// ==================== AND ====================
		case 0x29:
		// AND imd
		this.a &= this.op("imd");
		this.nz(this.a);
		break;
		case 0x2D:
		// AND abs
		this.a &= this.get(this.op("abs"));
		this.nz(this.a);
		break;
		case 0x3D:
		// AND abs, x
		this.a &= this.get(this.op("absx"));
		this.nz(this.a);
		break;
		case 0x39:
		// AND abs, y
		this.a &= this.get(this.op("absy"));
		this.nz(this.a);
		break;
		case 0x25:
		// AND zp
		this.a &= this.get(this.op("zp"));
		this.nz(this.a);
		break;
		case 0x35:
		// AND zp, x
		this.a &= this.get(this.op("zpx"));
		this.nz(this.a);
		break;
		case 0x21:
		// AND ind, x
		this.a &= this.get(this.op("indx"));
		this.nz(this.a);
		break;
		case 0x31:
		// AND ind, y
		this.a &= this.get(this.op("indy"));
		this.nz(this.a);
		break;

		// ==================== ROL ====================
		case 0x2A:
		// ROL
		this.a = rol(this.a);
		break;
		case 0x2E:
		// ROL abs
		this.apply(this.op("abs"), rol);
		break;
		case 0x3E:
		// ROL abs, x
		this.apply(this.op("absx"), rol);
		break;
		case 0x26:
		// ROL zp
		this.apply(this.op("zp"), rol);
		break;
		case 0x36:
		// ROL zpx
		this.apply(this.op("zpx"), rol);
		break;

		// ==================== EOR ====================
		case 0x49:
		// EOR imd
		this.a ^= this.op("imd");
		this.nz(this.a);
		break;
		case 0x4D:
		// EOR abs
		this.a ^= this.get(this.op("abs"));
		this.nz(this.a);
		break;
		case 0x5D:
		// EOR abs, x
		this.a ^= this.get(this.op("absx"));
		this.nz(this.a);
		break;
		case 0x59:
		// EOR abs, y
		this.a ^= this.get(this.op("absy"));
		this.nz(this.a);
		break;
		case 0x45:
		// EOR zp
		this.a ^= this.get(this.op("zp"));
		this.nz(this.a);
		break;
		case 0x55:
		// EOR zp, x
		this.a ^= this.get(this.op("zpx"));
		this.nz(this.a);
		break;
		case 0x41:
		// EOR ind, x
		this.a ^= this.get(this.op("indx"));
		this.nz(this.a);
		break;
		case 0x51:
		// EOR ind, y
		this.a ^= this.get(this.op("indy"));
		this.nz(this.a);
		break;

		// ==================== LSR ====================
		case 0x4A:
		// LSR
		this.a = lsr(this.a);
		break;
		case 0x4E:
		// LSR abs
		this.apply(this.op("abs"), lsr);
		break;
		case 0x5E:
		// LSR abs, x
		this.apply(this.op("absx"), lsr);
		break;
		case 0x46:
		// LSR zp
		this.apply(this.op("zp"), lsr);
		break;
		case 0x56:
		// LSR zp, x
		this.apply(this.op("zpx"), lsr);
		break;

		// ==================== ADC ====================
		case 0x69:
		// ADC imd
		this.add(this.op("imd"));
		this.nz(this.a);
		break;
		case 0x6D:
		// ADC abs
		this.add(this.get(this.op("abs")));
		this.nz(this.a);
		break;
		case 0x7D:
		// ADC abs, x
		this.add(this.get(this.op("absx")));
		this.nz(this.a);
		break;
		case 0x79:
		// ADC abs, y
		this.add(this.get(this.op("absy")));
		this.nz(this.a);
		break;
		case 0x65:
		// ADC zp
		this.add(this.get(this.op("zp")));
		this.nz(this.a);
		break;
		case 0x75:
		// ADC zp, x
		this.add(this.get(this.op("zpx")));
		this.nz(this.a);
		break;
		case 0x61:
		// ADC ind, x
		this.add(this.get(this.op("indx")));
		this.nz(this.a);
		break;
		case 0x71:
		// ADC ind, y
		this.add(this.get(this.op("indy")));
		this.nz(this.a);
		break;

		// ==================== ROR ====================
		case 0x4A:
		// ROR
		this.a = ror(this.a);
		break;
		case 0x4E:
		// ROR abs
		this.apply(this.op("abs"), ror);
		break;
		case 0x5E:
		// ROR abs, x
		this.apply(this.op("absx"), ror);
		break;
		case 0x46:
		// ROR zp
		this.apply(this.op("zp"), ror);
		break;
		case 0x56:
		// ROR zp, x
		this.apply(this.op("zpx"), ror);
		break;

		// ==================== SBC ====================
		case 0xE9:
		// SBC imd
		this.sub(this.op("imd"));
		break;
		case 0xED:
		// SBC abs
		this.sub(this.get(this.op("abs")));
		break;
		case 0xFD:
		// SBC abs, x
		this.sub(this.get(this.op("absx")));
		break;
		case 0xF9:
		// SBC abs, y
		this.sub(this.get(this.op("absy")));
		break;
		case 0xE5:
		// SBC zp
		this.sub(this.get(this.op("zp")));
		break;
		case 0xF5:
		// SBC zp, x
		this.sub(this.get(this.op("zpx")));
		break;
		case 0xE1:
		// SBC ind, x
		this.sub(this.get(this.op("indx")));
		break;
		case 0xF1:
		// SBC ind, y
		this.sub(this.get(this.op("indy")));
		break;

		// ==================== SIC ====================
		case 0xE8:
		// INX
		this.x = this.x + 1 & 0xFF;
		this.nz(this.x);
		break;
		case 0xCA:
		// DEX
		this.x = this.x - 1 & 0xFF;		
		this.nz(this.x);
		break;
		case 0xC8:
		// INY
		this.y = this.y + 1 & 0xFF;
		this.nz(this.y);
		break;
		case 0x88:
		// DEY
		this.y = this.y - 1 & 0xFF;
		this.nz(this.y);
		break;

		// ==================== INC ====================
		case 0xEE:
		// INC abs
		this.apply(this.op("abs"), inc);
		break;
		case 0xFE:
		// INC abs, x
		this.apply(this.op("absx"), inc);
		break;
		case 0xE6:
		// INC zp
		this.apply(this.op("zp"), inc);
		break;
		case 0xF6:
		// INC zp, x
		this.apply(this.op("zpx"), inc);
		break;

		// ==================== DEC ====================
		case 0xCE:
		// DEC abs
		this.apply(this.op("abs"), dec);
		break;
		case 0xDE:
		// DEC abs, x
		this.apply(this.op("absx"), dec);
		break;
		case 0xC6:
		// DEC zp
		this.apply(this.op("zp"), dec);
		break;
		case 0xD6:
		// DEC zp, x
		this.apply(this.op("zpx"), dec);
		break;

		// ==================== TRC ====================
		case 0xAA:
		// TAX
		this.x = this.a;
		this.nz(this.a);
		break;
		case 0xA8:
		// TAY
		this.y = this.a;
		this.nz(this.a);
		break;
		case 0x8A:
		// TXA
		this.a = this.x;
		this.nz(this.a);
		break;
		case 0x98:
		// TYA
		this.a = this.y;
		this.nz(this.a);
		break;
		case 0x9A:
		// TXS
		this.s = this.x;
		break;
		case 0xBA:
		// TSX
		this.x = this.s;
		this.nz(this.x);
		break;

		// ==================== LDA ====================
		case 0xA9:
		// LDA #
		this.a = this.op("imd");
		this.nz(this.a);
		break;
		case 0xAD:
		// LDA abs
		this.a = this.get(this.op("abs"));
		this.nz(this.a);
		break;
		case 0xBD:
		// LDA abs, x
		this.a = this.get(this.op("absx"));
		this.nz(this.a);
		break;
		case 0xB9:
		// LDA abs, y
		this.a = this.get(this.op("absy"));
		this.nz(this.a);
		break;
		case 0xA5:
		// LDA zp
		this.a = this.get(this.op("zp"));
		this.nz(this.a);
		break;
		case 0xB5:
		// LDA zp, x
		this.a = this.get(this.op("zpx"));
		this.nz(this.a);
		break;
		case 0xA1:
		// LDA ind, x
		this.a = this.get(this.op("indx"));
		this.nz(this.a);
		break;
		case 0xB1:
		// LDA ind, y
		this.a = this.get(this.op("indy"));
		this.nz(this.a);
		break;

		// ==================== LDX ====================
		case 0xA2:
		// LDX #
		this.x = this.op("imd");
		this.nz(this.x);
		break;
		case 0xAE:
		// LDX abs
		this.x = this.get(this.op("abs"));
		this.nz(this.x);
		break;
		case 0xBE:
		// LDX abs, y
		this.x = this.get(this.op("absy"));
		this.nz(this.x);
		break;
		case 0xA6:
		// LDX zp
		this.x = this.get(this.op("zp"));
		this.nz(this.x);
		break;
		case 0xB6:
		// LDX zp, y
		this.x = this.get(this.op("zpy"));
		this.nz(this.x);
		break;

		// ==================== LDY ====================
		case 0xA0:
		// LDY #
		this.y = this.op("imd");
		this.nz(this.y);
		break;
		case 0xAC:
		// LDY abs
		this.y = this.get(this.op("abs"));
		this.nz(this.y);
		break;
		case 0xBC:
		// LDY abs, x
		this.y = this.get(this.op("absx"));
		this.nz(this.y);
		break;
		case 0xA4:
		// LDY zp
		this.y = this.get(this.op("zp"));
		this.nz(this.y);
		break;
		case 0xB4:
		// LDY zp, x
		this.y = this.get(this.op("zpx"));
		this.nz(this.y);
		break;

		// ==================== STA ====================
		case 0x8D:
		// STA abs
		this.set(this.op("abs"), this.a);
		break;
		case 0x9D:
		// STA abs, x
		this.set(this.op("absx"), this.a);
		break;
		case 0x99:
		// STA abs, y
		this.set(this.op("absy"), this.a);
		break;
		case 0x85:
		// STA zp
		this.set(this.op("zp"), this.a);
		break;
		case 0x95:
		// STA zp, x
		this.set(this.op("zpx"), this.a);
		break;
		case 0x81:
		// STA ind, x
		this.set(this.op("indx"), this.a);
		break;
		case 0x91:
		// STA ind, y
		this.set(this.op("indy"), this.a);
		break;

		// ==================== STX ====================
		case 0x8E:
		// STX abs
		this.set(this.op("abs"), this.x);
		break;
		case 0x86:
		// STX zp
		this.set(this.op("zp"), this.x);
		break;
		case 0x96:
		// STX zp, y
		this.set(this.op("zpy"), this.x);
		break;

		// ==================== STY ====================
		case 0x8C:
		// STY abs
		this.set(this.op("abs"), this.y);
		break;
		case 0x84:
		// STY zp
		this.set(this.op("zp"), this.y);
		break;
		case 0x94:
		// STY zp, x
		this.set(this.op("zpy"), this.y);
		break;

		// ==================== CMP ====================
		case 0xC9:
		// CMP #
		this.cmp(this.a, this.op("imd"));
		break;
		case 0xCD:
		// CMP abs
		this.cmp(this.a, this.get(this.op("abs")));
		break;
		case 0xDD:
		// CMP abs, x
		this.cmp(this.a, this.get(this.op("absx")));
		break;
		case 0xD9:
		// CMP abs, y
		this.cmp(this.a, this.get(this.op("absy")));
		break;
		case 0xC5:
		// CMP zp
		this.cmp(this.a, this.get(this.op("zp")));
		break;
		case 0xD5:
		// CMP zp, x
		this.cmp(this.a, this.get(this.op("zpx")));
		break;
		case 0xC1:
		// CMP ind, x
		this.cmp(this.a, this.get(this.op("indx")));
		break;
		case 0xD1:
		// CMP ind, y
		this.cmp(this.a, this.get(this.op("indy")));
		break;

		// ==================== CPX ====================
		case 0xE0:
		// CPX #
		this.cmp(this.x, this.op("imd"));
		break;
		case 0xEC:
		// CPX abs
		this.cmp(this.x, this.get(this.op("abs")));
		break;
		case 0xE4:
		// CPX zp
		this.cmp(this.x, this.get(this.op("zp")));
		break;

		// ==================== CPY ====================
		case 0xC0:
		// CPY #
		this.cmp(this.y, this.op("imd"));
		break;
		case 0xCC:
		// CPY abs
		this.cmp(this.y, this.get(this.op("abs")));
		break;
		case 0xC4:
		// CPY zp
		this.cmp(this.y, this.get(this.op("zp")));
		break;

		// ==================== RET ====================
		case 0x40:
		// RTI
		this.p = this.popb();
		this.i = this.popw();
		break;
		case 0x60:
		// RTS
		this.i = this.popw() + 1 & 0xFFFF;
		break;
		case 0x00:
		// BRK
		this.ready = false;
		break;
	};
};

CPU.prototype.op = function(name) {
	switch (name) {
		case "abs":
		return this.pullw();
		case "absx":
		return this.pullw() + this.x;
		case "absy":
		return this.pullw() + this.y;
		case "imd":
		return this.pullb();
		case "ind":
		return this.addr(this.pullw());
		case "indx":
		return this.addr(this.pullb() + this.x & 0xFF);
		case "indy":
		return this.addr(this.pullb()) + this.y;
		case "zp":
		return this.pullb();
		case "zpx":
		return this.pullb() + this.x & 0xFF;
		case "zpy":
		return this.pullb() + this.y & 0xFF;
	};
};

CPU.prototype.pullb = function() {
	res = this.get(this.i);
	this.i++;
	return res;
};

CPU.prototype.pullw = function() {
	return this.pullb() | this.pullb() << 8;
};

CPU.prototype.addr = function(addr) {
	return this.get(addr) | this.get(addr + 1) << 8;
};

CPU.prototype.bit = function(bit) {
	return this.p >> bit & 1;
};

CPU.prototype.sbit = function(bit, value) {
	this.p &= (1 << bit) ^ 0xFF;
	this.p |= value << bit;
};

CPU.prototype.pushb = function(value) {
	this.set(0x100 | this.s, value);
	this.s = this.s - 1 & 0xFF;
};

CPU.prototype.pushw = function(word) {
	this.set(0x100 | this.s, word >> 8);
	this.s = this.s - 1 & 0xFF;
	this.set(0x100 | this.s, word & 0xFF);
	this.s = this.s - 1 & 0xFF;
};

CPU.prototype.popb = function() {
	this.s = this.s + 1 & 0xFF;
	return this.get(0x100 | this.s);
};

CPU.prototype.popw = function() {
	this.s = this.s + 1 & 0xFF;
	addr = this.get(0x100 | this.s);
	this.s = this.s + 1 & 0xFF;
	return this.get(0x100 | this.s) << 8 | addr;
};

CPU.prototype.apply = function(addr, fun) {
	this.set(addr, fun(this.get(addr)));
};

CPU.prototype.nf = function(n) {
	this.sbit(7, (n & 0xFF) >> 7);
};

CPU.prototype.nz = function(n) {
	this.nf(n);
	this.sbit(1, n == 0);
};

CPU.prototype.add = function(n) {
	this.a += n + this.bit(0);
	this.sbit(0, this.a >> 8);
	this.a &= 0xFF;
};

CPU.prototype.sub = function(n) {
	this.a -= n - this.bit(0) + 1;
	this.sbit(7, this.a < 0);
	this.a &= 0xFF;
};

CPU.prototype.cmp = function(r, n) {
	this.sbit(0, r >= n);
	this.sbit(1, r == n);
	this.nf(r - n);
};

function asl(n) {
	cpu.sbit(0, n >> 7);
	return n << 1 & 0xFF;
};

function lsr(n) {
	cpu.sbit(0, n & 0x1);
	return n >> 1;
};

function rol(n) {
	value = (n << 1 & 0xFF) | cpu.bit(0);
	cpu.sbit(0, n >> 7);
	return value;
};

function ror(n) {
	value = n >> 1 | cpu.bit(0) << 7;
	cpu.sbit(0, n & 0x1);
	return value;
};

function inc(n) {
	return n + 1 & 0xFF;
};

function dec(n) {
	return n - 1 & 0xFF;
};

CPU.prototype.reset = function() {
	for (let i = 0; i < 8192; i++) {
		this.ram[i] = rand();
	};

	this.i = rand() << 8 | rand();

	this.a = rand();
	this.x = rand();
	this.y = rand();
	this.s = rand();
	this.p = rand();
};

CPU.prototype.set = function(addr, value) {
	addr &= 0xFFFF;
	if (addr < 0x2000) {
		this.ram[addr] = value;
	} else if (addr >= 0x6000 && addr < 0x8000) {
		this.wrm[addr & 0x1FFF] = value;
	};
};

CPU.prototype.get = function(addr) {
	addr &= 0xFFFF;
	if (addr < 0x2000) {
		return this.ram[addr];
	} else if (addr >= 0x8000) {
		return this.rom[addr & 0x7FFF];
	} else if (addr >= 0x6000) {
		return this.wrm[addr & 0x1FFF];
	} else if (addr == 0x2000) {
		return rand();
	};
	return 0x00;
};

function reset() {
	cpu.i = cpu.addr(0xFFFC);
	run();
};

function power() {
	cpu.reset();
	reset();
};

function run() {
	cpu.ready = true;
	while (cpu.ready) {
		cpu.tick();
	};
};

function rand() {
	return Math.floor(Math.random() * 256);
};

function hex(n) {
	return (n < 16 ? "0": "") + n.toString(16);
};

function bin(n) {
	return n.toString(2);
};