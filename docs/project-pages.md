# Project documentation Pages

## Scope

Each of the 16 maintained repositories publishes a small English documentation portal through GitHub Pages. The two archived repositories remain unchanged. These portals link to the central MoodlIA website and the repository README; they do not run the application, replace an extension store, publish npm packages or deploy moodlia.com.

## Published locations

| Project | Pages | Source |
| --- | --- | --- |
| Moodle Core CLI | [Open project page](https://gafapa.github.io/moodle-core-cli/) | [Repository](https://github.com/gafapa/moodle-core-cli) |
| MoodlIA Analyzer Desktop | [Open project page](https://gafapa.github.io/moodlia-analyzer-desktop/) | [Repository](https://github.com/gafapa/moodlia-analyzer-desktop) |
| MoodlIA Analyzer Web | [Open project page](https://gafapa.github.io/moodlia-analyzer-web/) | [Repository](https://github.com/gafapa/moodlia-analyzer-web) |
| MoodlIA Backup Converter | [Open project page](https://gafapa.github.io/moodlia-backup-converter/) | [Repository](https://github.com/gafapa/moodlia-backup-converter) |
| MoodlIA CLI | [Open project page](https://gafapa.github.io/moodlia-cli/) | [Repository](https://github.com/gafapa/moodlia-cli) |
| MoodlIA Corrector | [Open project page](https://gafapa.github.io/moodlia-corrector/) | [Repository](https://github.com/gafapa/moodlia-corrector) |
| MoodlIA edX Converter | [Open project page](https://gafapa.github.io/moodlia-edx/) | [Repository](https://github.com/gafapa/moodlia-edx) |
| MoodlIA Moodle Plugin | [Open project page](https://gafapa.github.io/moodle-local_moodlia/) | [Repository](https://github.com/gafapa/moodle-local_moodlia) |
| MoodlIA Portable | [Open project page](https://gafapa.github.io/moodlia-portable/) | [Repository](https://github.com/gafapa/moodlia-portable) |
| MoodlIA Rubrics | [Open project page](https://gafapa.github.io/moodlia-rubrics/) | [Repository](https://github.com/gafapa/moodlia-rubrics) |
| MoodlIA Skills | [Open project page](https://gafapa.github.io/moodlia-skills/) | [Repository](https://github.com/gafapa/moodlia-skills) |
| MoodlIA Studio | [Open project page](https://gafapa.github.io/moodlia-studio/) | [Repository](https://github.com/gafapa/moodlia-studio) |
| MoodlIA Sync | [Open project page](https://gafapa.github.io/moodlia-sync/) | [Repository](https://github.com/gafapa/moodlia-sync) |
| MoodlIA Teacher Dashboard | [Open project page](https://gafapa.github.io/moodlia-teacher-dashboard/) | [Repository](https://github.com/gafapa/moodlia-teacher-dashboard) |
| MoodlIA Test Lab | [Open project page](https://gafapa.github.io/moodlia-test-lab/) | [Repository](https://github.com/gafapa/moodlia-test-lab) |
| MoodlIA Website | [Open project page](https://gafapa.github.io/moodlia/) | [Repository](https://github.com/gafapa/moodlia) |

## Source ownership

The canonical portal generator and visual assets are maintained in the website repository and mirrored into each project so deployments remain independent. Keep copies aligned when changing the shared template. Project status and title come from that repository's README. Purpose, first steps, optional command and related-project links are in `docs/project-page.json`. Fonts are served locally with their source and license notice.

Build with Python 3.9 or later:

```sh
python tools/build-project-page.py
```

The output is `.project-pages/`, excluded from Git. `.github/workflows/pages.yml` builds and uploads that directory using the GitHub Pages environment and OIDC; it needs no Moodle, AI, deployment-server or publisher credentials. Repository Pages must be enabled with the GitHub Actions build type. Workflow triggers cover the README, metadata, assets, generator and workflow itself.

## Reading and accessibility

The portals use the existing white, ink, mint and Roundo brand, with explicit status and practical first steps. Navigation, documentation links and the project directory work without JavaScript. Optional search filters only the local project list; it does not contact an external service or persist a query. Content remains readable with reduced motion. Canonical addresses point to each repository's own Pages URL. All central website and extension-policy links retain their established HTTPS addresses.

## Validation boundaries

Local validation passed 48 project/viewport combinations (16 pages at three widths), including search states and no-JavaScript fallback. Website checks and static export also passed. Local validation checks all 16 pages at desktop, tablet and phone sizes, heading wrapping, overflow, font loading, browser errors, search states and central links. A no-JavaScript check retains navigation and the concept-only Studio status. Public HTTP and deployed-content verification is recorded after publication. No synthetic page check proves Moodle runtime compatibility.
