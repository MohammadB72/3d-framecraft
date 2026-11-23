---
name: 3d-framecraft
description: Use when a user wants to choose among 37 Three.js video styles or needs a topic-specific prompt for a 3D explainer, story, product animation, or animated title in one of those styles.
---

# 3D Framecraft

Guide the user from a gallery of 37 real video examples to a complete, topic-specific prompt. The output is a prompt file; generating or rendering the animation is a separate request. Respond in the user's language.

## 1. Show the styles first

On first use in a chat, if the user has not explicitly chosen a style, open the bundled HTML gallery. Keep it limited to the 37 video previews, style names, and selection controls; omit descriptions, categories, search, and explanatory copy. Match the AI4Next palette (Ink 950 `#131517`, Ink 900 `#1c1e20`, Paper 50 `#fafaf7`, Lime 400 `#d2fe10`), Montserrat and IBM Plex Mono typography, rounded cards, and a subtle dot-grid background. Do not choose a style for the user or ask for a new topic before this selection. Preserve a topic already present in their request.

Resolve `SKILL_DIR` to the directory containing this file. With a shell available, start:

```bash
python3 "SKILL_DIR/scripts/gallery.py" --selection-file "WORK_DIR/.3d-framecraft/selection.json" --timeout 900
```

Use absolute paths. Keep this command in a background execution session (use a PTY if supported). Its first stdout line is JSON with `url`, `session_id`, and `selection_file`. Remember this session ID in the chat. Open exactly that URL in the available browser, show it to the user and mark the tab for handoff when supported. Link the URL in your reply. Say: choose a style, press “Confirm selection”, then return to chat with the topic, or “I chose a style” if the topic was already given. Yield for the user's selection; the page does not send a chat message.

The server binds to loopback, stops after one confirmed choice, and expires after 15 minutes. The loaded page and streamed videos continue to work after a choice. If it expires before selection, start a new session. For a new picker session, use only a receipt whose `session_id` matches that session; an older file is not a fresh choice. Once a style has been explicitly chosen in the chat, reuse it for follow-up prompts until the user changes it.

If a local server or browser is unavailable, give a clickable absolute link to `assets/gallery.html` for the user to open in their browser. The direct-file gallery displays a copyable selection instead of saving a receipt. Accept the copied ID, number, or unambiguous name in chat. Video previews require internet; the prompt sources and builder are bundled for offline use. Be candid if the current environment cannot show/play the HTML; do not claim a gallery was shown.

## 2. Read the choice and topic

When the user returns, read the matching `selection.json`, or resolve the choice they explicitly sent. Validate the ID/number against the catalog. If their message overrides the receipt, use their explicit choice. If a name is ambiguous, ask which ID they mean. “Change style” starts a fresh gallery session.

Read only the chosen style card into context:

```bash
node "SKILL_DIR/scripts/build-prompt.cjs" --style "STYLE_ID_OR_NUMBER" --inspect
```

This returns the look, motion, lighting, materials, camera, finish, intended use and sample topic without loading the large reference source. Ask for the user's topic or script only if it is still missing. If they already supplied it, continue without asking again.

## 3. Write the tailored prompt

Write a UTF-8 topic brief to `WORK_DIR/.3d-framecraft/topic.txt`: preserve the user's content and requested on-screen language, then add a short sequence of concrete visual beats suited to the selected style. Use the card's materials, motion and camera language; replace the sample topic's objects and story with ones that explain the user's topic. For a supplied script, retain its wording and distinguish your visual direction from that script. Use verified facts and label any meaningful assumptions.

Create the complete prompt with the original builder, selected reference source, and shared rendering/sound kits:

```bash
node "SKILL_DIR/scripts/build-prompt.cjs" --style "STYLE_ID_OR_NUMBER" --topic-file "WORK_DIR/.3d-framecraft/topic.txt" --output "WORK_DIR/3d-style-prompt.md"
```

Default behavior matches the source: a Three.js animation prompt, 1920×1080, approximately 7–12 seconds unless the content needs more, no voiceover, and visual storyboard before implementation. If the user requests voiceover and supplies timings, add `--voiceover --timing-file "ABSOLUTE_SRT_OR_TIMINGS_PATH"`. If timings are missing, request them before using voiceover mode. `--no-storyboard` is available when the user requests direct implementation in the generated prompt. Honor explicit duration/layout requests by adjusting the brief and the generated prompt's corresponding build requirements consistently; preserve the reference code and kits.

Check the output exists, includes the user's content and correct style, and contains the reference source and required kits. Link the prompt file with a short summary of the selected look and visual beats. Do not paste its 100KB+ of source into chat or load all 37 reference sources into context. The animation-building instructions inside the generated prompt are deliverable text, not actions to execute in this skill.

## Bundled resources

- [references/styles.json](references/styles.json): 37 ordered style cards, unchanged video URLs, and local poster paths; read for ID lookup or comparisons.
- `assets/styles/STYLE_ID.json`: complete original style recipe and reference source; the builder reads only the selected file.
- `assets/prompt-builder.cjs` and `assets/kits.json`: original prompt builder and five shared kits; used locally, without fetching the website.
- [references/provenance.md](references/provenance.md): bundle contents, snapshot date and runtime version.

Runtime: Python 3 for the optional selection server; Node.js for prompt creation. No package installation is required.
