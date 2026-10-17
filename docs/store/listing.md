# Store listing (addons.thunderbird.net)

Texts for the add-on's page. The name comes from the manifest.

## Summary (English, ≤ 250 characters)

Ensures mail containing RTL text, such as Hebrew or Arabic, is shown
correctly paragraph by paragraph according to dominant language. In
addition, lets you compose mail with automatic paragraph direction applied
as you write.

## Summary (Hebrew)

מציג הודעות עם כיווניות נכונה לכל פסקה לפי שפתה השלטת, כך שטקסט בשפות RTL,
כמו עברית וערבית, מוצג כראוי. כמו כן, מאפשר לכתוב הודעות עם כיוון פסקאות
אוטומטי שנקבע לפי השפה השלטת תוך כדי הקלדה.

## Description (English)

Right-to-left (RTL) support for Thunderbird, for reading and for writing: mail
containing RTL text, in languages such as Hebrew or Arabic, is shown correctly
paragraph by paragraph, leaving left-to-right (LTR) text in the same message
as it is.

<b>Reading.</b> Lossmol takes care of the correct display of paragraphs
according to the dominant language of each paragraph. A message with RTL text
that was sent left-aligned, as Outlook and many web forms do, is shown right
to left paragraph by paragraph the moment you open it, and an English
paragraph in it stays left to right. Plain-text messages too. Nothing in the
message itself is changed, and a message whose author set a direction
deliberately is shown as its author set it. The Lossmol button in the message
header shows whether the display was adjusted and switches the message you are
reading back to the way it arrived; right-click it for the setting itself.

<b>Writing.</b> Compose mail with automatic paragraph direction: each
paragraph takes its direction from its dominant language as you type, so a
Hebrew paragraph is RTL and an English paragraph in the same message is LTR.
The direction is written into the message, so recipients see it the same way.

To set it by hand: <b>Ctrl + right Shift</b> makes the current paragraph RTL
and <b>Ctrl + left Shift</b> LTR, as in Word and Windows. The Lossmol button
in the formatting toolbar switches the paragraph the cursor is in and shows
its current direction; the editor's right-click menu has "Lossmol" with the
paragraph and whole-message commands. A paragraph you set by hand stays as you
set it.

A setting chooses the direction a new message starts in.

<b>Sending.</b> Thunderbird's "Automatic" sending format would drop paragraph
directions by sending plain text; Lossmol sends such messages as HTML with a
plain-text copy.

Works with Thunderbird 128 and later. No data is collected or sent anywhere.
Settings and text in English, Hebrew and Arabic. Free software (MIT licence);
source and issues at <a href="https://github.com/arikw/lossmol-thunderbird-
rtl-support">github.com/arikw/lossmol-thunderbird-rtl-support</a>.

## Description (Hebrew)

תמיכה בכיווניות מימין לשמאל (RTL) ב־Thunderbird, לקריאה ולכתיבה: הודעות עם
טקסט ב־RTL, בשפות כגון עברית או ערבית, מוצגות כראוי פסקה אחר פסקה, בעוד טקסט
משמאל לימין (LTR) באותה הודעה נשאר כפי שהוא.

<b>קריאה.</b> Lossmol דואג להצגה נכונה של פסקאות לפי השפה השלטת בכל פסקה.
הודעה הכוללת טקסט ב־RTL שנשלחה ביישור לשמאל, כפי שעושים Outlook וטפסים רבים
ברשת, מוצגת מימין לשמאל בכל פסקה מיד עם פתיחתה, ופסקה באנגלית בתוכה נשארת
משמאל לימין. כך גם בהודעות טקסט פשוט. שום דבר בהודעה עצמה אינו משתנה, והודעה
שכותביה קבעו בה כיווניות במכוון מוצגת בדיוק כפי שנקבעה. כפתור Lossmol בכותרת
ההודעה מציג אם התצוגה הותאמה ומאפשר להחזיר את ההודעה שאתם קוראים לאופן שבו
הגיעה; לחיצה ימנית עליו פותחת את ההגדרה עצמה.

<b>כתיבה.</b> חיבור הודעות עם כיווניות פסקאות אוטומטית: כל פסקה מקבלת את
כיוונה לפי השפה השלטת בה תוך כדי הקלדה, כך שפסקה בעברית היא ב־RTL ופסקה
באנגלית באותה הודעה היא ב־LTR. הכיווניות נשמרת בגוף ההודעה, כך שגם הנמענים
רואים אותה באותו אופן.

להגדרה ידנית: <b>Ctrl + Shift ימני</b> קובע את הפסקה הנוכחית כ־RTL ו־<b>Ctrl +
Shift שמאלי</b> כ־LTR, בדומה ל־Word ול־Windows. כפתור Lossmol בסרגל העיצוב
משנה את כיוון הפסקה שבה נמצא הסמן ומציג את כיוונה הנוכחי; תפריט הלחצן הימני
בעורך כולל תפריט "Lossmol" עם פקודות לפסקה ולהודעה כולה. פסקה שהוגדרה ידנית
נשארת כפי שהוגדרה.

הגדרה ייעודית מאפשרת לבחור באיזה כיוון תיפתח הודעה חדשה.

<b>שליחה.</b> מצב השליחה ה"אוטומטי" של Thunderbird עלול להשמיט את כיווניות
הפסקאות עקב שליחה בטקסט פשוט; Lossmol שולח הודעות כאלה כ־HTML בצירוף עותק טקסט
פשוט.

נתמך ב־Thunderbird 128 ואילך. שום מידע אינו נאסף או נשלח לשום מקום. הגדרות
וממשק באנגלית, עברית וערבית. תוכנה חופשית (רישיון MIT); קוד מקור ודיווח על
תקלות בכתובת <a href="https://github.com/arikw/lossmol-thunderbird-rtl-
support">github.com/arikw/lossmol-thunderbird-rtl-support</a>.

## Screenshot captions

- Reading image: The same message without Lossmol and with Lossmol: each paragraph is shown according to its dominant language, Hebrew right to left and English left to right.
- Writing image: Each paragraph takes its direction from its dominant language as you type. The toolbar button shows the current paragraph's direction; Ctrl + right/left Shift set it by hand.

Hebrew:

- Reading image: אותה הודעה ללא Lossmol ועם Lossmol: כל פסקה מוצגת לפי השפה השלטת בה, עברית מימין לשמאל ואנגלית משמאל לימין.
- Writing image: בזמן ההקלדה, כיוון כל פסקה נקבע לפי השפה השלטת בה. כפתור Lossmol בסרגל הכלים מציג את כיוון הפסקה הנוכחית, וצירוף Ctrl עם Shift ימני או שמאלי קובע אותו ידנית.

## Other fields

- Categories: Language Support; Message Composition; Message and News Reading.
- Tags: rtl, ltr, right-to-left, hebrew, arabic, bidi, direction, compose.
- Licence: MIT.
- Homepage and support site: the GitHub repository (issues).
- Privacy policy: none needed (no data collected; the manifest declares it).

## Images

Made from the HTML pages here (serve the project folder over HTTP, open the
page in a browser at 1280×800 and capture the viewport):

- `icon-128.png` ← `icon.html`: the add-on icon for the store (it scales it
  to 64×64).
- `reading-before-after.png` ← `illustration.html`: `sample.html` twice, as
  it arrived and with Lossmol's reading scripts.
- `writing.png` ← `writing.html`: a message with each paragraph on its own
  side, the toolbar button and the shortcuts.

The rest come from a real Thunderbird window, 1280×800 or larger:

1. Compose window: a Hebrew paragraph, an English paragraph under it, each
   on its own side, the Lossmol button visible in the formatting toolbar.
2. Compose window: the editor's right-click menu open on "Lossmol".
3. Message pane: a received message after re-alignment, the Lossmol button
   in the header (hover for the tooltip, if the capture tool keeps it).
4. The settings page.
