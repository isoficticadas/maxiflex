require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const { google } = require('googleapis');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar compresión para las respuestas
app.use(compression());

// Middleware para analizar datos del cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos con opciones de almacenamiento en caché
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache por 1 día
    etag: false,  // Deshabilitar etag para usar cache-control
  })
);

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir el archivo policy.html
app.get('/policy.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'policy.html'));
});

// Variables de entorno
const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID } = process.env;
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

// Ruta para manejar el envío del formulario
app.post('/submit', async (req, res) => {
  const { name, phone } = req.body;
  const namePattern = /^[A-Za-z\s]+$/;
  const phonePattern = /^\+593\d{9}$/;

  if (!name || !namePattern.test(name)) {
    return res.status(400).json({ error: 'Nombre inválido. Solo se permiten letras y espacios.' });
  }

  if (!phonePattern.test(phone)) {
    return res.status(400).json({ error: 'Número de teléfono inválido. Ejemplo: +593933543342' });
  }

  const defaultData = 'Maxiflex';
  const timestamp = new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Cliente!A:D',
      valueInputOption: 'RAW',
      resource: {
        values: [[name, phone, defaultData, timestamp]],
      },
    });

    // Redirigir al usuario a gracias.html
    res.redirect('/gracias.html');
  } catch (error) {
    console.error('Error al enviar los datos:', error);
    res.status(500).send('Error al enviar los datos');
  }
});

// Ruta para servir el archivo gracias.html
app.get('/gracias.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'gracias.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
