# Course item backup release references - 14 November 2026

Published updated English and Spanish product references for Moodle plugin 0.1.224 and CLI 0.5.3 to `https://moodlia.com`. The plugin description now lists 255 operations, including single activity and section backups, and the installation step points at `local_moodlia-0.1.224.zip`. The CLI links to its 0.5.3 release. Plugin 0.1.224 is also Moodle Marketplace version 30743, and CLI 0.5.3 is the npm `latest` version.

`npm test` passed all 16 rendered-site tests. Before publication, every exported file was compared with the live site. Apart from the intended product pages, related-product version labels, and install pages, the only differences were line endings (the previous publication used CRLF; the repository now enforces LF) and one `unicode-range` value in inlined Google Fonts CSS. All binary assets were identical. The export contains no links, and the secret-marker scan found only page text and framework code.

The site was published with the static-sites runbook's content update workflow. The server script created `/opt/docker/backups/static-sites/moodlia.com-20261114T233040Z.tar.gz`, swapped the domain directory, and reported `container_recreated=false`. The local canonical copy in the management workspace was replaced with the same export.

`node tools/verify-publication.mjs https://moodlia.com/` verified all 158 public files byte for byte and ten clean HTTPS routes. The HTTP redirect probe timed out, as in the previous publication; HTTPS was verified directly. The tracked `.taste-skill/deployment/publication.json` contains the file digests and verification timestamp.
