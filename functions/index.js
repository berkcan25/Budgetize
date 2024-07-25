const express = require('express');
const app = express();
const port = 9000;

// Import routes
const walmartRoutes = require('./Walmart');
// const krogerRoutes = require('./Kroger');

// Middleware to parse JSON bodies
app.use(express.json());

// Use routes
app.use('/walmart', walmartRoutes);
// app.use('/kroger', krogerRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
