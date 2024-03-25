const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Définir le dossier des fichiers statiques
app.use(express.static(path.join(__dirname)));
// Configuration spécifique pour les fichiers JavaScript
app.get('*.js', function(req, res, next) {
  res.contentType('application/javascript');
  next();
});
// Configuration spécifique pour les fichiers CSS
app.get('*.css', function(req, res, next) {
  res.contentType('text/css');
  next();
});
// Route pour gérer les requêtes GET vers la racine
app.get('*', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'));});

// Démarrer le serveur
app.listen(PORT, () => {console.log(`Serveur démarré sur le port ${PORT}`);});



