# User management release references - 28 October 2026

Published updated English and Spanish product references for Moodle plugin 0.1.222 and CLI 0.5.2 to `https://moodlia.com`. The release descriptions include user management, 252 operations, and the new versioned GitHub download. Marketplace remains a separate distribution channel whose listed version must be checked. CLI npm publication is tracked separately from its GitHub release.

`npm test` passed all 16 rendered-site tests. Static export preserved the existing extension privacy policy bytes and permanent URLs, including the Corrector policy updated earlier on 28 October. The managed publisher backed up the previous site, passed the Nginx configuration check, and retained the existing container. Local staging was copied to a timestamped recovery directory before replacement.

`node tools/verify-publication.mjs https://moodlia.com/` verified all 163 public files byte for byte and ten clean HTTPS routes. The HTTP redirect probe timed out; HTTPS was verified directly. The tracked `.taste-skill/deployment/publication.json` contains the file digests and verification timestamp.
