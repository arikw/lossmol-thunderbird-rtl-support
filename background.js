// Lossmol — background (event page). Registers the scripts that run in the
// compose editor and in displayed messages, puts them into windows already
// open, and wires the toolbar button and the context menu to compose.js.
'use strict';

const COMPOSE_JS = ['lib/direction.js', 'lib/blocks.js', 'compose.js'];
const DISPLAY_JS = ['lib/direction.js', 'lib/blocks.js', 'display.js'];
const DISPLAY_CSS = ['display.css'];

const DEFAULTS = {
  composeDefault: 'auto', // the direction a new message starts in: auto (Thunderbird's), rtl, ltr
  composeAuto: true, // each paragraph follows its words as it's typed
  displayFix: true, // received messages shown paragraph by paragraph
  sendHtml: true, // send as HTML when a paragraph carries a direction
};

const t = key => messenger.i18n.getMessage(key);

// Registered scripts reach windows opened from now on (the registration is
// redone on every start, so it never collides with an earlier one).
async function registerScripts() {
  await messenger.scripting.compose.unregisterScripts().catch(() => {});
  await messenger.scripting.compose.registerScripts([{ id: 'lossmol-compose', js: COMPOSE_JS, runAt: 'document_idle' }]);
  await messenger.scripting.messageDisplay.unregisterScripts().catch(() => {});
  await messenger.scripting.messageDisplay.registerScripts([{ id: 'lossmol-display', js: DISPLAY_JS, css: DISPLAY_CSS, runAt: 'document_idle' }]);
}

// Windows already open when the add-on starts (install, update, enable).
// The scripts bail out if they're already there.
async function injectOpenTabs() {
  for (const tab of await messenger.tabs.query({ type: 'messageCompose' })) {
    await messenger.scripting.executeScript({ target: { tabId: tab.id }, files: COMPOSE_JS }).catch(() => {});
  }
  const shown = [...await messenger.tabs.query({ type: 'messageDisplay' }), ...await messenger.tabs.query({ type: 'mail' })];
  for (const tab of shown) {
    await messenger.scripting.insertCSS({ target: { tabId: tab.id }, files: DISPLAY_CSS }).catch(() => {});
    await messenger.scripting.executeScript({ target: { tabId: tab.id }, files: DISPLAY_JS }).catch(() => {});
  }
}

// A command for compose.js in a compose tab. If nothing answers (a window
// opened before the add-on was loaded), put the script in first.
async function send(tabId, command, dir) {
  const msg = { lossmol: true, command, dir };
  try {
    await messenger.tabs.sendMessage(tabId, msg);
  } catch {
    await messenger.scripting.executeScript({ target: { tabId }, files: COMPOSE_JS });
    await messenger.tabs.sendMessage(tabId, msg);
  }
}

// The same for display.js in a tab showing a message.
async function sendDisplay(tabId, command) {
  const msg = { lossmol: true, command };
  try {
    await messenger.tabs.sendMessage(tabId, msg);
  } catch {
    await messenger.scripting.insertCSS({ target: { tabId }, files: DISPLAY_CSS }).catch(() => {});
    await messenger.scripting.executeScript({ target: { tabId }, files: DISPLAY_JS });
    await messenger.tabs.sendMessage(tabId, msg);
  }
}

const COMPOSE_CONTEXTS = ['compose_body', 'compose_action'];
const DISPLAY_CONTEXTS = ['message_display_action'];
const MENU = [
  { id: 'paragraph-rtl', title: t('menuParagraphRtl'), command: 'paragraph', dir: 'rtl' },
  { id: 'paragraph-ltr', title: t('menuParagraphLtr'), command: 'paragraph', dir: 'ltr' },
  { id: 'sep-1', type: 'separator' },
  { id: 'message-rtl', title: t('menuMessageRtl'), command: 'message', dir: 'rtl' },
  { id: 'message-ltr', title: t('menuMessageLtr'), command: 'message', dir: 'ltr' },
  { id: 'sep-2', type: 'separator' },
  { id: 'settings', title: t('menuSettings') },
  // Right-click on the button in the message header: this message, or all.
  { id: 'display-this', title: t('menuDisplayThisOriginal'), contexts: DISPLAY_CONTEXTS }, // reworded per tab in onShown
  { id: 'display-always', title: t('menuDisplayAlwaysOff'), contexts: DISPLAY_CONTEXTS }, // reworded in onShown
  { id: 'sep-3', type: 'separator', contexts: DISPLAY_CONTEXTS },
  { id: 'display-settings', title: t('menuSettings'), contexts: DISPLAY_CONTEXTS },
];

// Thunderbird shows an add-on's items on its own button's menu at top level
// (up to six, separators included; more go under the add-on's full name),
// and in the editor's menu always under the add-on's full name. The full name
// is long for a menu, so: on the buttons, at most six items; in the editor,
// one item of our own named just "Lossmol", children under it.
async function createMenus() {
  await messenger.menus.removeAll();
  messenger.menus.create({ id: 'body-root', title: t('menuRoot'), contexts: ['compose_body'] });
  for (const { id, title, type, contexts = COMPOSE_CONTEXTS } of MENU) {
    if (contexts === COMPOSE_CONTEXTS) {
      if (id !== 'sep-1') messenger.menus.create({ id, title, type, contexts: ['compose_action'] }); // six at most
      messenger.menus.create({ id: `body-${id}`, parentId: 'body-root', title, type, contexts: ['compose_body'] });
    } else {
      messenger.menus.create({ id, title, type, contexts });
    }
  }
}

messenger.composeAction.onClicked.addListener(tab => send(tab.id, 'paragraph', 'toggle'));

// The button in the message header: this message only, as it arrived or
// fixed. The add-on's setting is untouched; the next message follows it.
messenger.messageDisplayAction.onClicked.addListener(tab => sendDisplay(tab.id, 'display-toggle'));

messenger.menus.onClicked.addListener(async (info, tab) => {
  const item = MENU.find(m => m.id === String(info.menuItemId).replace(/^body-/, ''));
  if (!item) return;
  if (item.id === 'settings' || item.id === 'display-settings') messenger.runtime.openOptionsPage();
  else if (item.id === 'display-this') { if (tab) sendDisplay(tab.id, 'display-toggle'); }
  else if (item.id === 'display-always') {
    const { settings } = await messenger.storage.local.get('settings');
    const now = { ...DEFAULTS, ...settings };
    await messenger.storage.local.set({ settings: { ...now, displayFix: !now.displayFix } });
  } else if (tab) send(tab.id, item.command, item.dir);
});

// display.js reports what it did to the message shown in a tab; the button's
// icon shows it quietly: full colour when Lossmol re-aligned something,
// outline when the message looks as its own instructions say, grey outline
// with left-aligned lines when switched off for this message. The tooltip
// has the words (and the count).
const STATE_ICON = { fixed: 'icons/lossmol.svg', none: 'icons/lossmol-idle.svg', off: 'icons/lossmol-off.svg' };
const displayState = new Map(); // tabId → 'fixed' | 'none' | 'off'
messenger.runtime.onMessage.addListener((msg, sender) => {
  if (!msg?.lossmol || msg.event !== 'display-state' || !sender.tab) return;
  const tabId = sender.tab.id;
  const n = msg.changed;
  const state = !msg.on ? 'off' : n ? 'fixed' : 'none';
  displayState.set(tabId, state);
  const title = state === 'off' ? t('displayStateOff')
    : state === 'fixed' ? messenger.i18n.getMessage('displayStateFixed', [String(n)]) : t('displayStateNone');
  messenger.messageDisplayAction.setIcon({ tabId, path: STATE_ICON[state] }).catch(() => {});
  messenger.messageDisplayAction.setTitle({ tabId, title }).catch(() => {});
});

// The first line of the button's menu says what a click would do to the
// message in this tab.
messenger.menus.onShown.addListener(async (info, tab) => {
  if (!info.contexts.includes('message_display_action')) return;
  const off = displayState.get(tab?.id) === 'off';
  await messenger.menus.update('display-this', { title: off ? t('menuDisplayThisFix') : t('menuDisplayThisOriginal') }).catch(() => {});
  const { settings } = await messenger.storage.local.get('settings');
  const always = settings?.displayFix !== false;
  await messenger.menus.update('display-always', { title: always ? t('menuDisplayAlwaysOff') : t('menuDisplayAlwaysOn') }).catch(() => {});
  await messenger.menus.refresh().catch(() => {});
});

messenger.tabs.onRemoved.addListener(tabId => displayState.delete(tabId));

// compose.js reports the direction of the paragraph the caret is in; the
// compose button shows it (lines on the right or on the left) and says what
// a click would do.
const COMPOSE_ICON = { rtl: 'icons/lossmol.svg', ltr: 'icons/lossmol-ltr.svg' };
messenger.runtime.onMessage.addListener((msg, sender) => {
  if (!msg?.lossmol || msg.event !== 'compose-state' || !sender.tab) return;
  const dir = msg.dir === 'rtl' ? 'rtl' : 'ltr';
  messenger.composeAction.setIcon({ tabId: sender.tab.id, path: COMPOSE_ICON[dir] }).catch(() => {});
  messenger.composeAction.setTitle({ tabId: sender.tab.id, title: t(dir === 'rtl' ? 'composeStateRtl' : 'composeStateLtr') }).catch(() => {});
});


// Thunderbird's "Automatic" delivery format downgrades a message to plain
// text when it finds no formatting worth keeping. Its check looks at `dir`
// on the <body> only, never on a paragraph, so a message whose paragraphs
// carry their direction would go out as plain text, direction lost. When the
// body carries a direction anywhere, send both HTML and plain text instead:
// what Thunderbird itself does for a message it considers formatted.
messenger.compose.onBeforeSend.addListener(async (tab, details) => {
  if (details.isPlainText) return {};
  // Empty paragraphs drop the direction the editor copied into them.
  try {
    await send(tab.id, 'cleanup');
    details = await messenger.compose.getComposeDetails(tab.id);
  } catch (e) { console.warn('Lossmol: cleanup before send failed', e); }
  if (details.deliveryFormat !== 'auto') return {};
  if (!/\sdir\s*=/i.test(details.body || '')) return {};
  const { settings } = await messenger.storage.local.get('settings');
  if (settings?.sendHtml === false) return {};
  return { details: { deliveryFormat: 'both' } };
});

messenger.runtime.onInstalled.addListener(async () => {
  const { settings } = await messenger.storage.local.get('settings');
  await messenger.storage.local.set({ settings: { ...DEFAULTS, ...settings } });
  await injectOpenTabs();
});

// A message already shown keeps its earlier script until another message is
// opened; make sure the button shows nothing stale meanwhile.
async function resetButtons() {
  await messenger.messageDisplayAction.setBadgeText({ text: '' }).catch(() => {});
  for (const tab of [...await messenger.tabs.query({ type: 'messageDisplay' }), ...await messenger.tabs.query({ type: 'mail' })]) {
    await messenger.messageDisplayAction.setBadgeText({ tabId: tab.id, text: '' }).catch(() => {});
    await messenger.messageDisplayAction.setTitle({ tabId: tab.id, title: null }).catch(() => {});
    await messenger.messageDisplayAction.setIcon({ tabId: tab.id, path: STATE_ICON.none }).catch(() => {});
  }
}

registerScripts().then(createMenus).then(resetButtons).catch(e => console.error('Lossmol:', e));
