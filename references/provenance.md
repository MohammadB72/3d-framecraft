# Bundle contents

Snapshot: 2026-11-19. The bundle includes 37 code-built Three.js styles across seven categories. Video previews stream from their existing storage URLs. Posters are bundled locally and embedded into the standalone gallery.

- `assets/styles/*.json`: complete style recipes and reference animation source code.
- `assets/prompt-builder.cjs`: prompt builder used by the CLI.
- `assets/kits.json`: the shared `three`, `stage`, `sound`, `strokefont`, and `text3d` values.
- `references/styles.json`: ordered visual recipes, style metadata, and video URLs and local poster paths.
- `assets/posters/*.jpg`: local video preview posters.
- `assets/gallery.html`: an English gallery with search, category filters, video previews, and a selection handoff to chat.

The CLI creates prompt files locally. It does not run the reference animations or download third-party assets. The bundled rendering version is Three.js 0.187.0; it is a snapshot version rather than a claim about the latest release.
