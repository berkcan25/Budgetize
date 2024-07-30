const express = require('express');
const cheerio = require('cheerio');
const app = express();
const port = 9000;
const cors = require('cors');

app.use(cors())

// Import routes
const walmartRoutes = require('./Walmart');
const krogerRoutes = require('./Kroger');
const scraperRoutes = require('./scraper');

// Middleware to parse JSON bodies
app.use(express.json());

// Use routes
app.use('/walmart', walmartRoutes);
app.use('/kroger', krogerRoutes);
// app.use('/scraper', scraperRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
