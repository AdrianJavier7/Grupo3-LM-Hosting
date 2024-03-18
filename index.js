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
        fs.createReadStream('FormularioAdmin.html').pipe(res);
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
            fs.readFile('Noticias.json', 'utf8', (err, data) => {
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
                fs.writeFile('Noticias.json', JSON.stringify(jsonData, null, 2), err => {
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

            datos2.data.slice(0, -5).forEach(cadaElemento => {
                feed.item({
                    title: cadaElemento.titulo,
                    description: cadaElemento.cuerpo,
                    date: cadaElemento.fecha,
                    url: "http://localhost:3000/noticia.html",
                    custom_elements: [
                        { 'author': cadaElemento.autor },
                        { 'section': cadaElemento.genero},
                        { 'image': cadaElemento.imagen},
                        { 'date': cadaElemento.fecha}]
                });
            });

            let ultimasNoticias = datos2.data.slice(-5);

            ultimasNoticias.forEach((cadaElemento, index) => {
                let enlace = "http://localhost:3000/noticia" + index + ".html"
                    feed.item({
                    title: cadaElemento.titulo,
                    description: cadaElemento.cuerpo,
                    date: cadaElemento.fecha,
                    url: enlace,
                    custom_elements: [
                        { 'author': cadaElemento.autor },
                        { 'section': cadaElemento.genero },
                        { 'image': cadaElemento.imagen },
                        { 'date': cadaElemento.fecha }
                    ]
                });
            });

            res.setHeader('Content-Type', 'text/xml');
            res.write(feed.xml());
            res.end();
        });
    }
    else if (req.method === 'GET' && pathname === '/paginaSindicacion.html') {
        fs.readFile('paginaSindicacion.html', 'utf8', (err, pagina) => {
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

                ultimasNoticias.forEach(cadaElemento => {
                    if (cadaElemento === ultimasNoticias[0]){
                        cadaElemento.url = "http://localhost:3000/noticia0.html";
                    } else if (cadaElemento === ultimasNoticias[1]){
                        cadaElemento.url = "http://localhost:3000/noticia1.html";
                    } else if (cadaElemento === ultimasNoticias[2]){
                        cadaElemento.url = "http://localhost:3000/noticia2.html";
                    } else if (cadaElemento === ultimasNoticias[3]){
                        cadaElemento.url = "http://localhost:3000/noticia3.html";
                    } else if (cadaElemento === ultimasNoticias[4]){
                        cadaElemento.url = "http://localhost:3000/noticia4.html";
                    }
                })

                let htmlResponse = pagina;

                let noticiasHTML = '';

                ultimasNoticias.forEach(cadaElemento => {
                    noticiasHTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top" src=${cadaElemento.imagen}></image>
                                        <h3 class="pt-3"><a class="text-decoration-none mt-2 fw-bold" href=${cadaElemento.url}>${cadaElemento.titulo}</a></h3>
                                        <p>Escrito por: ${cadaElemento.autor}</p>
                                        <p>${cadaElemento.fecha}</p>
                                     </div>`;
                });

                htmlResponse = htmlResponse.replace('{{noticias}}', noticiasHTML);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    } else if (req.method === 'GET' && pathname === '/noticia1.html') {
        fs.readFile('noticia1.html', 'utf8', (err, pagina) => {
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

                let noticia1HTML = '';

                noticia1HTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top mb-3" src=${ultimasNoticias[1].imagen}></image>
                                        <h2 class="px-2">${ultimasNoticias[1].titulo}</h2>
                                        <div class="m-auto d-block text-center">
                                            <p class="fs-4">${ultimasNoticias[1].genero}</p>
                                            <p class="fst-italic">${ultimasNoticias[1].fecha}</p>
                                            <p class="fw-bold">Escrito por: ${ultimasNoticias[1].autor}</p>
                                        </div>
                                        <div>
                                            <p style="text-align: justify" class="px-4">${ultimasNoticias[1].cuerpo}</p>
                                        </div>
                                     </div>`;

                htmlResponse = htmlResponse.replace('{{noticias}}', noticia1HTML);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    }

    else if (req.method === 'GET' && pathname === '/noticia2.html') {
        fs.readFile('noticia2.html', 'utf8', (err, pagina) => {
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

                let noticia2HTML = '';

                noticia2HTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top mb-3" src=${ultimasNoticias[2].imagen}></image>
                                        <h2 class="px-2">${ultimasNoticias[2].titulo}</h2>
                                        <div class="m-auto d-block text-center">
                                            <p class="fs-4">${ultimasNoticias[2].genero}</p>
                                            <p class="fst-italic">${ultimasNoticias[2].fecha}</p>
                                            <p class="fw-bold">Escrito por: ${ultimasNoticias[2].autor}</p>
                                        </div>
                                        <div>
                                            <p style="text-align: justify" class="px-4">${ultimasNoticias[2].cuerpo}</p>
                                        </div>
                                     </div>`;

                htmlResponse = htmlResponse.replace('{{noticias}}', noticia2HTML);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    }

    else if (req.method === 'GET' && pathname === '/noticia3.html') {
        fs.readFile('noticia3.html', 'utf8', (err, pagina) => {
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

                let noticia3HTML = '';

                noticia3HTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top mb-3" src=${ultimasNoticias[3].imagen}></image>
                                        <h2 class="px-2">${ultimasNoticias[3].titulo}</h2>
                                        <div class="m-auto d-block text-center">
                                            <p class="fs-4">${ultimasNoticias[3].genero}</p>
                                            <p class="fst-italic">${ultimasNoticias[3].fecha}</p>
                                            <p class="fw-bold">Escrito por: ${ultimasNoticias[3].autor}</p>
                                        </div>
                                        <div>
                                            <p style="text-align: justify" class="px-4">${ultimasNoticias[3].cuerpo}</p>
                                        </div>
                                     </div>`;

                htmlResponse = htmlResponse.replace('{{noticias}}', noticia3HTML);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    }

    else if (req.method === 'GET' && pathname === '/noticia4.html') {
        fs.readFile('noticia4.html', 'utf8', (err, pagina) => {
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

                let noticia4HTML = '';

                noticia4HTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top mb-3" src=${ultimasNoticias[4].imagen}></image>
                                        <h2 class="px-2">${ultimasNoticias[4].titulo}</h2>
                                        <div class="m-auto d-block text-center">
                                            <p class="fs-4">${ultimasNoticias[4].genero}</p>
                                            <p class="fst-italic">${ultimasNoticias[4].fecha}</p>
                                            <p class="fw-bold">Escrito por: ${ultimasNoticias[4].autor}</p>
                                        </div>
                                        <div>
                                            <p style="text-align: justify" class="px-4">${ultimasNoticias[4].cuerpo}</p>
                                        </div>
                                     </div>`;

                htmlResponse = htmlResponse.replace('{{noticias}}', noticia4HTML);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(htmlResponse);
            });
        });
    }

    else if (req.method === 'GET' && pathname === '/noticia0.html') {
        fs.readFile('noticia0.html', 'utf8', (err, pagina) => {
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

                let noticia0HTML = '';

                noticia0HTML += `<div class="m-auto d-block bg-white border border-dark card rounded-3 text-center shadow my-5 col-sm-11 col-md-8 col-lg-5">
                                        <image class="card-img-top mb-3" src=${ultimasNoticias[0].imagen}></image>
                                        <h2 class="px-2">${ultimasNoticias[0].titulo}</h2>
                                        <div class="m-auto d-block text-center">
                                            <p class="fs-4">${ultimasNoticias[0].genero}</p>
                                            <p class="fst-italic">${ultimasNoticias[0].fecha}</p>
                                            <p class="fw-bold">Escrito por: ${ultimasNoticias[0].autor}</p>
                                        </div>
                                        <div>
                                            <p style="text-align: justify" class="px-4">${ultimasNoticias[0].cuerpo}</p>
                                        </div>
                                     </div>`;

                htmlResponse = htmlResponse.replace('{{noticias}}', noticia0HTML);

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
