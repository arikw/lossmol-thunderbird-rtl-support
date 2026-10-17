# Store listing (addons.thunderbird.net)

Texts for the add-on's page. The name comes from the manifest.

## Summary (English, ≤ 250 characters)

RTL support for Thunderbird: Hebrew, Arabic and other right-to-left text in
the right direction. RTL mail that arrived left-aligned is fixed
automatically as you read, and each paragraph you write takes its direction
(RTL or LTR) from its words.

## Summary (Hebrew)

תמיכת RTL ל‑Thunderbird: עברית, ערבית ושאר שפות ימין־לשמאל בכיוון הנכון.
דואר RTL שהגיע מיושר לשמאל מתוקן אוטומטית בזמן הקריאה, ובכתיבה כל פסקה
מקבלת את כיוונה (RTL או LTR) לפי המילים שבה.

## Description (English)

Right-to-left (RTL) support for Thunderbird, for mail you receive and mail
you write, in Hebrew, Arabic and the other RTL scripts, with left-to-right
(LTR) text in the same message left alone.

**Reading: fixed automatically.** RTL messages whose Hebrew or Arabic
arrived left-aligned, a common result of Outlook and web forms, are shown
right to left the moment you open them, paragraph by paragraph, with nothing
to click: a mixed RTL/LTR message comes out right in both directions.
Plain-text messages too. A message written with direction in mind is left as
its author set it. The Lossmol button in the message header shows whether
anything was re-aligned and switches the message you're reading back to the
way it arrived; right-click it for the setting itself.

**Writing.** Each paragraph takes its direction from its words as you type:
mostly Hebrew (or Arabic), RTL; an English paragraph in the same message
stays LTR. The direction is written into the message, so
recipients see it the same way.

To set it by hand: **Ctrl + right Shift** makes the current paragraph RTL
and **Ctrl + left Shift** LTR, as in Word and Windows. The
Lossmol button in the formatting toolbar switches the paragraph the cursor is
in and shows its current direction; the editor's right-click menu has
"Lossmol" with the paragraph and whole-message commands. A paragraph you set
by hand stays as you set it.

A setting chooses the direction a new message starts in.

**Sending.** Thunderbird's "Automatic" sending format would drop paragraph
directions by sending plain text; Lossmol sends such messages as HTML with a
plain-text copy.

Works with Thunderbird 128 and later. No data is collected or sent anywhere.
Settings and text in English, Hebrew and Arabic. Free software (MIT licence);
source and issues at https://github.com/arikw/lossmol-thunderbird-rtl-support.

## Description (Hebrew)

תמיכת ימין־לשמאל (RTL) ל‑Thunderbird, לדואר שמקבלים ולדואר שכותבים, בעברית,
בערבית ובשאר שפות ה‑RTL, כשטקסט משמאל לימין (LTR) באותה הודעה נשאר במקומו.

**קריאה: תיקון אוטומטי.** הודעות RTL שהעברית או הערבית שבהן הגיעו מיושרות
לשמאל, תוצאה נפוצה של Outlook ושל טפסים באינטרנט, מוצגות מימין לשמאל ברגע
שפותחים אותן, פסקה־פסקה, בלי ללחוץ על כלום: הודעה מעורבת RTL/LTR יוצאת
נכון בשני הכיוונים. גם הודעות בטקסט פשוט. הודעה שנכתבה עם מחשבה על כיוון
נשארת כפי שכותבה קבע. כפתור Lossmol בכותרת ההודעה מראה אם משהו יושר מחדש
ומחזיר את ההודעה הנוכחית לצורה שבה הגיעה; קליק ימני עליו מגיע להגדרה עצמה.

**כתיבה.** כל פסקה מקבלת את כיוונה לפי המילים שבה תוך כדי הקלדה: רוב עברית
(או ערבית), RTL; פסקה באנגלית באותה הודעה נשארת LTR. הכיוון
נכתב לתוך ההודעה, כך שהנמענים רואים אותה כך.

ידנית: **Ctrl + Shift ימני** הופך את הפסקה הנוכחית למימין לשמאל ו‑**Ctrl +
Shift שמאלי** למשמאל לימין, כמו ב‑Word וב‑Windows. כפתור Lossmol בסרגל
העיצוב מחליף את כיוון הפסקה שהסמן בה ומראה את כיוונה הנוכחי; בתפריט הקליק
הימני של העורך יש "Lossmol" עם הפעולות לפסקה ולכל ההודעה. פסקה שנקבעה ידנית
נשארת כפי שנקבעה.

הגדרה קובעת באיזה כיוון הודעה חדשה מתחילה.

**שליחה.** מצב השליחה "אוטומטי" של Thunderbird היה מוחק את כיווני הפסקאות
בשליחה כטקסט פשוט; Lossmol שולח הודעות כאלה כ‑HTML עם עותק בטקסט פשוט.

עובד עם Thunderbird 128 ומעלה. לא נאסף ולא נשלח שום מידע. הגדרות וטקסטים
באנגלית, בעברית ובערבית. תוכנה חופשית (רישיון MIT); קוד ודיווחים ב‑
https://github.com/arikw/lossmol-thunderbird-rtl-support.

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
