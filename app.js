const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Statische Dateien aus dem public-Ordner ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Eco-Stolz läuft auf Port ${PORT}`);
});
