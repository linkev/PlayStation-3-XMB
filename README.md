# PlayStation 3 XMB Waves Recreation

![Demo of PlayStation 3 XMB Waves Recreation](demo.png)

## Live Demo Website

### [View Live Demo!](https://linkev.github.io/PlayStation-3-XMB)

## About the project

WebGL-based recreation of the PlayStation 3 XrossMediaBar (XMB) wave rendering system with kind-of authentic shaders and close-enough physics simulation.

I guess the goal with this project is someone smarter than me might come along and help improve this absolute mess so it looks a bit more presentable.

To be fair, in it's current state, it's a miracle it even looks as good as it does. I have a nasty bug with the "Wave Perturbation" setting, it has to be 0 for it all to work. I have no idea what I'm doing.

The project is such a mess that you can feel free and clean up any of the mess I made, I'm so sorry.

This whole idea and project came to be because I wanted an easter egg in an internal DevOps tool I was developing at work and I thought why not open-source it and make it better for everyone, since I couldn't find any other similar projects or clones.
## Credits

While this is inspired by the official PlayStation 3 XMB background wave design, the major starting point was from this [CodePen by Alphardex](https://codepen.io/alphardex/pen/poPZNwE). All of the modern optimizations and cleanups have been made from this code and I must admit, it was mostly trial and error with Claude/Gemini, I'M SORRY!

## Issues to resolve, PR's welcome!

- While we have the original close-enough color themes, these are not one-to-one replicas. I tried making shaders that tried to extract the original gradients and apply them, but to no avail. If anyone knows how to get the Day and Night gradients integrated with the original colors, that would be amazing! Good starting points are: https://www.psdevwiki.com/ps3/Template:XMB_colors and https://www.psdevwiki.com/ps3/Lines.qrc where I tried to extract the .dds files and convert them to shaders, but my skill issue got in the way.

- Another thing is the more accurate sparkles engine. Right now its just fading in and out dots, that are good enough, but the goal would be to have the truly dazzling sparkles you can see here: https://www.youtube.com/watch?v=ZuUmT4XL-bQ - I spent hours looking at the XMB on [RPCS3](https://rpcs3.net/) and once again, skill issue won.

- Finally, getting the waves to calm down and be more accurate to the way they flow in an actual PlayStation 3 XMB would be the cherry on top! Again, someone with more skill might be able to read the https://www.psdevwiki.com/ps3/Lines.qrc source code and then recreate it.

The whole aim is just to recreate the background XMB waves effect which can then be hooked onto a website as a simple theme or anyone else could do whatever with it. If you want to recreate the whole XMB, feel free to fork the project!

## Current Features

- **Wave Animation**: Recreates the flowing PS3 background waves
- **Original Colors**: All the authentic monthly color themes from the PS3
- **Sparkle Effects**: Little particles that follow the wave movement
- **Adjustable Settings**: Control wave speed, colors, and brightness
- **Fullscreen Mode**: Hide the controls for a clean view

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

4. Open your browser and navigate to `http://localhost:8000`


## Explanation of the files and folders

- "backup" folder is what I had at the beginning of the project, before splitting it all up into tiny files to make management easier (?)

- "gradients" folder is just the downloaded images from the PS3 Dev Wiki, some generated gradient attempts, which are probably not good enough.

- "js" folder is just the libraries to run it, local copy.

- "tools" folder has a "gradient extractor". I tried to be smart and feed all of the gradient files in bulk, then some AI Javascript magic maybe could convert the gradient images into code, which then I could have used to make the legit Day/Night cycles with 100% accuracy. I leave my failure there for someone else to maybe figure it out, I think I was on the right path.

- "waves" folder is the actual code itself that runs and renders this whole mess.

- "index.html" is the entry point and the frontend
## How to Use

1. **Wave Configuration**: Adjust various parameters in the right panel:
   - **Color Theme**: Choose from authentic PS3 monthly color themes
   - **Flow Speed**: Control the wave animation speed
   - **Wave Opacity**: Adjust wave transparency
   - **Day/Night**: Change brightness levels
   - **Sparkle Intensity**: Control particle visibility

2. **Interface Controls**:
   - **Hide Interface**: Click the "Hide Interface" button to enter fullscreen mode
   - **Show Interface**: Click anywhere on the screen (when hidden) to show interface again
   - **Keyboard Shortcut**: Press 'H' key to toggle interface visibility

3. **Performance Monitoring**: FPS counter is displayed in bottom-left corner

## Technical Details

### WebGL Implementation
- **Rendering Engine**: [REGL](https://github.com/regl-project/regl)
- **Shaders**: Custom vertex and fragment shaders for authentic XMB effects
- **Performance**: Adaptive resolution scaling based on device capabilities
- **Compatibility**: WebGL2 with WebGL1 fallback

### Wave Physics
- **Noise Functions**: Authentic XMB noise patterns from original PS3 code
- **Animation**: Time-based wave displacement with flowing surface details
- **Particles**: Surface-following sparkle effects with opacity variance

### Browser Support
- Chrome 51+
- Firefox 51+
- Safari 10+
- Edge 79+

## Customization

### Color Themes
The project includes the original PS3 color themes, but only static ones, not the actual gradients and Day/Night cycles (issue to resolve in the future, PR's welcome!):
- **Sapphire** (Default): `[37, 89, 179]` - Original XMB blue
- **Emerald**: `[20, 101, 50]` - Deep green
- **Ruby**: `[116, 15, 48]` - Rich red
- **Gold**: `[160, 120, 0]` - Warm gold
- **Amethyst**: `[118, 6, 135]` - Deep purple
- **Turquoise**: `[26, 115, 115]` - Cyan blue
- **Amber**: `[192, 114, 40]` - Orange amber
- **Silk**: `[104, 107, 108]` - Silver gray

### Adding Custom Colors
Edit the color palette in `waves/waves-controller.js` within the `addColorSelector()` method:

```javascript
addColorSelector() {
  const colors = [
    ["original", [37, 89, 179]], // Original XMB blue
    ["custom-name", [r, g, b]], // Add your custom color here
    ["january", [203, 191, 203]], // Silver/gray
    // ... existing monthly colors
  ];

  this.addList(
    "Color Theme",
    colors,
    "original", // default selection
    (color) => window.ps3Waves.updateParams({
      backgroundColor: color
    })
  );
}
```

If you're adding the original gradients with Day/Night support, probably better to have a different file or section to manage all of that.

## Contributing

Pull requests are very welcome. I WILL TAKE ANY HELP!

### Development Guidelines

As long as we move towards an identical replica of the XMB waves background, do whatever you want!

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments and a Thank You

- [Alphardex](https://codepen.io/alphardex/pen/poPZNwE) for the original code, seriously, this CodePen was the closest thing I could find to an XMB code starting point.

There was another guy on [Reddit](https://www.reddit.com/r/webdev/comments/1ca4gpy/ps3s_xmb_interface_done_in_html5_css_javascript/) that had a really good replica, but I was too slow to find it and it seems the Github repo is long gone.

- Sony for the original PS3 XMB implementation, personally I think this is the best thing they have designed and I really love it.

## Support

### [Open an issue on GitHub!](https://github.com/linkev/Playstation-3-XMB/issues)
