require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Add this line
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Endpoint to shorten a URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Verify if the submitted URL is valid
  try {
    const { hostname } = new URL(url);
    await dnsLookup(hostname);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL' });
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
