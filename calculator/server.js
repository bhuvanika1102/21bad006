const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 9876;

app.use(cors());

const WINDOW_SIZE = 10;
const TEST_SERVER_API = 'http://localhost:3000/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzYxMDI5LCJpYXQiOjE3MjA3NjA3MjksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjNmNWEyOWFhLTA4NjYtNDc1Zi1iYzYyLWI5MTQzN2U2NmQ0OSIsInN1YiI6ImJodXZhbmkxMTAyQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6Im1lcGNvIHNjaGxlbmsgZW5naW5lZXJpbmcgY29sbGVnZSIsImNsaWVudElEIjoiM2Y1YTI5YWEtMDg2Ni00NzVmLWJjNjItYjkxNDM3ZTY2ZDQ5IiwiY2xpZW50U2VjcmV0IjoiU1RLdFFNWW9ta05IZnBQWCIsIm93bmVyTmFtZSI6IkJodXZhbmlrYSIsIm93bmVyRW1haWwiOiJiaHV2YW5pMTEwMkBnbWFpbC5jb20iLCJyb2xsTm8iOiIyMWJhZDAwNiJ9.vPwIgHK3N8787B9xiWtGRommCNnIVb3-4Rcl-z97rs';  
const NUMBER_IDS = new Set(['p', 'f', 'e', 'r']);

const numbersStore = {
    p: [],
    f: [],
    e: [],
    r: []
};

async function fetchNumber(numberId) {
    try {
        const response = await axios.get(`${TEST_SERVER_API}/${numberId}`, { timeout: 500 });
        if (response.status === 200) {
            return response.data.number;
        } else {
            console.error(`Error fetching number: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error fetching number: ${error.message}`);
    }
    return null;
}

function calculateAverage(numbers) {
    return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
}

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    console.log(`Received request for number ID: ${numberid}`);

    if (!NUMBER_IDS.has(numberid)) {
        console.error(`Invalid number ID: ${numberid}`);
        return res.status(400).json({ error: "Invalid number ID" });
    }

    const number = await fetchNumber(numberid);
    if (number === null) {
        console.error(`Failed to fetch number for ID: ${numberid}`);
        return res.status(500).json({ error: "Failed to fetch number" });
    }

    const currentNumbers = numbersStore[numberid];
    if (currentNumbers.length >= WINDOW_SIZE) {
        currentNumbers.shift();
    }
    currentNumbers.push(number);

    const avg = calculateAverage(currentNumbers);
    const response = {
        windowPrevState: currentNumbers.slice(0, -1),
        windowCurrState: currentNumbers,
        numbers: currentNumbers,
        avg
    };

    console.log(`Response for number ID ${numberid}: ${JSON.stringify(response)}`);

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
