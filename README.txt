Handy Angels — Static Website (Temporary)
=======================================

This is a modern, accessible, SEO/AIO-friendly static site designed to be replaced or powered by ServiceUp later.

How to preview locally
----------------------
Because the site uses relative links, you should preview it with a local web server:

1) Open a terminal in the handy-angels-site folder
2) Run:
   python3 -m http.server 8080
3) Visit:
   http://localhost:8080/

Key files
---------
- index.html                         (Homepage)
- services/index.html                (Services overview)
- services/<service>/index.html      (Individual service pages)
- service-areas/index.html
- about/index.html
- emergency/index.html
- contact/index.html
- airbnb/index.html

Assets
------
- assets/css/styles.css
- assets/js/main.js
- assets/js/carousel.js
- assets/img/*
- assets/svg/*

Before launch (IMPORTANT)
------------------------
1) Replace placeholder contact details
   - contact/index.html currently uses placeholder phone/email.

2) Replace placeholder domain in structured data and sitemap
   - index.html JSON-LD "url" is https://example.com
   - sitemap.xml uses https://example.com/

3) Add your hero video (optional)
   - Put an MP4 here: assets/video/hero.mp4
   - The hero will still look good without it.

4) Wire up the forms
   - Forms currently use action="#" and are static.
   - Connect them to ServiceUp, Gravity Forms embed, Formspree, or your preferred endpoint.

Accessibility notes
-------------------
- Skip link included
- Semantic HTML + ARIA where appropriate
- Keyboard-friendly mobile drawer with ESC support
- Respects prefers-reduced-motion (autoplay disabled)

SEO/AIO notes
-------------
- Crawlable services list and internal links
- Local service areas section
- JSON-LD LocalBusiness and Service schema
- Clear headings and descriptive meta tags

ServiceUp mapping (future)
--------------------------
This layout is intentionally structured so these content blocks can become dynamic:
- Services (Carousel + grid)
- Service pages (FAQ + areas served + CTA)
- Service areas list
- Testimonials
- Lead forms

