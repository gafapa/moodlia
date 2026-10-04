# Product

## Platform

web

## Users

Everyone who arrives at MoodlIA from Moodle: teachers looking for a tool that
saves them time, Moodle administrators deciding whether to install the plugin,
and developers automating Moodle or connecting AI agents to it. Some apps need
technical knowledge; the site says so plainly instead of hiding it.

## Product Purpose

moodlia.com explains what MoodlIA is, what each app does, and how to install it.
A visitor should be able to answer three questions within a minute: which app
solves my task, what do I need to know to install it, and where are the steps.

## Structure

- Home: one-sentence explanation, apps grouped by what you need to know, a
  task finder ("What do you want to do?"), how the pieces fit, and FAQ.
- Apps (`/apps`, `/es/apps`): every app as a card.
- App page (`/apps/<slug>`): what it does, what you need, installation steps
  with exact commands, first use, limitations, documentation links, version,
  license, and source.
- Install (`/install`, `/es/instalar`): every app's installation, grouped by
  where it runs, linking to the full steps.
- How it works (`/how-it-works`, `/es/como-funciona`): standard web services
  versus the MoodlIA plugin, which app uses which, the npm package chain, and
  shared safety rules.
- Legal notice, privacy, and cookies.

Routes of the previous site (`/start`, `/ways/*`, `/products/*`) redirect to
their new equivalents.

## Content Rules

- Every product fact lives in `app/content.ts`, in English and Spanish. Keep
  versions, requirements, and steps in step with each repository's README and
  update them when a release is published.
- Only apps that someone can install today are listed. MoodlIA Corrector,
  Analyzer Desktop, and Studio are not shown until they have a public release.
- Installation steps are real: store and registry links, Moodle menu paths
  (verified against Moodle's Spanish language pack for `/es`), and commands.
- Say what knowledge an app requires: anyone with a browser, a little
  technical help, or Moodle administrators and developers.
- Never fabricate testimonials, usage numbers, or logos.
- MoodlIA is independent and not affiliated with Moodle HQ; say so where it
  matters.
- The contact address is `contact@moodlia.com`.

## Accessibility & Inclusion

Semantic landmarks, one `h1` per page, visible keyboard focus, a skip link,
reduced-motion support, dark mode, and no horizontal scrolling at 390 px.
English and Spanish pages are complete equivalents with hreflang alternates.
