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

app.get('/rss.xml', (req, res) => {
    // Generar el contenido del archivo RSS aquí
    const feedRSS = obtenerFeedRSS(); // Debes definir esta función según tu lógica

    // Generar el XML de RSS
    const contenido = generarXMLRSS(feedRSS);

    // Escribir el contenido en el archivo rss.xml
    fs.WriteLine('rss.xml', contenido);

    // Enviar el archivo rss.xml como respuesta
    res.sendFile(__dirname + '/rss.xml');
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para manejar la solicitud POST y guardar la noticia en el archivo JSON
app.post('/guardar-noticia', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convertir el buffer de datos a string
    });

    req.on('end', () => {
        const formData = parse(body); // Parsear los datos del formulario

        // Crear el objeto JSON con los datos del formulario
        const noticia = {
            titulo: formData.titulo,
            autor: formData.autor,
            fecha: formData.fecha,
            cuerpo: formData.cuerpo,
            imagen: formData.imagen
        };

        // Guardar la noticia en el archivo JSON
        guardarEnJSON(noticia);

        // Generar el XML de RSS
        const xmlRSS = generarXMLRSS([noticia]);

        // Enviar el XML de RSS como respuesta
        res.set('Content-Type', 'text/xml');
        res.send(xmlRSS);
    });
});

// Función para guardar la noticia en el archivo JSON
function guardarEnJSON(noticia) {
    const noticiasFilePath = './database/noticias.json';
    let noticias = [];

    // Leer el archivo JSON existente (si existe)
    if (fs.existsSync(noticiasFilePath)) {
        const data = fs.readFileSync(noticiasFilePath, 'utf8');
        noticias = JSON.parse(data);
    }

    // Agregar la nueva noticia al arreglo
    noticias.push(noticia);

    // Escribir el arreglo de noticias actualizado de vuelta al archivo
    fs.writeFileSync(noticiasFilePath, JSON.stringify(noticias, null, 2), 'utf8');
}

// Función para generar el XML de RSS
function generarXMLRSS(noticias) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n`;
    noticias.forEach(noticia => {
        xml += `<item>\n`;
        xml += `<title>${noticia.titulo}</title>\n`;
        xml += `<author>${noticia.autor}</author>\n`;
        xml += `<pubDate>${noticia.fecha}</pubDate>\n`;
        xml += `<description>${noticia.cuerpo}</description>\n`;
        xml += `<image>${noticia.imagen}</image>\n`;
        xml += `</item>\n`;
    });
    xml += `</channel>\n</rss>`;
    return xml;
}

const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});