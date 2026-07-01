-- White/footer logos are invisible on the site's white cards.
-- NULL them out — frontend falls back to colored Wikipedia logos (LOGO_OVERRIDES)
-- or the university's favicon, both of which are colored versions.
UPDATE institutions SET logo_url = NULL WHERE id IN (
  1,    -- NUST        (Footer-logo.png — white)
  18,   -- UCP         (sticky-logo-white)
  58,   -- PIFD        (logo-white.png)
  143,  -- LUMHS       (logo-w.png)
  145,  -- Isra        (logowhite1.png)
  147,  -- SIBAUK      (logo-white.png)
  167,  -- CUI-KPK     (cusit-logo-white)
  234,  -- UCHENAB     (UOC-logo-white)
  235,  -- UIT         (LogoUIT White)
  259   -- UOAS        (Logo-white-400)
);
