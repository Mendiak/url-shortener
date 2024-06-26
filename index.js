require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { promisify } = require('util');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// In-memory database for storing mappings between original and shortened URLs
const urlDatabase = new Map(); // Define urlDatabase here

// Promisify dns.lookup function for easier usage
const dnsLookup = promisify(dns.lookup);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

// Endpoint to shorten a URL
app.post('/api/shorturl', async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Verify if the submitted URL is valid
  try {
    const { hostname } = new URL(url);
    console.log('Valid URL:', url);
    await dnsLookup(hostname.toLowerCase()); // Convertir a minúsculas
  } catch (error) {
    console.error('URL Validation Error:', error);
    return res.json({ error: 'invalid url' });
  }
  
  

  // Generate a unique shortened URL
  const shortUrl = generateShortUrl();

  // Store the mapping in the database
  urlDatabase.set(shortUrl, url);

  res.json({ original_url: url, short_url: shortUrl });
});


// Helper function to generate a unique shortened URL
function generateShortUrl() {
  return Math.random().toString(36).substr(2, 6); // Generate a random string
}

// Endpoint to redirect to original URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const originalUrl = urlDatabase.get(shortUrl);
  if (!originalUrl) {
    return res.status(404).send('URL not found');
  }
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
