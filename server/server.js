require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Set the port to the environment variable or fallback to 3000 for local development
const PORT = process.env.PORT || 3000;

// Serve the static files from the client directory
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Route 3: Holidays
app.get('/api/holidays', async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const response = await fetch(`${process.env.ENGLISH_CALENDAR_API_URL}/${year}/US`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Holidays API error:', err.message);
        res.status(500).json({ error: 'Failed' });
    }
});

// Route 4: Nepali Calendar
app.get('/api/nepali-calendar', async (req, res) => {
    try {
        // Construct URL assuming API key is passed as a query perimeter or handle generically
        const url = `${process.env.NEPALI_CALENDAR_API_URL}?key=${process.env.NEPALI_CALENDAR_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Nepali Calendar API error:', err.message);
        res.status(500).json({ error: 'Failed' });
    }
});

// Catch-all route to serve the index.html for SPA (Single Page Application)
// Ensures any direct navigation to routes like /alarm or /timer load the index
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`vClock Server is running on port ${PORT}`);
    console.log(`Access the application locally at http://localhost:${PORT}`);
});
