// Lossmol — in the compose window's editor (the message body). Needs
// lib/direction.js and lib/blocks.js before it.
//
// - Each paragraph takes its direction from its own words as it's typed:
//   mostly Hebrew → right-to-left, so an English paragraph in the same
//   message stays left-to-right. The direction goes into the paragraph's
//   `dir` attribute, which is what the recipient gets.
// - Ctrl + right Shift makes the current paragraph right-to-left, Ctrl + left
//   Shift left-to-right (as in Word and Windows). A paragraph set by hand is
//   then left alone.
// - The toolbar button and the context menu send commands here through
//   background.js: "paragraph" (rtl / ltr / toggle) and "message".
// - The settings (storage) say what direction a new message starts in and
//   whether the automatic direction is on at all.
'use strict';
(() => {
  if (globalThis.lossmol) return; // already here (injected again into an open window)

  const { judge } = globalThis.lossmolDirection;
  const manual = new WeakSet(); // blocks whose direction was set by hand
  const settings = { composeDefault: 'auto', composeAuto: true };

  const QUOTE = 'blockquote[type="cite"], .moz-forward-container';
  const inQuote = block => !!block.closest(QUOTE);
  const inheritsRtl = block => !!block.parentElement && getComputedStyle(block.parentElement).direction === 'rtl';
  const direction = block => getComputedStyle(block).direction;

  // Only what's needed goes into the HTML: `dir="rtl"` on right-to-left
  // paragraphs, and `dir="ltr"` only where the paragraph would otherwise
  // inherit right-to-left.
  function mark(block, dir) {
    scheduleReport(); // the caret's paragraph may be the one flipping
    if (dir === 'rtl') block.setAttribute('dir', 'rtl');
    else if (dir === 'ltr') {
      if (inheritsRtl(block)) block.setAttribute('dir', 'ltr');
      else if (block.hasAttribute('dir')) block.removeAttribute('dir');
    }
    // null (no words of its own): left as is. The editor copies the previous
    // paragraph's direction into the one Enter creates, and that's where the
    // caret should stay; the words will decide, and cleanup() drops the
    // copied direction from paragraphs still empty when the message is sent.
  }

  // Before sending: a paragraph with no words of its own has no direction of
  // its own either. Only leaf blocks (no blocks inside), never a block set by
  // hand, never quotes or the body.
  function cleanup() {
    for (const block of document.body.querySelectorAll(engine.BLOCKS)) {
      if (!block.hasAttribute('dir') || manual.has(block) || inQuote(block)) continue;
      if (block.querySelector(engine.BLOCKS) || judge(engine.ownText(block))) continue;
      block.removeAttribute('dir');
    }
  }

  const engine = globalThis.lossmolBlocks.create({
    mark,
    skip: b => manual.has(b),
    caret: true,
    // A line set by hand keeps that when its wrapper is opened up into lines.
    onSplit(block, lines) { if (manual.has(block)) lines.forEach(l => manual.add(l)); },
  });

  // ---- commands ----

  function setBlock(block, dir) {
    const d = dir === 'toggle' ? (direction(block) === 'rtl' ? 'ltr' : 'rtl') : dir;
    block.setAttribute('dir', d);
    manual.add(block);
  }

  function selectedBlocks() {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return [];
    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      const blocks = [...document.body.querySelectorAll(engine.BLOCKS)]
        .filter(b => range.intersectsNode(b) && judge(engine.ownText(b)));
      if (blocks.length) return blocks;
    }
    const block = engine.lineBlockAt(range.startContainer, range.startOffset);
    return block ? [block] : [];
  }

  function setParagraph(dir) {
    const blocks = selectedBlocks();
    blocks.forEach(b => setBlock(b, dir));
    engine.flush();
    scheduleReport();
  }

  // The whole message: the body and every block in it (not quoted or
  // forwarded messages, which keep their own). Every top-level block carries
  // the direction itself, since some mail clients drop the <body>'s attributes.
  function setMessage(dir) {
    const body = document.body;
    const d = dir === 'toggle' ? (direction(body) === 'rtl' ? 'ltr' : 'rtl') : dir;
    body.setAttribute('dir', d);
    for (const block of body.querySelectorAll(engine.BLOCKS)) {
      if (inQuote(block)) continue;
      block.setAttribute('dir', d);
      manual.add(block);
    }
    engine.flush();
    scheduleReport();
  }

  function run(msg) {
    if (msg.command === 'paragraph') setParagraph(msg.dir);
    else if (msg.command === 'message') setMessage(msg.dir);
    else if (msg.command === 'cleanup') cleanup();
  }

  // ---- keyboard: Ctrl + right Shift → rtl, Ctrl + left Shift → ltr ----
  // Armed while Ctrl and a Shift are both held; any other key in between
  // (Ctrl+Shift+V…) disarms it. Applied when either is released.
  let shift = null; // which Shift is down: 'rtl' (right) or 'ltr' (left)
  let armed = null;
  // Which Shift: by its location (right = 2, left = 1), or by its code.
  const side = e => e.location === 2 || e.code === 'ShiftRight' ? 'rtl'
    : e.location === 1 || e.code === 'ShiftLeft' ? 'ltr' : null;
  document.addEventListener('keydown', e => {
    if (e.key === 'Shift') shift = side(e) || shift;
    if (e.key === 'Shift' || e.key === 'Control') armed = e.ctrlKey && shift ? shift : null;
    else armed = null;
  }, true);
  document.addEventListener('keyup', e => {
    if (e.key === 'Shift' || e.key === 'Control') {
      if (armed) { setParagraph(armed); e.preventDefault(); }
      armed = null;
    }
    if (e.key === 'Shift') shift = null;
  }, true);
  window.addEventListener('blur', () => { armed = null; shift = null; });

  // ---- the toolbar button shows the caret's paragraph ----
  // background.js swaps the button's icon (lines on the right or on the
  // left) and its tooltip, so what a click would do is visible.
  let reported = null;
  let reportTimer = 0;
  function reportState() {
    reportTimer = 0;
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    const block = engine.lineBlockAt(r.startContainer, r.startOffset) || document.body;
    const dir = direction(block);
    if (dir === reported) return;
    reported = dir;
    globalThis.browser?.runtime?.sendMessage?.({ lossmol: true, event: 'compose-state', dir })?.catch?.(() => {});
  }
  function scheduleReport() { if (!reportTimer) reportTimer = setTimeout(reportState, 120); }
  document.addEventListener('selectionchange', scheduleReport);
  window.addEventListener('focus', scheduleReport);

  // ---- settings ----

  // The direction a new message starts in: the body and the empty paragraphs
  // (the one the caret is in; the signature is judged by its words).
  function applyDefault() {
    const dir = settings.composeDefault;
    if (dir !== 'rtl' && dir !== 'ltr') return;
    document.body.setAttribute('dir', dir);
    for (const block of document.body.querySelectorAll(engine.BLOCKS)) {
      if (!inQuote(block) && !judge(engine.ownText(block))) mark(block, dir);
    }
  }

  let watching = false;
  function applyAuto() {
    if (settings.composeAuto && !watching) {
      engine.processAll(document.body);
      engine.observe(document.body);
      watching = true;
    } else if (!settings.composeAuto && watching) {
      engine.disconnect();
      watching = false;
    }
  }

  function start() {
    applyDefault();
    applyAuto();
  }

  const storage = globalThis.browser?.storage;
  if (storage) {
    storage.local.get('settings').then(r => { Object.assign(settings, r.settings); start(); }, start);
    storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.settings) { Object.assign(settings, changes.settings.newValue); applyAuto(); }
    });
    globalThis.browser.runtime.onMessage.addListener(msg => { if (msg?.lossmol) run(msg); });
  } else {
    start();
  }

  globalThis.lossmol = { run, start, settings, engine };
})();
