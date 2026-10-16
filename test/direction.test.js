// node --test test/   (standard library only)
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
require('../lib/direction.js');
const { judge } = globalThis.lossmolDirection;

test('no words: null', () => {
  assert.equal(judge(''), null);
  assert.equal(judge('123 !? 🙂'), null);
});
test('mostly Hebrew: rtl', () => {
  assert.equal(judge('שלום לכולם'), 'rtl');
  assert.equal(judge('Hi, מה שלומך היום'), 'rtl');
  assert.equal(judge('תראה maybe watch occasionally — אבל לא עכשיו ולא מחר'), 'rtl');
});
test('mostly English: ltr', () => {
  assert.equal(judge('hello world'), 'ltr');
  assert.equal(judge('see you tomorrow בסדר'), 'ltr');
});
test('a tie is ltr', () => {
  assert.equal(judge('hi שלום'), 'ltr');
});
test('a run of letters in one script is one word', () => {
  assert.equal(judge('כwatch'), 'ltr'); // "כ" and "watch": one of two
  assert.equal(judge('שָׁלוֹם'), 'rtl'); // vowel marks stay inside the word
});
test('arabic and other right-to-left scripts count', () => {
  assert.equal(judge('مرحبا بالعالم'), 'rtl');
  assert.equal(judge('ܫܠܡܐ'), 'rtl');
});
