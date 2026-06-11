// Generates the static legal site (privacy.html, terms.html, index.html)
// from the app's source-of-truth legal content. Run with:
//   npx tsx generate.mjs
//
// It imports the real legalContent.ts from the (private) dibur app repo,
// so the published pages never drift from the in-app version. The on-page
// "DRAFT" banner is intentionally omitted here (public App Store URL).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(
  here,
  '../dibur/packages/client/src/components/legal/legalContent.ts',
);

const { privacyHe, privacyEn, termsHe, termsEn, LEGAL_VERSION } = await import(
  SRC
);

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function renderDoc(doc, lang) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const sections = doc.sections
    .map(
      (s) =>
        `      <section>\n        <h2>${esc(s.heading)}</h2>\n` +
        s.paragraphs.map((p) => `        <p>${esc(p)}</p>`).join('\n') +
        `\n      </section>`,
    )
    .join('\n');
  return `    <article class="doc" data-lang="${lang}" dir="${dir}" lang="${lang}">
      <h1>${esc(doc.title)}</h1>
      <p class="updated">${esc(doc.lastUpdatedLabel)}: ${esc(LEGAL_VERSION)}</p>
      <p class="intro">${esc(doc.intro)}</p>
${sections}
    </article>`;
}

function page(slug, otherSlug, otherLabelHe, otherLabelEn, he, en) {
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
      <a class="navlink" href="${otherSlug}.html"><span data-t="he">${esc(otherLabelHe)}</span><span data-t="en" hidden>${esc(otherLabelEn)}</span></a>
      <button id="lang" class="toggle" type="button">English</button>
    </div>
  </header>
  <main>
${renderDoc(he, 'he')}
${renderDoc(en, 'en')}
  </main>
  <footer>
    <p>privacy@causequest.app</p>
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
      var initial = saved || ((navigator.language || 'he').slice(0, 2) === 'he' ? 'he' : 'en');
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
  <title>Dibur · דיבור — Legal</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="bar"><span class="brand">Dibur · דיבור</span></header>
  <main class="index">
    <h1>Legal</h1>
    <ul class="links">
      <li><a href="privacy.html">Privacy Policy · מדיניות פרטיות</a></li>
      <li><a href="terms.html">Terms of Service · תנאי שימוש</a></li>
    </ul>
  </main>
  <footer><p>privacy@causequest.app</p></footer>
</body>
</html>
`;

writeFileSync(
  resolve(here, 'privacy.html'),
  page('privacy', 'terms', 'תנאי שימוש', 'Terms of Service', privacyHe, privacyEn),
);
writeFileSync(
  resolve(here, 'terms.html'),
  page('terms', 'privacy', 'מדיניות פרטיות', 'Privacy Policy', termsHe, termsEn),
);
writeFileSync(resolve(here, 'index.html'), index);
console.log('Generated index.html, privacy.html, terms.html from', SRC);
