# 3D Framecraft

3D Framecraft helps you choose a visual style from 37 Three.js video examples and turns your topic or script into a detailed animation prompt.

It creates a prompt file; it does not render the animation. The generated prompt includes the selected style recipe and the bundled rendering and sound kits.

## Requirements

- Python 3 for the optional local style-selection gallery.
- Node.js for building the prompt.
- Internet access to play the video previews. The prompt builder and style recipes are bundled locally.
- No package installation is required.

## Install in Codex

### For all your projects

Clone the skill into Codex's user-level skills directory:

```bash
mkdir -p "$HOME/.agents/skills"
git clone https://github.com/MohammadB72/3d-framecraft.git "$HOME/.agents/skills/3d-framecraft"
```

### For one project

First clone this repository somewhere on your machine, for example:

```bash
git clone https://github.com/MohammadB72/3d-framecraft.git "$HOME/src/3d-framecraft"
```

Then, from the project root, copy the checkout into that project's skills directory. `rsync` keeps the skill files but excludes the checkout's Git metadata.

```bash
mkdir -p .agents/skills/3d-framecraft
rsync -a --exclude='.git' "$HOME/src/3d-framecraft/" .agents/skills/3d-framecraft/
```

Start a new Codex session after installation. Codex can select the skill automatically when relevant, or you can invoke it directly:

```text
Use $3d-framecraft to create a 3D animation prompt about [your topic].
```

## Install in Claude Code

### For all your projects

Clone the skill into Claude Code's personal skills directory:

```bash
mkdir -p "$HOME/.claude/skills"
git clone https://github.com/MohammadB72/3d-framecraft.git "$HOME/.claude/skills/3d-framecraft"
```

### For one project

If you followed the project-scoped Codex setup above, run this from the project root to install it for Claude Code too. Otherwise, first clone the repository to `$HOME/src/3d-framecraft` as shown above.

```bash
mkdir -p .claude/skills/3d-framecraft
rsync -a --exclude='.git' "$HOME/src/3d-framecraft/" .claude/skills/3d-framecraft/
```

Start a new Claude Code session after installation. Invoke the skill with its slash command:

```text
/3d-framecraft Create a 3D animation prompt about [your topic].
```

## How to use it

1. Ask Codex or Claude Code to create a prompt for your topic, or invoke the skill directly as shown above.
2. Choose a style from the gallery of 37 video previews and press **Confirm selection**. If your environment cannot open the local gallery, open the installed skill's `assets/gallery.html` file in a browser, choose a style, and copy the selection back into the conversation.
3. Return to the conversation with your topic or script. If you already gave the topic, say **“I chose a style.”**
4. The skill builds `3d-style-prompt.md` in your current working directory. Review it, then use it with your preferred animation workflow.

If you want to use a voiceover, provide the voiceover script and its timings (for example, an SRT file). You can also specify the duration or layout you want. The skill will carry those requirements into the prompt.

To start over with a different look, ask the skill to **change style**.

## What the generated prompt includes

- The chosen style's visual direction, materials, lighting, camera, motion, and finish.
- A short sequence of visual beats tailored to your topic.
- The bundled Three.js rendering and sound kits.
- A visual storyboard by default, followed by implementation requirements.

By default, prompts target 1920×1080 and approximately 7–12 seconds, with no voiceover. The skill adjusts these defaults when you request a different duration, layout, or voiceover.

## Notes

- Video previews stream from their original URLs, so preview playback requires internet access.
- The local gallery saves a selection receipt when opened through the skill's local server. The standalone `assets/gallery.html` fallback provides a selection you can copy into chat.
- The skill only writes the animation prompt. It does not execute the generated animation-building instructions or render a video.
