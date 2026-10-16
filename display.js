// Lossmol — in a displayed message. Needs lib/direction.js and lib/blocks.js
// before it; display.css styles what it marks.
//
// Every block whose own words are mostly Hebrew (or another right-to-left
// script) is marked `data-lossmol="rtl"` and shown right-to-left and
// right-aligned, even if the sender's mail client left it left-aligned. An
// English block inside one is marked "ltr" and set back. Plain-text messages
// are handled paragraph by paragraph too (lib/blocks.js).
'use strict';
(() => {
  if (globalThis.lossmol) return; // already here (injected again into an open message)

  const MARK = 'data-lossmol';
  const settings = { displayFix: true };

  // Whose word counts, the message's or ours? A message with `dir="rtl"`
  // anywhere was written by someone (or something) that knows about
  // direction, so a `dir` it put on a block is deliberate and stays, even
  // `dir="ltr"` on Hebrew. A message without any was written by a client
  // that stamps `dir="ltr"` on everything or nothing at all (Yahoo, Gmail's
  // wrapper, Outlook), and those tell us nothing: every block is judged.
  let trusted = null;
  const isTrusted = () => (trusted ??= document.body.matches('[dir="rtl" i]') || !!document.body.querySelector('[dir="rtl" i]'));

  const engine = globalThis.lossmolBlocks.create({
    mark(block, dir) {
      if (dir) block.setAttribute(MARK, dir);
      else block.removeAttribute(MARK);
    },
    skip: block => block.hasAttribute('dir') && isTrusted(),
  });

  // The button in the message header switches this one message, as it
  // arrived or fixed, without touching the setting; a change to the setting
  // drops that.
  let override = null;
  const wanted = () => override ?? settings.displayFix;

  let on = false;
  function apply() {
    trusted = null;
    if (wanted() && !on) {
      engine.processAll(document.body);
      engine.observe(document.body);
      on = true;
    } else if (!wanted() && on) {
      engine.disconnect();
      document.querySelectorAll(`[${MARK}]`).forEach(b => b.removeAttribute(MARK));
      on = false;
    }
    report();
    if (on) setTimeout(report, 1000); // once the engine's idle work is done too
  }
  function toggle() {
    override = !wanted();
    apply();
  }

  // How many blocks look different because of Lossmol: measured with the
  // marks off and on again (synchronous, so nothing flickers). Blocks the
  // message already had right don't count.
  function changed() {
    const marked = [...document.querySelectorAll(`[${MARK}]`)];
    if (!marked.length) return 0;
    const withMarks = marked.map(b => getComputedStyle(b).direction);
    const saved = marked.map(b => b.getAttribute(MARK));
    marked.forEach(b => b.removeAttribute(MARK));
    const without = marked.map(b => getComputedStyle(b).direction);
    marked.forEach((b, i) => b.setAttribute(MARK, saved[i]));
    return withMarks.filter((d, i) => d !== without[i]).length;
  }

  // Tells background.js, which shows it on the button: a number when
  // Lossmol re-aligned that many blocks, nothing when the message is shown as
  // its own instructions say, a mark when switched off for this message.
  function report() {
    const state = { lossmol: true, event: 'display-state', on, changed: on ? changed() : 0 };
    globalThis.browser?.runtime?.sendMessage?.(state)?.catch?.(() => {});
  }

  const storage = globalThis.browser?.storage;
  if (storage) {
    storage.local.get('settings').then(r => { Object.assign(settings, r.settings); apply(); }, apply);
    storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.settings) { Object.assign(settings, changes.settings.newValue); override = null; apply(); }
    });
    globalThis.browser.runtime?.onMessage?.addListener(msg => { if (msg?.lossmol && msg.command === 'display-toggle') toggle(); });
  } else {
    apply();
  }

  globalThis.lossmol = { settings, engine, toggle, changed };
})();
