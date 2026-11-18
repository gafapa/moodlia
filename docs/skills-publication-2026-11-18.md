# Skills page publication - 18 November 2026

Published the updated English and Spanish MoodlIA Skills page to `https://moodlia.com`. It now lists both maintained skills: `design-portable-moodle-content` for content authoring and `operate-moodle-with-moodlia` for safe Moodle operations through the MoodlIA MCP tools or CLI, with installation, first use, requirements (plugin 0.1.224 or later, CLI 0.5.3) and limits. The rendered-site test that required the page to omit the operations skill now requires both skills in both languages.

`npm test` passed all 16 rendered-site tests. The export was built in a clean worktree: the primary checkout's CRLF working files and stale inlined font cache produced unrelated differences, so it was not used. Compared with the live site, only the skills, apps and install pages changed in both languages; all 27 binary assets were identical, the export contained no links, and the secret-marker scan found nothing.

The static-sites content workflow created `/opt/docker/backups/static-sites/moodlia.com-20261118T233310Z.tar.gz` and reported `container_recreated=false`. The local canonical copy in the management workspace was replaced with the same export.

`node tools/verify-publication.mjs https://moodlia.com/` verified all 158 public files byte for byte and ten clean HTTPS routes. The HTTP redirect probe timed out, as in earlier publications; HTTPS was verified directly. The tracked `.taste-skill/deployment/publication.json` contains the file digests and verification timestamp.
