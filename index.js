require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = 4310;

const urls = [];

function generateUrlId() {
  return Math.floor(Math.random() * 1000000);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.post('/api/shorturl', (req, res) => {
  const originalURL = req.body.url;
  console.log(originalURL)
  if (!isValidUrl(originalURL)) {
    return res.json({ error: 'Invalid url' });
  }

  dns.lookup(new URL(originalURL).hostname, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    const shorturl = generateUrlId();
    urls.push({ original_url: originalURL, short_url: shorturl });

    res.json({ original_url: originalURL, short_url: shorturl });
  });
});

app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = parseInt(req.params.shortUrl);
  const url = urls.find(u => u.short_url === shortUrl);

  if (url) {
    res.redirect(url.original_url);
  } else {
    res.status(404).send('URL not found');
  }
});

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
