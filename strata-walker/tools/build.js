#!/usr/bin/env node
/*
 * Build StrataWalker.html from StrataWalker.tw (single source of truth).
 * Usage: node tools/build.js
 * Produces story/twine/StrataWalker.html (self-contained, playable preview).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const twPath = path.join(root, 'story', 'twine', 'StrataWalker.tw');
const outPath = path.join(root, 'story', 'twine', 'StrataWalker.html');
const runtimePath = path.join(__dirname, 'runtime.js');

const src = fs.readFileSync(twPath, 'utf8');
const lines = src.split(/\r?\n/);
const PASSAGES = {};
let cur = null, buf = [];
for (const line of lines) {
  const m = line.match(/^::\s*(.+?)\s*$/);
  if (m) {
    if (cur !== null) PASSAGES[cur] = buf.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
    cur = m[1].trim(); buf = [];
  } else buf.push(line);
}
if (cur !== null) PASSAGES[cur] = buf.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');

let START = 'Start', title = 'The Strata Walker';
if (PASSAGES['StoryData']) {
  try { const d = JSON.parse(PASSAGES['StoryData']); if (d.start) START = d.start; } catch (e) {}
}
if (PASSAGES['StoryTitle']) title = PASSAGES['StoryTitle'].trim();

const runtimeSrc = fs.readFileSync(runtimePath, 'utf8');

const css = `
* { box-sizing: border-box; }
body { margin: 0; background: #0e1116; color: #d7dde6; font: 16px/1.6 -apple-system, Segoe UI, Roboto, sans-serif; }
#app { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
h1 { font-size: 2rem; letter-spacing: .5px; color: #ffd479; margin: 0 0 .5em; }
h2 { color: #ffd479; }
.passage p { margin: 0 0 1em; }
hr { border: none; border-top: 1px solid #2a313c; margin: 1.4em 0; }
a.lk { color: #7fd1ff; text-decoration: none; border-bottom: 1px dotted #7fd1ff; cursor: pointer; }
a.lk:hover { color: #fff; border-bottom-color: #fff; }
.status { position: sticky; bottom: 0; margin-top: 2em; padding: 10px 14px; background: #161b22; border: 1px solid #2a313c; border-radius: 8px; color: #9aa7b5; font-size: 13px; }
.missing { color: #ff6b6b; }
`;

const html =
`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head>` +
`<body><main id="app"></main>` +
`<script>window.PASSAGES=${JSON.stringify(PASSAGES)};window.START=${JSON.stringify(START)};</script>` +
`<script>${runtimeSrc}</script>` +
`</body></html>`;

fs.writeFileSync(outPath, html);
console.log('Built', outPath, '(' + Object.keys(PASSAGES).length + ' passages)');

// ---- self-test: render every passage, catch runtime errors ----
try {
  const { createEngine } = require('./runtime.js');
  const eng = createEngine(PASSAGES);
  for (const name of Object.keys(PASSAGES)) {
    if (name === 'StoryData' || name === 'StoryTitle') continue;
    const out = eng.renderHTML(name);
    if (typeof out !== 'string') throw new Error('renderHTML did not return string for ' + name);
  }
  // Reset after the all-passage smoke test, then exercise relationship and stat choices.
  const startHTML = eng.renderHTML('Start');
  eng.renderHTML('ConfrontVey');
  eng.renderHTML('Oath');
  const st = eng.getState();
  if (st.c_president !== 1) throw new Error('ConfrontVey should raise the President relationship');
  if (st.endurance !== 2) throw new Error('Oath should raise Endurance from E to D');
  for (const key of ['strength', 'agility', 'mana', 'luck']) {
    if (st[key] !== 1) throw new Error(key + ' should remain at rank E');
  }
  if (!startHTML.includes('Strength:') || !startHTML.includes('Luck:')) {
    throw new Error('letter-rank stat line did not render');
  }
  console.log('Self-test OK. Sample state:', JSON.stringify({ endurance: st.endurance, president: st.c_president, flags: st.flags }));
} catch (e) {
  console.error('Self-test FAILED:', e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
