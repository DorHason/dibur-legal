// Generates the static legal site (privacy.html, terms.html, support.html,
// index.html) from the app's source-of-truth legal content. Run with:
//   npx tsx generate.mjs
//
// Privacy + Terms text is imported from the real legalContent.ts in the
// (private) dibur app repo, so the published pages never drift from the in-app
// version. Override the source path with LEGAL_SRC=/path/to/legalContent.ts
// (used when building from a git worktree). The Support page content lives
// here (it has no in-app equivalent). The in-app "DRAFT" banner is omitted.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC =
  process.env.LEGAL_SRC ||
  resolve(here, '../dibur/packages/client/src/components/legal/legalContent.ts');

const { privacyHe, privacyEn, termsHe, termsEn, LEGAL_VERSION } = await import(
  SRC
);

const PRIVACY_URL = 'https://dorhason.github.io/dibur-legal/privacy.html';
const SUPPORT_EMAIL = 'dor362@gmail.com';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Make bare URLs and email addresses clickable (after escaping).
const linkify = (s) =>
  esc(s)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(
      /(^|[\s(])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
      '$1<a href="mailto:$2">$2</a>',
    );

// ── Support page content (bilingual; no in-app source) ──────────
const supportHe = {
  title: 'תמיכה',
  lastUpdatedLabel: 'עודכן לאחרונה',
  intro:
    'דיבור היא אפליקציה לתרגול דיבור בעברית לילדים, בשימוש הורי ובליווי קלינאי/ת תקשורת.',
  back: '→ חזרה',
  sections: [
    {
      heading: 'צריכים עזרה?',
      paragraphs: [`שלחו לנו מייל ונחזור אליכם: ${SUPPORT_EMAIL}`],
    },
    {
      heading: 'איך מתחברים?',
      paragraphs: [
        'ההורה נרשם עם אימייל וסיסמה (או דרך Google / Apple). קלינאי/ת התקשורת שולח/ת קישור הזמנה להורה, ובו ההורה בוחר/ת סיסמה ומאשר/ת את ההסכמות.',
      ],
    },
    {
      heading: 'איך מוחקים את החשבון?',
      paragraphs: [
        'בתוך האפליקציה: מסך הדמות → "⚙ אזור הורים" → פתרון תרגיל (שער הורים) → "מחיקת חשבון". הפעולה מוחקת לצמיתות את החשבון, הפרופילים וכל הנתונים, כולל הקלטות.',
      ],
    },
    {
      heading: 'איך מבטלים הסכמה להקלטה?',
      paragraphs: ['באותו "אזור הורים" → "ביטול הסכמה להקלטה". אפשר לחדש בכל עת.'],
    },
    {
      heading: 'שכחתי סיסמה',
      paragraphs: [
        'במסך הכניסה לוחצים "שכחתם סיסמה?" ומקבלים קישור לאיפוס במייל.',
      ],
    },
    {
      heading: 'פרטיות',
      paragraphs: [`מדיניות הפרטיות: ${PRIVACY_URL}`],
    },
  ],
};

const supportEn = {
  title: 'Support',
  lastUpdatedLabel: 'Last updated',
  intro:
    'Dibur is a Hebrew speech-practice app for children, used by parents alongside a speech-language clinician.',
  back: '← Back',
  sections: [
    {
      heading: 'Need help?',
      paragraphs: [`Email us and we'll get back to you: ${SUPPORT_EMAIL}`],
    },
    {
      heading: 'Signing in',
      paragraphs: [
        'Parents sign in with email + password (or Google / Apple). Parents are invited by their speech clinician via a link.',
      ],
    },
    {
      heading: 'Delete account',
      paragraphs: [
        'In-app: avatar screen → "⚙ Parent Area" → solve the parental gate → "Delete account". This permanently deletes the account, all profiles, and all data, including recordings.',
      ],
    },
    {
      heading: 'Revoke recording consent',
      paragraphs: ['In the same Parent Area; you can re-enable it anytime.'],
    },
    {
      heading: 'Forgot password',
      paragraphs: [
        'Tap "Forgot password?" on the sign-in screen to get a reset link by email.',
      ],
    },
    {
      heading: 'Privacy',
      paragraphs: [`Privacy Policy: ${PRIVACY_URL}`],
    },
  ],
};

function renderDoc(doc, lang) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const sections = doc.sections
    .map(
      (s) =>
        `      <section>\n        <h2>${esc(s.heading)}</h2>\n` +
        s.paragraphs.map((p) => `        <p>${linkify(p)}</p>`).join('\n') +
        `\n      </section>`,
    )
    .join('\n');
  return `    <article class="doc" data-lang="${lang}" dir="${dir}" lang="${lang}">
      <h1>${esc(doc.title)}</h1>
      <p class="updated">${esc(doc.lastUpdatedLabel)}: ${esc(LEGAL_VERSION)}</p>
      <p class="intro">${linkify(doc.intro)}</p>
${sections}
    </article>`;
}

const DOCS = {
  terms: { he: 'תנאי שימוש', en: 'Terms of Service' },
  privacy: { he: 'מדיניות פרטיות', en: 'Privacy Policy' },
  support: { he: 'תמיכה', en: 'Support' },
};

function nav(currentSlug) {
  return Object.entries(DOCS)
    .map(([slug, label]) => {
      const current = slug === currentSlug;
      const cls = current ? 'navlink active' : 'navlink';
      const aria = current ? ' aria-current="page"' : '';
      return `      <a class="${cls}" href="${slug}.html"${aria}><span data-t="he">${esc(label.he)}</span><span data-t="en" hidden>${esc(label.en)}</span></a>`;
    })
    .join('\n');
}

function page(slug, he, en) {
  return `<!doctype html>
<html lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <title>${esc(he.title)} · Dibur</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="bar">
    <a class="brand" href="index.html">Dibur · דיבור</a>
    <div class="controls">
${nav(slug)}
      <button id="lang" class="toggle" type="button">English</button>
    </div>
  </header>
  <main>
${renderDoc(he, 'he')}
${renderDoc(en, 'en')}
  </main>
  <footer>
    <p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
  </footer>
  <script>
    (function () {
      var btn = document.getElementById('lang');
      function apply(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('.doc').forEach(function (d) {
          d.hidden = d.getAttribute('data-lang') !== lang;
        });
        document.querySelectorAll('[data-t]').forEach(function (e) {
          e.hidden = e.getAttribute('data-t') !== lang;
        });
        btn.textContent = lang === 'he' ? 'English' : 'עברית';
        try { localStorage.setItem('dibur-legal-lang', lang); } catch (e) {}
      }
      var saved;
      try { saved = localStorage.getItem('dibur-legal-lang'); } catch (e) {}
      var initial = saved || 'he';
      apply(initial);
      btn.addEventListener('click', function () {
        apply(document.documentElement.lang === 'he' ? 'en' : 'he');
      });
    })();
  </script>
</body>
</html>
`;
}

const index = `<!doctype html>
<html lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dibur · דיבור — Legal &amp; Support</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="bar"><span class="brand">Dibur · דיבור</span></header>
  <main class="index">
    <h1>Legal &amp; Support</h1>
    <ul class="links">
      <li><a href="terms.html">Terms of Service · תנאי שימוש</a></li>
      <li><a href="privacy.html">Privacy Policy · מדיניות פרטיות</a></li>
      <li><a href="support.html">Support · תמיכה</a></li>
    </ul>
  </main>
  <footer><p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></footer>
</body>
</html>
`;

writeFileSync(resolve(here, 'privacy.html'), page('privacy', privacyHe, privacyEn));
writeFileSync(resolve(here, 'terms.html'), page('terms', termsHe, termsEn));
writeFileSync(resolve(here, 'support.html'), page('support', supportHe, supportEn));
writeFileSync(resolve(here, 'index.html'), index);
console.log('Generated index/privacy/terms/support.html from', SRC);
