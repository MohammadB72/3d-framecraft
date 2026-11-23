#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'references/styles.json'), 'utf8'));

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(['--inspect', '--voiceover', '--no-storyboard', '--help']);
  const values = new Set(['--style', '--topic-file', '--output', '--timing-file']);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (flags.has(arg)) opts[arg] = true;
    else if (values.has(arg) && args[i + 1] && !args[i + 1].startsWith('--')) opts[arg] = args[++i];
    else throw new Error(`Unknown option or missing value: ${arg}`);
  }
  if (opts['--help']) {
    console.log('node scripts/build-prompt.cjs --style ID_OR_NUMBER --topic-file PATH --output PATH\n' +
      'Inspect a recipe: --style ID_OR_NUMBER --inspect\n' +
      'Optional: --voiceover --timing-file PATH --no-storyboard');
    return;
  }
  const choice = (opts['--style'] || '').replace(/^#/, '');
  const card = catalog.find(s => s.id === choice || (/^\d+$/.test(choice) && s.order === Number(choice)));
  if (!card) throw new Error('Choose a valid style ID or number from 1 to 37.');
  if (opts['--inspect']) {
    console.log(JSON.stringify(card, null, 2));
    return;
  }
  if (!opts['--topic-file'] || !opts['--output']) throw new Error('--topic-file and --output are required.');
  const content = fs.readFileSync(opts['--topic-file'], 'utf8').trim();
  if (!content) throw new Error('The topic is empty. Ask the user for their topic or script first.');
  const voiceover = Boolean(opts['--voiceover']);
  if (voiceover && !opts['--timing-file']) throw new Error('Voiceover mode requires --timing-file with SRT or word timings.');
  const srt = opts['--timing-file'] ? fs.readFileSync(opts['--timing-file'], 'utf8').trim() : '';
  if (voiceover && !srt) throw new Error('The voiceover timing file is empty.');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'assets/styles', `${card.id}.json`), 'utf8'));
  const kits = JSON.parse(fs.readFileSync(path.join(root, 'assets/kits.json'), 'utf8'));
  const { buildPrompt } = require(path.join(root, 'assets/prompt-builder.cjs'));
  const prompt = buildPrompt(data, { ...kits, content, srt, voiceover, storyboard: !opts['--no-storyboard'] });
  const output = path.resolve(opts['--output']);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, prompt, 'utf8');
  console.log(JSON.stringify({ style: card.id, name: card.name, output, characters: prompt.length }));
}

try { main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
