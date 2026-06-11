# Dibur — Legal pages

Public, static hosting for the **Privacy Policy** and **Terms of Service** of the
Dibur (CauseQuest) kids' app, served via GitHub Pages. This is the canonical URL
used for App Store / Play Store submissions.

- **Privacy Policy:** [`/privacy.html`](privacy.html)
- **Terms of Service:** [`/terms.html`](terms.html)

Both pages are bilingual (Hebrew + English) with an in-page language toggle.

## Source of truth

The text is **generated** from the app's in-repo content
(`packages/client/src/components/legal/legalContent.ts` in the private `dibur`
repo) so the published pages never drift from the in-app version.

To regenerate after the source changes (run with the private `dibur` repo
checked out as a sibling directory):

```bash
npx tsx generate.mjs
git commit -am "chore: regenerate legal pages" && git push
```

The on-page "DRAFT — subject to legal review" banner that appears inside the app
is intentionally **omitted** from these public pages.

> ⚠️ The content is a substantive draft, not yet reviewed by a lawyer
> (tracked as issue #49 in the app repo). Get legal sign-off before commercial /
> EU launch.
