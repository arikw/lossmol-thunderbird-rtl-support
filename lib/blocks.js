// Lossmol — the blocks of a document, judged one by one. Shared by the
// compose script and the message display script; needs lib/direction.js
// before it. Defines `lossmolBlocks.create(options)`.
//
// Every text block — <p>, <div>, <li>, heading, <blockquote>, <pre>, table
// cell, and the <body> itself — is judged by its own text: text inside nested
// blocks is left out, so a wrapper never flips just because the message is
// mostly Hebrew, and each paragraph gets its own direction.
//
// Lines that aren't paragraphs: a message written with Enter as a plain line
// break (<br>), or plain text in a <pre>, has several lines in one block. If
// those lines don't agree, each paragraph among them (one <br> line; in
// preformatted text, a run of non-blank lines) is wrapped in a <div> of its
// own, so it can carry its own direction. Wrapping moves nodes around, so in
// the editor the caret is saved first and put back after.
//
// options:
//   mark(block, dir)   dir is 'rtl', 'ltr', or null for "no words of its own"
//   skip(block)        true to leave a block alone (set by hand)
//   caret              true in the editor: keep the selection across wrapping
'use strict';
(() => {
  const { judge } = globalThis.lossmolDirection;

  const BLOCK_TAGS = new Set([
    'BODY', 'DIV', 'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE',
    'TD', 'TH', 'DD', 'DT', 'CENTER', 'ADDRESS', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER',
    'MAIN', 'ASIDE', 'NAV', 'FIGCAPTION', 'SUMMARY', 'DETAILS', 'CAPTION',
  ]);
  const BLOCKS = [...BLOCK_TAGS].join(',').toLowerCase();
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  // Blocks whose lines may be wrapped in <div>s. A <div> can't go inside a
  // <p> or a heading; those are judged as a whole, by majority.
  const SPLITTABLE = new Set(['BODY', 'DIV', 'PRE', 'BLOCKQUOTE', 'TD', 'TH', 'LI', 'DD', 'SECTION', 'ARTICLE', 'CENTER']);

  const isElement = node => node.nodeType === Node.ELEMENT_NODE;
  const isText = node => node.nodeType === Node.TEXT_NODE;
  const isBlock = node => isElement(node) && BLOCK_TAGS.has(node.tagName);
  const isBr = node => isElement(node) && node.tagName === 'BR';

  // The text a block holds directly: text inside nested blocks is left out.
  function ownText(block) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isText(node)) return NodeFilter.FILTER_ACCEPT;
        if (BLOCK_TAGS.has(node.tagName) || SKIP.has(node.tagName)) return NodeFilter.FILTER_REJECT; // skip its whole subtree
        return NodeFilter.FILTER_SKIP; // look inside <span>, <b>, <a>, …
      },
    });
    let text = '';
    while (walker.nextNode()) text += walker.currentNode.data;
    return text;
  }

  function inlineText(node) {
    if (isText(node)) return node.data;
    if (!isElement(node) || SKIP.has(node.tagName) || isBlock(node)) return '';
    return ownText(node);
  }

  function preformatted(block) {
    const ws = getComputedStyle(block).whiteSpace;
    return ws === 'pre' || ws === 'pre-wrap' || ws === 'pre-line' || ws === 'break-spaces';
  }

  // In preformatted text each line feed becomes a text node of its own, so a
  // line can be moved as a whole. Live ranges (the selection) follow splitText.
  function splitAtLineFeeds(block) {
    let node = block.firstChild;
    while (node) {
      const next = node.nextSibling;
      if (isText(node)) {
        let t = node;
        for (;;) {
          const i = t.data.indexOf('\n');
          if (i < 0) break;
          if (i > 0) t = t.splitText(i); // t now begins with the line feed
          if (t.data.length === 1) break;
          t = t.splitText(1); // t was just "\n"; go on with the rest
        }
      }
      node = next;
    }
  }

  // The block's direct children grouped into segments: inline runs, each
  // ended by a line break (a <br>, or a "\n" node in preformatted text), and
  // nested blocks, which stand on their own.
  function segments(block, pre) {
    if (pre) splitAtLineFeeds(block);
    const segs = [];
    let cur = { nodes: [] };
    for (const node of block.childNodes) {
      if (isBr(node) || (pre && isText(node) && node.data === '\n')) {
        cur.nodes.push(node);
        cur.brk = node;
        segs.push(cur);
        cur = { nodes: [] };
      } else if (isBlock(node) || (isElement(node) && SKIP.has(node.tagName))) {
        if (cur.nodes.length) segs.push(cur);
        cur = { nodes: [] };
        segs.push({ block: node });
      } else {
        cur.nodes.push(node);
      }
    }
    if (cur.nodes.length) segs.push(cur);
    for (const s of segs) if (s.nodes) s.text = s.nodes.map(inlineText).join('');
    return segs;
  }

  // Paragraphs among the segments: in preformatted text a run of non-blank
  // lines, otherwise each line. Only paragraphs with words count.
  function paragraphs(segs, pre) {
    const paras = [];
    let cur = null;
    for (const s of segs) {
      const blank = !s.nodes || !s.text.trim();
      if (pre && !blank && cur) { cur.nodes.push(...s.nodes); cur.text += s.text; continue; }
      if (!blank) { cur = { nodes: [...s.nodes], text: s.text }; paras.push(cur); }
      else cur = null;
    }
    return paras.map(p => ({ ...p, dir: judge(p.text) })).filter(p => p.dir);
  }

  function create(options) {
    const { mark, skip = () => false, caret = false } = options;
    const wrappers = new WeakSet(); // the <div>s this engine made

    const index = node => [...node.parentNode.childNodes].indexOf(node);

    // The selection's ends, taken before nodes move and put back after.
    // A position inside an element is remembered by the child it precedes.
    function snapshot(node, offset) {
      if (!isElement(node)) return { node, offset };
      return { container: node, child: node.childNodes[offset] || null };
    }
    function restore(s, replaced) {
      if (s.node) return s.node.isConnected ? s : null;
      if (s.child) {
        const c = s.child.isConnected ? s.child : replaced.get(s.child)?.first;
        return c?.isConnected ? { node: c.parentNode, offset: index(c) } : null;
      }
      if (s.container.isConnected) return { node: s.container, offset: s.container.childNodes.length };
      const last = replaced.get(s.container)?.last;
      return last?.isConnected ? { node: last.parentNode, offset: index(last) + 1 } : null;
    }
    function withCaret(fn) {
      const sel = caret && document.getSelection();
      if (!sel || !sel.rangeCount) { fn(new Map()); return; }
      const a = snapshot(sel.anchorNode, sel.anchorOffset);
      const f = snapshot(sel.focusNode, sel.focusOffset);
      const replaced = new Map();
      fn(replaced);
      const A = restore(a, replaced);
      const F = restore(f, replaced);
      if (A && F) try { sel.setBaseAndExtent(A.node, A.offset, F.node, F.offset); } catch { /* leave it */ }
    }

    // Wraps a paragraph's nodes in a <div>; `like` copies another block's
    // attributes onto it (a line that keeps its old wrapper's direction).
    function wrap(para, like) {
      const div = like ? like.cloneNode(false) : document.createElement('div');
      para.nodes[0].before(div);
      div.append(...para.nodes);
      wrappers.add(div);
      if (!like) mark(div, para.dir);
      return div;
    }

    // Opens one of our wrappers up: its lines go back to the parent, each
    // line with words wrapped on its own with the wrapper's attributes.
    function unwrap(block, segs, replaced) {
      const children = [...block.childNodes];
      replaced.set(block, { first: children[0], last: children[children.length - 1] });
      block.replaceWith(...children);
      wrappers.delete(block);
      const made = segs.filter(s => s.nodes && s.text.trim()).map(s => wrap({ nodes: s.nodes }, block));
      options.onSplit?.(block, made);
      return made;
    }

    // Judges one block. Lines of different directions, or lines next to
    // nested blocks, are wrapped so each paragraph carries its own.
    function process(block) {
      if (!block.isConnected || skip(block)) return;
      const pre = preformatted(block);
      const segs = segments(block, pre);
      const paras = paragraphs(segs, pre);
      if (!paras.length) { mark(block, null); return; }
      const hasBlocks = segs.some(s => s.block);
      const dirs = new Set(paras.map(p => p.dir));
      if (!SPLITTABLE.has(block.tagName) || (!hasBlocks && dirs.size === 1)) {
        mark(block, judge(ownText(block)));
        return;
      }
      withCaret(replaced => {
        if (wrappers.has(block)) {
          // One of our own, now holding several paragraphs: open it up and
          // judge each line beside it, instead of nesting.
          unwrap(block, segs, replaced).forEach(process);
          return;
        }
        paras.forEach(p => wrap(p));
      });
    }

    function processAll(root) {
      if (isBlock(root)) process(root);
      root.querySelectorAll(BLOCKS).forEach(process);
    }

    // The innermost block holding a node.
    function blockOf(node) {
      const el = isElement(node) ? node : node.parentElement;
      return el?.closest(BLOCKS) || null;
    }

    // The block to set by hand for a caret at (node, offset): the paragraph's
    // block, or — for a line directly in a splittable block such as the
    // <body> — that line, wrapped in a <div> of its own first.
    function lineBlockAt(node, offset) {
      const block = blockOf(node);
      if (!block) return null;
      if (!SPLITTABLE.has(block.tagName)) return block;
      const pre = preformatted(block);
      const segs = segments(block, pre);
      const inline = segs.filter(s => s.nodes);
      const several = segs.some(s => s.block) || inline.length > 1;
      if (block.tagName !== 'BODY' && !several) return block;
      // Which direct child is the caret in or before?
      let child = node;
      if (node === block) child = node.childNodes[offset] || node.lastChild;
      else while (child.parentNode !== block) child = child.parentNode;
      let seg = inline.find(s => s.nodes.includes(child));
      if (!seg) {
        if (child && isBlock(child)) return child;
        seg = inline[inline.length - 1];
      }
      if (seg && wrappers.has(block)) {
        // Several lines in one of our wrappers: open it up, and the caret's
        // line is one of the wrappers made (or gets one of its own).
        let made;
        withCaret(replaced => { made = unwrap(block, segs, replaced); });
        const own = made.find(div => div.contains(seg.nodes[0]));
        if (own) return own;
        let div;
        withCaret(() => { div = wrap({ nodes: seg.nodes, dir: null }); });
        return div;
      }
      if (!seg) {
        // An empty block: give it a line to hold the direction.
        const div = document.createElement('div');
        div.append(document.createElement('br'));
        block.append(div);
        wrappers.add(div);
        document.getSelection()?.collapse(div, 0);
        return div;
      }
      let div;
      withCaret(() => { div = wrap({ nodes: seg.nodes, dir: null }); });
      return div;
    }

    // ---- watching for changes ----
    // Changed blocks wait in `pending` and are judged in the browser's idle
    // time, a few milliseconds at a time, so typing never waits on this; the
    // timeout keeps a busy document from putting it off for long.
    const pending = new Set();
    let idleHandle = 0;
    let root = null;

    function schedule() {
      if (!idleHandle && pending.size) idleHandle = requestIdleCallback(work, { timeout: 300 });
    }
    function work(deadline) {
      idleHandle = 0;
      for (const block of pending) {
        if (deadline.timeRemaining() < 1 && !deadline.didTimeout) break;
        pending.delete(block);
        if (block.isConnected) process(block);
        observer.takeRecords(); // our own changes aren't news
      }
      schedule();
    }
    function queueOwner(node) {
      const block = blockOf(node);
      if (block) pending.add(block);
    }
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        queueOwner(m.target);
        m.addedNodes.forEach(node => {
          queueOwner(node);
          if (isElement(node)) node.querySelectorAll(BLOCKS).forEach(b => pending.add(b));
        });
      }
      schedule();
    });

    function observe(node) {
      root = node;
      observer.observe(node, { childList: true, characterData: true, subtree: true });
    }
    function disconnect() {
      observer.disconnect();
      cancelIdleCallback(idleHandle);
      idleHandle = 0;
      pending.clear();
      root = null;
    }
    const flush = () => { observer.takeRecords(); };

    return { process, processAll, blockOf, lineBlockAt, observe, disconnect, flush, ownText, isBlock, BLOCKS };
  }

  globalThis.lossmolBlocks = { create, BLOCKS, BLOCK_TAGS, SPLITTABLE };
})();
