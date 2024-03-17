const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const RSS = require('rss');

const path = require('path');

const json = path.join(__dirname, 'Noticias.json');

// Crear servidor HTTP
const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url);

    // Manejar solicitud GET al formulario HTML
    if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('Paso4/FormularioAdmin.html').pipe(res);
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
            fs.readFile('Paso4/Noticias.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error al leer el archivo JSON:', err);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Error interno del servidor');
                    return;
                }

                let jsonData;

                try {
                    // Si el archivo existe, analiza su contenido como JSON
                    jsonData = JSON.parse(data);
                } catch (parseError) {
                    console.error('Error al analizar el contenido del archivo JSON:', parseError);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Error interno del servidor');
                    return;
                }

                // Añadir los nuevos datos del formulario al JSON existente
                jsonData.data.push(formData);

                // Escribir los datos combinados en el archivo .json
                fs.writeFile('Paso4/Noticias.json', JSON.stringify(jsonData, null, 2), err => {
                    if (err) {
                        console.error('Error al escribir en el archivo JSON:', err);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Error interno del servidor');
                        return;
                    }
                    console.log('Datos guardados correctamente.');
                    // Redirigir al cliente de vuelta al formulario

                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                });
            });
        });
    }
    // Manejar solicitud GET para generar RSS
    else if (req.method === 'GET' && pathname === '/rss') {

        let feed = new RSS({
            title: 'Noticias',
            description: 'Noticias de la semana',
            feed_url: 'http://localhost:3000/rss',
            site_url: 'http://localhost:3000',
            author: '',
            section: '',
            image: '',
            data: ''
        });

        fs.readFile(json, 'utf8', (err, datos) => {
            if (err) {
                console.error('Error al leer el archivo JSON:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error interno del servidor');
                return;
            }

            let datos2 = JSON.parse(datos);

            datos2.data.forEach(cadaElemento => {
                feed.item({
                    title: cadaElemento.titulo,
                    description: cadaElemento.cuerpo,
                    url: cadaElemento.url,
                    date: cadaElemento.fecha,
                    custom_elements: [
                        { 'author': cadaElemento.autor },
                        { 'section': cadaElemento.genero},
                        { 'image': cadaElemento.imagen},
                        { 'date': cadaElemento.fecha}]
                });
            });


            res.setHeader('Content-Type', 'text/xml');
            res.write(feed.xml());
            res.end();
        });
    }
    else if (req.method === 'GET' && pathname === '/paginaSindicacion.html') {
        fs.readFile('Paso4/paginaSindicacion.html', 'utf8', (err, pagina) => {
            if (err) {
                console.error('Error al leer el archivo HTML:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error interno del servidor');
                return;
            }

            fs.readFile(json, 'utf8', (err, datos) => {
                if (err) {
                    console.error('Error al leer el archivo JSON:', err);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Error interno del servidor');
                    return;
                }

                let datos2 = JSON.parse(datos);
                let ultimasNoticias = datos2.data.slice(-5);

                let htmlResponse = pagina;

                let noticiasHTML = '';

                ultimasNoticias.forEach(cadaElemento => {
                    noticiasHTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top" src=${cadaElemento.imagen}></image>
                                        <h3><a class="text-decoration-none mt-2" href=${cadaElemento.url}>${cadaElemento.titulo}</a></h3>
                                        <p>Escrito por: ${cadaElemento.autor}</p>
                                        <p>${cadaElemento.fecha}</p>
                                     </div>`;
                });

                htmlResponse = htmlResponse.replace('{{noticias}}', noticiasHTML);


                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    }

    else {
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
