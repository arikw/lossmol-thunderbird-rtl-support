// Lossmol — which way a text runs. Shared by the compose script and the
// message display script: background.js lists it before them, so it defines
// `lossmolDirection` in their global scope.
//
// Counts words, not letters: English words run longer and Hebrew leaves out
// most vowels, so letter counts lean English ("maybe watch occasionally" has
// more English letters than a Hebrew sentence around it). A word is a run of
// letters in one script, so "כwatch" is two words, "כ" and "watch"; vowel
// marks stay inside their word. Digits, punctuation and emoji don't count.
'use strict';
(() => {
  const RTL = '\\p{Script=Hebrew}\\p{Script=Arabic}\\p{Script=Syriac}\\p{Script=Thaana}\\p{Script=Nko}';
  const WORD = new RegExp(`(?:(?=\\p{L})[${RTL}]\\p{M}*)+|(?:(?![${RTL}])\\p{L}\\p{M}*)+`, 'gu');
  const RTL_WORD = new RegExp(`^[${RTL}]`, 'u');

  // 'rtl' when over half the words are right-to-left, 'ltr' when there are
  // words and they're not, null when there are no words to judge by.
  function judge(text) {
    const words = text.match(WORD) || [];
    if (!words.length) return null;
    const rtl = words.filter(w => RTL_WORD.test(w)).length;
    return rtl / words.length > 0.5 ? 'rtl' : 'ltr';
  }

  globalThis.lossmolDirection = { judge };
})();
