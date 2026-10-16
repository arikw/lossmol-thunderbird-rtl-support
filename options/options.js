// Lossmol — the settings page. Reads and writes `settings` in storage.local;
// compose.js and display.js listen for the change.
'use strict';
(async () => {
  document.documentElement.dir = messenger.i18n.getMessage('@@bidi_dir');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = messenger.i18n.getMessage(el.dataset.i18n);

  const { settings = {} } = await messenger.storage.local.get('settings');
  const fields = {
    composeDefault: document.getElementById('composeDefault'),
    composeAuto: document.getElementById('composeAuto'),
    displayFix: document.getElementById('displayFix'),
    sendHtml: document.getElementById('sendHtml'),
  };
  fields.composeDefault.value = settings.composeDefault ?? 'auto';
  fields.composeAuto.checked = settings.composeAuto ?? true;
  fields.displayFix.checked = settings.displayFix ?? true;
  fields.sendHtml.checked = settings.sendHtml ?? true;

  async function save() {
    const current = (await messenger.storage.local.get('settings')).settings || {};
    await messenger.storage.local.set({
      settings: {
        ...current,
        composeDefault: fields.composeDefault.value,
        composeAuto: fields.composeAuto.checked,
        displayFix: fields.displayFix.checked,
        sendHtml: fields.sendHtml.checked,
      },
    });
  }
  Object.values(fields).forEach(el => el.addEventListener('change', save));
})();
