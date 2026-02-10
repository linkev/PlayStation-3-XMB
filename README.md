# PlayStation 3 XMB Waves Recreation

## Click the image for a demo!

[![Demo of PlayStation 3 XMB Waves Recreation](demo.png)](https://linkev.github.io/PlayStation-3-XMB)

## About the project

WebGL-based recreation of the PlayStation 3 XrossMediaBar (XMB) background wave system.

This repo used to be mostly "looks close enough, ship it" shader guesswork (still archived in `old-research`), but the active implementation now lives in `ps3xmbwave` and is based on reverse engineering of `spline.elf`. I will eventually reverse engineer `particles.elf` as much as is possible with AI, unless someone smarter is reading this and would like to help!

It is still a beautiful mess. It is just now a slightly more informed mess.

This whole idea and project came to be because I wanted an easter egg in an internal DevOps tool I was developing at work and I thought why not open-source it and make it better for everyone, since I couldn't find any other similar projects or clones.

## Credits

While this is inspired by the official PlayStation 3 XMB background wave design, the major starting point was from this [CodePen by Alphardex](https://codepen.io/alphardex/pen/poPZNwE). All of the modern optimizations and cleanups have been made from this code and I must admit, it was mostly trial and error with Claude/Gemini/ChatGPT, I'M SORRY!

## Current Features (new implementation in `ps3xmbwave`)

- **Reverse-engineered spline pipeline pass**: The wave displacement is generated via a CPU-side pipeline in `spline-reverse.js` and fed into a displacement texture.
- **WebGL2 renderer**: Pure WebGL2 rendering path (background + spline mesh + particles), no framework dependency.
- **Day/Night monthly gradient presets**: 12 month presets with day/night variants are available in the UI, plus a fallback "Original (RGB Sliders)" mode.
- **Live control panels**: Separate spline and particle panels with per-setting sliders/selects and reset buttons.
- **Particle sparkle layer**: Additive point-sprite sparkles with adjustable count, opacity, size, and flow speed.
- **Reverse engineering notes included**: [SPLINE_REVERSE_ENGINEER.md](SPLINE_REVERSE_ENGINEER.md) documents traced functions, memory ranges, and what runtime data is still missing.

## Reality check (what still needs work)

- Day/night gradients are now integrated as actual presets, but they're not perfect like in the .dds files, so this issue is partially solved.
- Sparkles are still not 1:1 PS3-perfect (they look decent, but they are still the "good enough for now" version).
- The wave pipeline is much less blind guesswork than before, but still not fully 1:1 because some runtime descriptor data from real hardware is still missing.

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/linkev/PlayStation-3-XMB.git
cd PlayStation-3-XMB
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start
```

4. Open in browser:
- Main current implementation: `http://localhost:8000/ps3xmbwave/`
- Old implementation archive: `http://localhost:8000/old-research/`
- DDS gradient utility: `http://localhost:8000/dds/`

## Explanation of the files and folders

- `ps3xmbwave`: Current active implementation (reverse-engineering-based spline + particles + settings UI).
- `old-research`: Previous implementation and experiments (guesswork/prototyping era), kept for history and references.
- `dds`: "Poor man's gradient extraction" tool. Loads PS3 `.dds` files, solves best-fit 2D linear gradients (angle + colors), previews reconstruction, and exports JS preset code.
- `SPLINE_REVERSE_ENGINEER.md`: Reverse-engineering notes from Ghidra pass on PS3 spline code.
- `demo.png`: Preview image used in this README.

## How to Use (`ps3xmbwave`)

1. **Spline panel (top-right)**:
   - Pick a gradient preset (`MM Day` / `MM Night`) or use `Original (RGB Sliders)`.
   - Tweak wave behavior, blend, fresnel, brightness, and reverse-pipeline knobs. May be useful to get a better wave.

2. **Particles panel (top-left)**:
   - Tweak sparkle count, opacity, base size, variance, and speed.

3. **UI visibility**:
   - Each panel has a `Hide` button and a matching `Show ...` button.
   - There is no global fullscreen/hide-all hotkey in the new version right now.

## Technical Details (subject to change anytime)

### WebGL implementation (`ps3xmbwave`)
- **Rendering path**: WebGL2 only.
- **Layering**: Background gradient pass, spline wave mesh pass, additive particles pass.
- **Displacement source**: CPU-generated spline displacement texture (`256 x 64`, single-channel float) uploaded per frame.

### Reverse-engineered spline pipeline status
- **What is implemented**: Spline-table-style transform + normalization flow and synthetic descriptor-driven displacement generation.
- **What is still missing**: Exact runtime-fed descriptor/control payload from real PS3 execution (`b380` data path), which is needed for true 1:1 output.

## Contributing

Pull requests are very welcome. I WILL TAKE ANY HELP!

### Development Guidelines

As long as we move towards an identical replica of the XMB waves background, do whatever you want!

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments and a Thank You

- Everyone at Sony for the original PS3 XMB implementation, especially the people who worked on the spline and particles files, personally I think this is the best thing they have designed and I really love it!

- [Alphardex](https://codepen.io/alphardex/pen/poPZNwE) for the original code, seriously, this CodePen was the closest thing I could find to an XMB code starting point.

- Sony for the original PS3 XMB implementation, personally I think this is the best thing they have designed and I really love it.

## Support

### [Open an issue on GitHub!](https://github.com/linkev/Playstation-3-XMB/issues)

## TODO

- Capture real runtime descriptor/control payloads (`b300` / `b380`) from PS3 hardware or RPCS3 and wire them into the pipeline.
- Improve sparkle behavior toward PS3-accurate motion/lifecycle (less "just dots", more "XMB glitter sparkly energy stuff they got going on").
- Keep tuning wave calmness and flow cadence to better match real hardware captures. I realise the waves have sharp edges, when the real thing is like a water wave (just realised it!)
- Validate month day/night gradients against more references and tighten remaining color/angle drift.
- Add optional debug views for displacement texture / pipeline intermediates so tuning is less blind.
- Other features the original firmware had like automatic day/night cycles and the sparkles moving around (based on mouse/controller?)
