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

// Statische Dateien aus dem public-Ordner ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Eco-Stolz läuft auf Port ${PORT}`);
});
