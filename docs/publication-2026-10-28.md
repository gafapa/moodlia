# Corrector privacy policy publication, 28 October 2026

Published the updated Corrector privacy policy for extension 0.2.1 to
<https://moodlia.com/privacy/corrector.html>. Only that document changed: it
now covers XLSX, ODS, PPTX and ODP reading, page images, the 30-minute
in-memory page cache, replacement of the student's name with `[Student]`,
the inherited course and assignment criteria and the automatic next-student
correction. The file was placed in the existing static staging copy and
published with the managed server publisher; the Nginx configuration test
passed and the container was not recreated. The previous staged policy is
kept in the server-hub local backups (`moodlia.com-privacy-20261028`).

`node tools/verify-publication.mjs` verified all 163 public files byte for
byte and all ten clean HTTPS routes; the new policy's SHA-256 is
`39079a4d54ea264f8bebc0d9beabd602118d0ab30ef46d0d81516e6e80b81f1d`. The HTTP
redirect probe timed out, as in earlier publications.

The rest of the site is unchanged and still offers the Corrector 0.1.71
download. This publication does not establish Chrome Web Store approval of
0.2.1.
