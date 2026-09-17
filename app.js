const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Sicherheits-Header (Schutz vor Clickjacking, MIME-Sniffing, Datenabfluss)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// /leseprobe wurde mit /buecher zusammengefuehrt -> dauerhaft weiterleiten
app.get(['/leseprobe', '/leseprobe/'], (req, res) => res.redirect(301, '/buecher#leseprobe'));

// Alte URLs aus frueherer Seitenstruktur (laut Google Search Console 404) -> dauerhaft weiterleiten
app.get(['/tesl-2-medium', '/tesl-2-medium/'], (req, res) => res.redirect(301, '/tesl-ii-medium'));
app.get(['/tesl-2-mini', '/tesl-2-mini/'], (req, res) => res.redirect(301, '/tesl-ii-mini'));
app.get(['/setter-closer', '/setter-closer/'], (req, res) => res.redirect(301, '/karriere/social-media-setter-closer'));
app.get(['/social-selling-online-verkaufs-partner', '/social-selling-online-verkaufs-partner/'], (req, res) => res.redirect(301, '/karriere/social-selling-partner'));
app.get(['/reinigung-heizsystem/rohre/boiler/etc', '/reinigung-heizsystem/rohre/boiler/etc/'], (req, res) => res.redirect(301, '/reinigung-heizsysteme'));
app.get(['/rohrreinigung', '/rohrreinigung/'], (req, res) => res.redirect(301, '/reinigung-heizsysteme'));
app.get(['/kunden-1', '/kunden-1/'], (req, res) => res.redirect(301, '/kunden'));
app.get(['/warum-wasseraufbereitung', '/warum-wasseraufbereitung/'], (req, res) => res.redirect(301, '/wasseraufbereitung'));
app.get(['/home', '/home/'], (req, res) => res.redirect(301, '/'));
app.get(['/kontakt-karriere', '/kontakt-karriere/'], (req, res) => res.redirect(301, '/karriere'));

// Statische Dateien aus dem public-Ordner ausliefern
// (Langzeit-Caching; die massgebliche Steuerung erfolgt ueber public/.htaccess auf LiteSpeed,
//  dies hier greift als Absicherung, falls eine Datei ueber Node ausgeliefert wird)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (/\.(css|js|mjs|woff2?|ttf|otf|eot)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.html?$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Eco-Stolz läuft auf Port ${PORT}`);
});
