const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');

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

// Route 5: Weather
// Setup notes:
// - WEATHER_API_KEY: your weather provider API key.
// - WEATHER_API_URL: provider endpoint, e.g. https://api.openweathermap.org/data/2.5/weather
// - WEATHER_CITY: city name for lookup (default: Kathmandu).
// - WEATHER_UNITS: metric or imperial (default: metric).
app.get('/api/weather', async (req, res) => {
    try {
        const weatherApiUrl = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';
        const weatherApiKey = process.env.WEATHER_API_KEY;
        const weatherCity = process.env.WEATHER_CITY || 'Kathmandu';
        const weatherUnits = process.env.WEATHER_UNITS || 'metric';

        if (!weatherApiKey) {
            return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });
        }

        const url = `${weatherApiUrl}?q=${encodeURIComponent(weatherCity)}&units=${encodeURIComponent(weatherUnits)}&appid=${encodeURIComponent(weatherApiKey)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

        const data = await response.json();
        res.json({
            city: data?.name || weatherCity,
            country: data?.sys?.country || '',
            temp: data?.main?.temp,
            feelsLike: data?.main?.feels_like,
            tempMin: data?.main?.temp_min,
            tempMax: data?.main?.temp_max,
            humidity: data?.main?.humidity,
            pressure: data?.main?.pressure,
            windSpeed: data?.wind?.speed,
            visibility: data?.visibility,
            cloudiness: data?.clouds?.all,
            summary: data?.weather?.[0]?.main || 'Clear',
            description: data?.weather?.[0]?.description || 'clear sky'
        });
    } catch (err) {
        console.error('Weather API error:', err.message);
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
