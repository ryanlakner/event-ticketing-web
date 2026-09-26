# Roadmap

Next steps for the web app. Use it the same way as the [API roadmap](https://github.com/ryanlakner/event-ticketing-api/blob/main/ROADMAP.md): pick the first unchecked item, open a pull request with the commit type shown, and tick the box in that same PR.

Sizes: **S** is an evening, **M** is a few sessions, and **L** is worth splitting into several PRs.

---

## ✅ Phase 0 — Foundation (done)

- [x] React 19, TypeScript 6 (strict), and Vite 8, with a proxy to the local API
- [x] ESLint with Airbnb rules, Prettier, Husky, lint-staged, and commitlint
- [x] API types generated from the API's OpenAPI contract, with a CI check that they're current
- [x] Entra ID sign-in with MSAL (loaded only when configured), plus a local dev-token mode
- [x] Browse, reserve with a hold countdown, confirm and cancel, my tickets, my events, create event
- [x] Vitest, React Testing Library, and MSW tests; a GitHub Actions CI workflow
- [x] Visual design: Tailwind CSS v4, a gradient hero, event cards with date blocks and availability bars, a ticket-style reservation with a hold progress bar, an organizer dashboard, light and dark themes, and loading skeletons and empty states

---

## Phase 1 — Ship it

- [ ] **Deploy to Azure Static Web Apps** · `ci` · M
  - _Done when:_
    - [ ] Terraform creates a Static Web App for each environment. The deploy identity signs in with OIDC, using a federated credential for this repo added to the API's bootstrap.
    - [ ] The deploy workflow builds with that environment's `VITE_*` settings and deploys. It fetches the deployment token at run time, so no secret is stored.
    - [ ] The site's origin is added to the API bootstrap's `web_origins`, which covers sign-in redirects and CORS.
    - [ ] Like the API, the workflow is skipped until the environment is configured.

- [ ] **SPA fallback and security headers** · `feat` · S
  - _Done when:_ `staticwebapp.config.json` rewrites unknown paths to `index.html` and sets a Content Security Policy. The policy allows the API origin and `login.microsoftonline.com`, sets `frame-ancestors 'none'`, and turns on HSTS. The theme script in `index.html` is inline, so the policy needs its hash.

- [ ] **Automated releases** · `ci` · S
  - _Done when:_ release-please turns Conventional Commits into version bumps, `CHANGELOG.md` entries, and GitHub Releases.

## Phase 2 — Confidence

- [ ] **End-to-end tests with Playwright** · `test` · L
  - _Done when:_
    - [ ] A workflow starts SQL Server and the API (from its repo) in containers, runs this app against them, and signs in with `dotnet user-jwts` tokens.
    - [ ] It drives the full journey: create → publish → reserve → confirm.
    - [ ] Traces and screenshots are uploaded when a test fails.

- [ ] **Automated accessibility checks** · `test` · S
  - _Done when:_ every page test also runs `axe` (via `vitest-axe`) and fails on violations.

- [ ] **Coverage threshold** · `ci` · S
  - _Done when:_ Vitest collects coverage in CI, fails below an agreed threshold, and shows a README badge.

- [ ] **Dependency updates** · `ci` · S
  - _Done when:_ Dependabot opens grouped weekly PRs for npm and GitHub Actions, with Conventional Commit titles.

## Phase 3 — Product polish

- [ ] **Edit events** · `feat(events)` · S
  - _Done when:_ organizers can edit a draft or published event (`PUT /api/events/{id}`). Capacity errors from the API show on the field.

- [ ] **Pagination and filters** · `feat(events)` · S
  - _Done when:_ the events list and both "my" lists page through results using the API's `page`/`totalPages`, and the "my" lists filter by status.

- [ ] **Confirm before destructive actions** · `feat` · S
  - _Done when:_ cancelling an event or a reservation asks for confirmation in an accessible dialog. Cancelling an event says how many reservations it will cancel.

- [x] **Toast confirmations** · `feat` · S
  - _Done:_ publishing, cancelling, creating, reserving, and confirming show a brief toast, and failed list actions show the problem detail in an error toast. Toasts live in always-present polite and assertive live regions, so screen readers announce them. Form and page errors stay inline, next to what they're about.

- [x] **Theme switcher** · `feat` · S
  - _Done:_ a header button cycles system → light → dark. The choice is saved in `localStorage`, "system" keeps following OS changes, and an inline script in `index.html` applies the theme before first paint, so there's no flash.

- [ ] **Start time required by the API itself** · `fix` (event-ticketing-api) · S
  - _Why:_ an empty start time fails JSON binding before validation, so the API answers with a technical `$.startsAt` message. The form now catches it first.
  - _Done when:_ `EventRequest.StartsAt` is nullable and FluentValidation reports "'Starts At' must not be empty."

- [ ] **Route-level code splitting** · `perf` · S
  - _Done when:_ organizer pages load lazily, so customers never download them, and the build reports the chunk sizes.

## Housekeeping to watch

- [ ] Move to **ESLint 10** once `eslint-config-airbnb-extended` supports it.
- [ ] Move to **TypeScript 7** once `typescript-eslint` supports it, and drop the `openapi-typescript` override once it supports TypeScript 6+.
