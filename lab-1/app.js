
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Node.js and Express server!');
});


app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'Shanmuk Shahith',
        section: 'CSE-GAI-2C'
    });
});

app.get('/time', (req, res) => {
    const currentTime = new Date();

    res.status(200).json({
        dateTime: currentTime
    });
});

app.use((req, res) => {
    res.status(404).send('404 - Page not found');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
