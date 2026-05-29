# TaleemPK

Pakistan's #1 university comparison platform — compare 218 HEC-recognized universities by fees, merit, programs, and location.

## Features
- Search universities & programs (with smart aliases)
- Filter by type, province, and city
- Side-by-side comparison (up to 3 universities)
- Fee calculator, merit/admission predictor, admission calendar, map view
- Shortlist (saved in the browser)
- Community: reviews, alumni connect, Q&A
- Fully responsive (mobile + desktop), SEO-ready

## Tech
- Single-file static site (`index.html`) — HTML, CSS, and JS in one file
- Leaflet (map), Chart.js (merit charts), Font Awesome (icons) via CDN
- Form submissions via Formspree (configure in `SITE_CONFIG`)

## Configuration
All site settings live in the `SITE_CONFIG` object near the top of the `<script>` block in `index.html`:
logo, contact info, WhatsApp, social links, Formspree endpoint, and footer links.

## Deployment
Static site — deploys to Netlify. Connected to this GitHub repo for automatic deploys on every push.
