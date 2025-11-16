const express = require('express');
const app = express();
const generalRouter = require('./router/general'); // Import your router

// Middleware to parse JSON bodies
app.use(express.json());

// Use the general router for all routes
app.use('/', generalRouter);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
