const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

// Crear servidor HTTP
const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url);

    // Manejar solicitud GET al formulario HTML
    if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('ruta de FormularioAdmin.html en tu proyecto').pipe(res);
    }
    // Manejar solicitud POST del formulario
    else if (req.method === 'POST' && pathname === '/submit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convertir datos de buffer a cadena
        });

        req.on('end', () => {
            // Parsear los datos del formulario
            const formData = querystring.parse(body);
            console.log(formData);
            // Leer el contenido actual del archivo JSON
            fs.readFile('ruta del JSON en tu proyecto', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error al leer el archivo JSON:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error interno del servidor');
                    return;
                }

                let jsonData;

                try {
                    // Si el archivo existe, analiza su contenido como JSON
                    jsonData = JSON.parse(data);
                } catch (parseError) {
                    console.error('Error al analizar el contenido del archivo JSON:', parseError);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error interno del servidor');
                    return;
                }

                // Añadir los nuevos datos del formulario al JSON existente
                jsonData.data.push(formData);

                // Escribir los datos combinados en el archivo .json
                fs.writeFile('ruta del JSON en tu proyecto', JSON.stringify(jsonData, null, 2), err => {
                    if (err) {
                        console.error('Error al escribir en el archivo JSON:', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error interno del servidor');
                        return;
                    }
                    console.log('Datos guardados correctamente.');
                });
            });
        });


    } else {
        // Manejar rutas no encontradas
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Ruta no encontrada');
    }
});

// Escuchar en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
