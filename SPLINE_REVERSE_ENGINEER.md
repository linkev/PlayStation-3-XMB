# PlayStation 3 XMB Spline.elf Reverse Engineering Notes

## Why would you do this?

I wanted the PS3 XMB wave to look right, and "vibes + random shader tweaks" was only getting me so far.

So this is the reverse-engineering pass on the SPU spline module, done in Ghidra with a lot of copy/paste from listing view and a lot of "what the fuck am I looking at".

From what I gather, we need more code from an actual running PS3. RPCS3 debugging is probably the least painful route for this. A Developer PS3 might also help dump memory.

My other idea was maybe make some sort of package, load it in Evilnat CFW and then it magically dumps what we need? A guy can dream.

Yes, I had GPT-5.2 Codex help me, but the addresses and flow below are what we actually traced (I hope, someone with actual reverse engineering background verify please).

Some of the below explanation is by Codex, so don't kill me over wrong terminology, it might be COMPLETELY WRONG, but the result did end up making a spline wave in the end, so it might be somewhat correct!

Again, if you are reading this and have better skills, help and PR's always welcome! I'm practically begging, I couldn't find anyone on the internet that tried to recreate the Spline or Particles accurately :(

## Setup I used

- Ghidra: `9.2 2020-Nov-13 1112 EST` - https://github.com/NationalSecurityAgency/ghidra/releases/tag/Ghidra_9.2_build
- Java: `11.0.29` - https://www.oracle.com/uk/java/technologies/javase/jdk11-archive-downloads.html
- Plugin: `GhidraSPU-patch-2` - https://github.com/aerosoul94/GhidraSPU/pull/6
- Target ELF in decompiled lines.qrc: `lines/spurs/moyou/spline/spline.elf` - For legal reasons, you have to get this from your own PS3 firmware!

SHA256 (`spline.elf`): `587f66dc18f88b6090db30bbbf8a54d569a9e2815271beeefd3b44b6b2f84eaa`

## Quick verdict

We found the spline kernel, table pipeline, and DMA inputs.

The big missing piece for perfect 1:1 output is still runtime data in `b380` (`0x2200` bytes), which is descriptor/list data interpreted by an executor.

So: we are not totally guessing anymore, but we are still missing runtime-fed data.

## Memory layout / ranges

- `.text`: `00003060-00008727`
- `.rodata`: `00008760-00009aef`
- `.data`: `00009b20-00009b3f`

## Entry and dispatch chain

- Entry: `00003070`
- Calls through: `FUN_00003010` (constructor dispatcher), `LAB_00005ec8` (glue), `LAB_000078f0` (glue), then `LAB_00003060`
- `FUN_00007a08` is dispatch via table at `0xE660` (not the spline physics itself)

## The spline kernel (the good stuff)

- Function: `FUN_000045c0`
- Real loop: `LAB_00004830`, backedge at `00004bcc`
- Loop count: `8` iterations (`ceqi r121,r105,0x8`)
- Output stride per iter: `r90 += 0x400` (`ai r90,r90,0x400`)

Stores per `0x400` block:

- `stqd r12, 0x0`
- `stqd r13, 0x100`
- `stqd r14, 0x200`
- `stqd r15, 0x300`
- `stqd r9,  0x10`
- `stqd r4,  0x110`
- `stqd r87, 0x210`
- `stqd r89, 0x310`

This looks like 8 structured vectors per iteration (more ribbon/thickness style), not just one single line.

## Basis tables (fixed)

- `DAT_0000d600` and `DAT_0000de00`
- Built in `FUN_00005fd8`
- These are constants, not live runtime controls

## Main table and normalization

Main table:

- `DAT_00009c00`
- Entry size: `16` bytes
- Total entries: `0x1690 / 0x10 = 0x169` (`361`)

Two-stage pass:

1. `LAB_000054bc` builds each entry with `LAB_00003bf0` (uses `b300`)
2. `LAB_00005498` normalizes each entry with `FUN_00003c68`

Normalization details:

- `FUN_00003c68` uses constants at `0x991c` and `0x9940`
- Called to normalize `DAT_00009c00` in place

## DMA runtime inputs

Two blocks come in through DMA:

- `DAT_0000b300`: `0x40` bytes (`16` floats)
- `DAT_0000b380`: `0x2200` bytes (descriptor/control list)

DMA helpers:

- `LAB_000035c8`: size `0x40`
- `LAB_00003580`: size `0x2200`

Pipeline driver:

- `FUN_000053e0`

Job input pointers in `FUN_000053e0`:

- QW0 (`r82+0x0`) -> EA for `b300`
- QW1 (`r82+0x10`) -> EA for `b380`
- `r3` = LS destination (`DAT_0000b300` or `DAT_0000b380`)
- Generic DMA write path: `LAB_00007838` / `LAB_000078d8`

## How b300 is used

`b300` contributes 4 scalars per table-entry build in `LAB_00003bf0`, via helpers:

- `LAB_00003bb8` mask `0x010203` -> bytes `0-3` (scalar 0)
- `LAB_00003b70` mask `0x04050607` -> bytes `4-7` (scalar 1)
- `LAB_00003b20` mask `0x08090A0B` -> bytes `8-11` (scalar 2)
- `LAB_00003ad0` mask `0x0C0D0E0F` -> bytes `12-15` (scalar 3)

Each helper loads a 16-byte coeff block from the entry, multiplies by broadcast scalar, then sums.

This mapping from `b300` into `DAT_00009c00` is real and traced.

## Index math inside FUN_000045c0

Per-iteration table index from constant vector (loaded with `lqr`):

- `r32 = r37 >> 4` (`rotmi r32,r37,-0x4`)
- `r29 = r37 & 0xF`
- `r33 = 2*r32`
- `r34 = 16*r32`
- `r31 = r33 + r34 = 18*r32`
- `r30 = r31 + r32 = 19*r32`
- `r28 = r29 + r30 = 19*(r37>>4) + (r37&0xF)`
- `r26 = r28 << 4`
- `r24 = r26 + r27` (`r27 = DAT_00009c00`)

So index scheme here is constant-driven in this traced path, not obviously runtime-randomized.

## What r37 seems to be

From `FUN_00005fd8` constant setup:

- `r5 = 0x3E2A5556` (float about `1/6`)
- `LAB_00003390` builds 4 vectors from `DAT_000089c0/89d0/89e0/89f0` times `r5`
- Mapping:
  - `r85 -> 0x0`
  - `r84 -> 0x10`
  - `r83 -> 0x20`
  - `param_1 -> 0x30`
- `r84` matches source+`0x10` (`DAT_000089d0` scaled by `1/6`)
- Stored to `DAT_0000e630`, likely what `lqr` picks up (alignment may alias same QW)

Conclusion for now: `r37` looks fixed/derived from constants, not direct live runtime input.

## b380 and the descriptor executor

`b380` is not "just math params". It behaves like descriptor/list data consumed by an interpreter:

- Executor: `LAB_00007b30` (via `LAB_00007ad8`)
- Uses state block: `DAT_0000e7a0`
- Shuffles fields, patches pointers, walks list entries
- `PTR_LAB_00009aXX` helper table looks like pointer patch handlers

So if we want true 1:1, we need actual runtime `b380` bytes and then apply executor logic.

## What is missing for perfect replica

- Runtime `b380` contents (`0x2200`) for the real wave descriptor stream
- Runtime `b300` (`0x40`) for exact scalar params

Once captured, the chain is:

`b380 -> executor -> raw DAT_00009c00 -> LAB_00003bf0 + FUN_00003c68 -> final table -> FUN_000045c0 kernel`

## What we can already reproduce

- Kernel structure/output layout from `FUN_000045c0`
- Main table transform and normalization flow
- `b300` blend path into table entries

So we can get a very close visual approximation now, even if descriptor data is synthetic.

## Best runtime dump point

After DMA in `FUN_000053e0`, dump LS:

- `DAT_0000b300` (`0x40`)
- `DAT_0000b380` (`0x2200`)

## Confidence level: Yesn't

Everything above was painfully traced (copy/pasted) and then something came out of it that looked like what it should be?

Only major unknown is runtime descriptor payload in `b380` (not inside ELF static data). Time to turn on that old PS3!
