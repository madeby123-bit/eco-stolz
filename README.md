# Eco Stolz – Website

Cinematische Website für **Eco Stolz – Energie & Wassertechnik** (Innsbruck):
chemiefreier Kalkschutz TESL® II und Wasserfilter für Familien.

Single-Page-Landingpage mit Hero-Video, Parallax-Effekten, Scroll-Animationen,
animierten Zahlen und überzeugenden Texten.

## Lokal starten

```bash
npm install
npm start
```

Die Seite läuft dann unter http://localhost:3000

## Struktur

```
.
├── app.js              # Express-Server (liefert public/ aus)
├── package.json
└── public/
    ├── index.html      # Cinematische Landingpage
    ├── style.css       # Design-System + Animationen
    ├── main.js         # Scroll-Reveals, Parallax, Counter, Mobile-Nav
    └── assets/         # Logo, Bilder, Hero-/Section-Videos
```

## Deployment (Hostinger)

Node.js-App. Startbefehl: `npm start` (führt `node app.js` aus).
Hostinger setzt die Umgebungsvariable `PORT` automatisch.

Da die Seite vollständig statisch ist (der Server liefert nur `public/` aus),
kann der Inhalt von `public/` alternativ auch als reine statische Website
deployt werden.
