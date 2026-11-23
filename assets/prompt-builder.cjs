(function (root) {
  const CONTENT_PH = '[Describe your topic, or paste your script here. If this is left as is, ask me for it before building.]';
  const SRT_PH = '[Paste the SRT, or word-level timestamps, of your voiceover here. If this is left as is, ask me for them before building.]';

  const STORYBOARD = (vo) => `
STORYBOARD FIRST: before building the animation, make a VISUAL storyboard and wait for my OK.
- One HTML page (show it as an artifact if you can) with a grid of panels, one per beat (about 3-6${vo ? ', more if the voiceover is long' : ''}). Each panel is a still of that beat's key frame, rendered with the STAGE kit from a block-out of the scene: simple forms in the reference's materials, lighting, camera angle and grade, so the panels already look like the finished piece. Render the stills one after another on one canvas with S.seek(time) at about 16 samples (enough for depth of field and soft shadows to read) and copy each into an image. Stills only, no animation or sound yet.
- Under each panel: the beat number, its start and end time${vo ? ' (taken from the voiceover timing)' : ''}, the exact on-screen text, what moves or changes to get there from the previous panel, what the camera does, and its key sounds.
- Below the grid, list any facts or numbers you had to assume.
When I approve it (or after my changes), build the full animation exactly as storyboarded, reusing the storyboard's scene code.
`;

  function buildPrompt(d, o) {
    o = o || {};
    const vo = !!o.voiceover;
    const content = (o.content && o.content.trim()) || CONTENT_PH;
    const srt = (o.srt && o.srt.trim()) || SRT_PH;
    const usesStroke = /STROKEFONT/.test(d.source), usesText3d = /K\.text3d|K\.textShapes/.test(d.source);
    // explainer and story styles must not come back as a title card, whatever the pasted content looks like
    const telling = d.use === 'title' || d.use === 'product' ? '' : `- Tell my content as ${d.use === 'story' ? 'a story' : 'an explainer'}, not a title card: things happen to objects or characters over ${vo ? 'beats' : 'three or four beats'} that follow from each other, and the picture does the telling. Words are small captions and labels, never the subject of a shot. End on the result of the process or the end of the story, not on a headline, slogan or logo.\n`;
    const L = [];
    L.push(`I want a short 3D motion graphic made with three.js in the "${d.name}" style${vo ? ', timed to my voiceover' : ''}. Below is the complete source of a reference animation in this exact style, plus the small rendering kit and sound kit it runs on. Use them as your style guide and rebuild the animation around my content.

MY CONTENT:
${content}
`);
    if (vo) L.push(`MY VOICEOVER TIMING:
${srt}
(If I also attached the voiceover audio file, that's fine: take the timing from the text above, and if you can work with files, use that audio as the voiceover when rendering. If there is no timing above but you can transcribe the attached audio with word-level timestamps, do that instead of asking me.)
`);
    if (o.storyboard !== false) L.push(STORYBOARD(vo));
    L.push(`WHAT TO BUILD
One self-contained HTML file (show it as an artifact if you can):
- three.js ${o.three || '0.187.0'} core only, loaded as an ES module from a CDN with an import map (no addons), then set window.THREE = THREE before running the kit and the style code.
- A 1920x1080 canvas scaled to fit the window, with a small control bar: play/pause, a scrub slider, the time, a sound toggle, loop on by default.${vo ? `
- A "Load voiceover" button (a file input, and also accept drag-and-drop of an audio file). Once a file is loaded, the audio is the clock: play, pause and scrub control the audio element, and every frame is S.seek(audio.currentTime). Without a file, it runs on its own clock.` : ''}
- A new style object, built the same way as the reference (content block first, then build(S) returning update(t)), that tells MY CONTENT in this style. ${vo ? 'Set its duration to the end of the last voiceover line plus about 1 second.' : '7-12 seconds unless my content needs more.'}
- Run it with the kit: const S = await K.run(canvas, style, { samples }). Use a low sample count (2-4) while playing live and the style's full count when rendering frames. Expose window.seek = (t) => S.seek(t) and window.DURATION.
- Play the style's sound(k) score in sync from the player: on play call stopSound = SOUND.live((k) => style.sound(k), currentT, { voiceover: ${vo} }), and call stopSound() on pause, on seek and when the sound toggle is turned off.
- Include the STAGE kit and the SOUND kit below unchanged${usesStroke ? ', and the STROKEFONT library' : ''}${usesText3d ? ', and the TEXT3D library (load it after the STAGE kit)' : ''}.
${d.families && d.families.length ? `- Load these Google Fonts before building (the kit awaits the specs in style.fonts): ${d.families.join(', ')}\n` : ''}
HOW TO STAY IN THE STYLE
- The reference shows the look, not the story. Its objects, layout and beats belong to its own topic: do not reuse them unless my content calls for them. Work out what my content needs to show first, then build those things in this look.
${telling}- Keep the reference's materials, lighting, camera language, grade and the way things move. Change the story, the objects and the words; do not change the look.
- update(t) must set the whole scene for time t and nothing may build up between calls: the kit calls it many times per frame to make motion blur, depth of field and soft shadows. No Math.random, Date or timers; use K.rng(seed).
- Build everything in code: no downloaded models, images, HDRIs or textures.
- Simple forms, beautifully lit and finished, beat complicated models that look wrong. Draw my subject accurately and double-check any facts or numbers you show.
- It is video, often watched on a phone: keep every word the story needs large, sharp and on screen long enough to read, keep the subject filling most of the frame, and keep everything that matters inside the frame for the whole camera move. The first frame should already be worth looking at, and the last second should hold.
`);
    if (vo) L.push(`TIMING FROM THE VOICEOVER
- First turn my voiceover timing into a BEATS table in the content block: one entry per idea, with its start and end time, the words spoken, and what happens on screen. Every move reads its times from BEATS (and from word times when you need an exact reveal), never from numbers scattered through the code, so a new take only means editing the table. If I gave only line times, estimate each word's time from its position in its line, and leave room in the table for real word timestamps.
- A visual lands on the word it illustrates: a number appears as it is spoken, a label as its name is said. It can lead the word by up to 0.2 s, but never lag it.
- Within a beat, keep building that one idea while the voice explains it, then hold the finished state until the sentence ends instead of rushing ahead. Use pauses in the speech for the bigger changes.
- On-screen text is key words, labels and numbers only. Don't print the sentence being spoken, and no subtitles (captions get added in editing).
- Start as the first line is spoken, and end about 1 second after the last word, on the result.
`);
    L.push(`FLOW BETWEEN BEATS
- A new beat does not automatically mean a new scene. When the next idea builds on the last, stay in the same world: the things that matter stay on screen and move, grow, re-arrange or transform, and the camera travels to the part of the scene where the next idea happens.
- When the story really moves on (a new place or time, a before/after contrast, a reveal), change scene the way this look would: a turn of the set, a page, a passing object that wipes the frame, a change of light. No hard cuts.
- The reference's scene count is not a template: ${vo ? 'a long voiceover needs more ground to cover, so plan a bigger world or several sets, and keep the camera on one slow, continuous move through them.' : 'fit the number of beats to my content.'}
`);
    L.push(vo ? `SOUND (voiceover mode: the narration stays on top, the effects keep the piece alive underneath)
- Score it as fully as a standalone piece: the events that land (things arriving, labels, contacts, transitions, the key number, the result) and the sounds this material would make while things move.
- Mark the small, frequent sounds { minor: true } (ticks, taps, typing, small pops), or schedule custom ones inside k.withMinor(() => ...). In voiceover mode the kit plays those at about 60% volume, drops ambience beds and music, and sets everything a little lower, so pass { voiceover: true } to SOUND.live and SOUND.renderOffline.
- Keep the big hits (the key reveal, the result) at full volume and, where you can, put them in pauses or on stressed words rather than on top of a sentence.
- A sound starts on the exact frame its event appears: drive picture and sound from the same BEATS times.
` : `SOUND (no voiceover: a fuller mix)
- A sound starts on the exact frame its event appears: drive picture and sound from the same schedule, as the reference does.
- Score the events that land (things arriving, labels, contacts, transitions, the key number, the result) with sounds this material would make: glass, plastic, paper, metal, motors.
- A quiet ambience bed is welcome, and music only if it suits the style. Effects in front, bed and music clearly underneath, and small silences so the big hits read.
`);
    L.push(`
If you are Claude Code with a shell: render an MP4 in headless Chrome with the GPU enabled. Load the page, call window.seek(i / 30) for every frame, capture the canvas and pipe the frames into ffmpeg; render the sound with SOUND.renderOffline((k) => style.sound(k), DURATION, 48000, { voiceover: ${vo} }) and mux it in at about -15 LUFS. Look at a few rendered frames and fix framing, lighting or legibility problems before you call it done.${vo ? ` Mix in the voiceover with the effects ducked under it:
ffmpeg -i video.mp4 -i voice.wav -i effects.wav -filter_complex "[1:a]loudnorm=I=-17:TP=-2,asplit=2[v1][v2];[2:a]loudnorm=I=-26:TP=-4:LRA=20[fx0];[fx0][v1]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=250[fx];[v2][fx]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k out.mp4` : ''}

STYLE CARD
Name: ${d.name}
Family: ${d.family}
Use: ${d.use || 'explainer'}
Look: ${d.look}
Motion: ${d.motion}
Light: ${d.light}
Materials: ${d.materials}
Camera: ${d.camera}
Finish: ${d.post}
Good for: ${d.explains}

STAGE KIT (lib/stage.js)
\`\`\`js
${(o.stage || '').trim()}
\`\`\`

SOUND KIT (lib/sound.js)
\`\`\`js
${(o.sound || '').trim()}
\`\`\`
${usesStroke ? `\nSTROKEFONT (lib/strokefont.js)\n\`\`\`js\n${(o.strokefont || '').trim()}\n\`\`\`\n` : ''}${usesText3d ? `\nTEXT3D (lib/text3d.js: solid 3D letters from any loaded font)\n\`\`\`js\n${(o.text3d || '').trim()}\n\`\`\`\n` : ''}
REFERENCE STYLE SOURCE (styles/${d.id}.js; its sample topic was "${d.topic}")
\`\`\`js
${d.source.trim()}
\`\`\`
`);
    return L.join('\n');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildPrompt };
  else root.buildPrompt = buildPrompt;
})(typeof window !== 'undefined' ? window : globalThis);

