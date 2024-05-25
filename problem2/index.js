const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 9876;
const WINDOW_SIZE = 10;
let storedNumbers = [];

async function fetchNumbersFromServer(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE2NjE5NTI3LCJpYXQiOjE3MTY2MTkyMjcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjUzMTliYzQwLTczN2QtNDczZC05MmZiLWRlNzBjMGY5NmMzYyIsInN1YiI6IjIwMjFjc2UucjYzQHN2Y2UuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiYWZmb3JkTWVkIiwiY2xpZW50SUQiOiI1MzE5YmM0MC03MzdkLTQ3M2QtOTJmYi1kZTcwYzBmOTZjM2MiLCJjbGllbnRTZWNyZXQiOiJFaFdLb25NQmxlSEpIVURnIiwib3duZXJOYW1lIjoiR09VUlVHT0xMQSBTUkVFTkFUSCBWQUlTSE5BVkkiLCJvd25lckVtYWlsIjoiMjAyMWNzZS5yNjNAc3ZjZS5lZHUuaW4iLCJyb2xsTm8iOiIyMUJGMUEwNTYzIn0.r5QxCIg7sZynVfHuZRAV4SEqeIgnja37HkHfzBy1SQ4"

            },
            timeout: 500
        });
        return response.data.numbers || [];
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let url;

    switch (numberid) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/rand';
            break;
        default:
            return res.status(400).json({ error: 'Invalid number ID' });
    }

    const numbers = await fetchNumbersFromServer(url);

    if (numbers.length === 0) {
        return res.status(500).json({ error: 'Failed to fetch numbers or request timed out' });
    }

    storedNumbers = [...storedNumbers, ...numbers];
    storedNumbers = [...new Set(storedNumbers)]; 
    if (storedNumbers.length > WINDOW_SIZE) {
        storedNumbers = storedNumbers.slice(-WINDOW_SIZE);
    }

    const avg = calculateAverage(storedNumbers);

    const response = {
        windowPrevState: storedNumbers.slice(0, -numbers.length),
        windowCurrState: storedNumbers,
        numbers: numbers,
        avg: avg.toFixed(2) 
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
