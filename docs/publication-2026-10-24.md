# Website publication, 24 October 2026

Published the static export of source commit `fd5401c` to
<https://moodlia.com/> using the managed server publisher. The update includes
the plugin 0.1.221 release, teacher access documentation, Portable version and
optional Onetopic selection, and the Corrector 0.1.71 download.

`node tools/verify-publication.mjs` verified all 163 exported public files byte
for byte and all ten clean HTTPS routes. This includes the permanent extension
privacy documents. Machine-readable hashes are recorded in
`.taste-skill/deployment/publication.json`. The local HTTP redirect probe timed
out; HTTPS publication verification passed independently.

Before publication, the previous server content was archived, gzip-tested and
SHA256-verified at `/opt/docker/backups/moodlia-website-20261024/site-before.tar.gz`.
Its SHA256 is `6d656e126cb91740a40a665e1cfdaa249c992eea81b5c96249d60e482dec235b`.
The publisher passed the Nginx configuration test and reloaded the existing
container. The previous local staging directory was also retained.

Website publication does not establish Moodle Marketplace approval, Chrome Web
Store approval, or native installer qualification.
