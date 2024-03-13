const { createReadStream } = require('fs');
const { createServer } = require('http');
const { PORT = 3000 } = process.env;
const HTML_CONTENT_TYPE = 'text/html';
const express = require('express');
const app = express();

const requestListener = (req, res) => {
    res.writeHead(200, { 'Content-Type': HTML_CONTENT_TYPE });
    // Concatenamos el directorio actual con el nombre del archivo
    createReadStream(__dirname + '/index.html').pipe(res);
};

const server = createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

