const { createReadStream } = require('fs');
const { createServer } = require('http');
const { PORT = 3000 } = process.env;
const HTML_CONTENT_TYPE = 'text/html';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const requestListener = (req, res) => {
    res.writeHead(200, { 'Content-Type': HTML_CONTENT_TYPE });
    // Concatenamos el directorio actual con el nombre del archivo
    createReadStream(__dirname + '/index.html').pipe(res);
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/hola", (req, res) => {
    // Obtener los datos enviados en la solicitud POST
    const datos = req.body;

    // Hacer algo con los datos (por ejemplo, guardarlos en una base de datos)
    console.log('Datos recibidos:', datos);

    // Responder al cliente
    res.send('Datos recibidos correctamente');
});


const server = createServer(requestListener);

app.get('/rss.xml', (req, res) => {



});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

