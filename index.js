const http = require('http');
// 1. Ocupar el módulo File System para la manipulación de archivos alojados en el
// servidor
const fs = require('fs');
const url = require('url');
const moment = require('moment');
const { agregarRoommate, guardarRoommate } = require('./roommate');
const { v4 } = require('uuid');
const { calculoGastos, agregarGasto } = require('./gasto');
let roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
let roommatesLista = roommatesJSON.roommates;
let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
let gastosLista = gastosJSON.gastos;

const server = http.createServer((req, res) => {
    let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    let gastosListado = gastosJSON.gastos;

    if(req.url == '/' && req.method == 'GET') {

        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(fs.readFileSync('index.html', 'utf8'));

    };

    if(req.url.startsWith('/roommate') && req.method == 'POST') {

        agregarRoommate().then(async (respuesta) => {

            guardarRoommate(respuesta);
            res.statusCode = 201;
            res.end(JSON.stringify(respuesta));

        // 2. Capturar los errores para condicionar el código a través del manejo de excepciones.
        }).catch((error) => {

            // 5. Devolver los códigos de estado HTTP correspondientes a cada situación.
            res.statusCode = 500;
            res.end();
            console.log(error);

        });

    };

    // b. POST /gasto: Recibe el payload con los datos del gasto y los almacena en un
    // archivo JSON (gastos.json).
    if(req.url.startsWith('/gasto') && req.method == 'POST') {

        try {

            let body

            req.on('data', (payload) => {
                body = JSON.parse(payload);
            });
    
            req.on('end', () => {
    
                let gasto = {
                    roommate : body.roommate,
                    descripcion : body.descripcion,
                    monto : body.monto,
                    fecha : moment().format('LLL'),
                    id : v4().slice(-6)
                };

                agregarGasto(gasto);

                res.statusCode = 201;
                res.end();
    
            });

        } catch(error) {

            res.statusCode = 500;
            console.log(error);
            res.end();

        };

    };

    // e. GET /roommates: Devuelve todos los roommates almacenados en el servidor
    // (roommates.json)
    // Se debe considerar recalcular y actualizar las cuentas de los roommates luego de
    // este proceso.
    if(req.url.startsWith('/roommates') && req.method == 'GET') {

        try{

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(fs.readFileSync('roommates.json', 'utf8'));

        }catch(error){

            res.statusCode = 500;
            console.log(error);
            res.end();

        };

    };

    // a. GET /gastos: Devuelve todos los gastos almacenados en el archivo
    // gastos.json.
    if(req.url.startsWith('/gastos') && req.method == 'GET') {

        try{

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(fs.readFileSync('gastos.json', 'utf8'));

        }catch(error){

            res.statusCode = 500;
            console.log(error);
            res.end();

        };

    };

    // c. PUT /gasto: Recibe el payload de la consulta y modifica los datos
    // almacenados en el servidor (gastos.json).
    if(req.url.startsWith('/gasto') && req.method == 'PUT') {

        try{

            const { id } = url.parse(req.url, true).query;

            let body;
            req.on('data', (payload) => {
                body = JSON.parse(payload);
            });
     
            req.on('end', () => {
                gastosJSON.gastos = gastosListado.map((g) => {
     
                    if(g.id == id) {
     
                        let nuevosGastos = {
                            roommate : body.roommate,
                            descripcion : body.descripcion,
                            monto : body.monto,
                            fecha : moment().format('LLL'),
                            id : g.id
                        };
     
                        return nuevosGastos;
                    };
     
                    return g;
                });
                
                fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON));
                calculoGastos();
                res.statusCode = 200;
                res.end();
            });

        }catch(error){

            res.statusCode = 500;
            console.log(error);
            res.end();

        };

    };

    // d. DELETE /gasto: Recibe el id del gasto usando las Query Strings y la elimine
    // del historial de gastos (gastos.json).
    if(req.url.startsWith('/gasto') && req.method == 'DELETE') {

        try{

            const { id } = url.parse(req.url, true).query;

            gastosJSON.gastos = gastosListado.filter((g) => g.id !== id);
    
            fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON));
            calculoGastos();
            res.statusCode = 200;
            res.end();

        }catch(error){

            res.statusCode = 500;
            console.log(error);
            res.end();

        };

    };

}).listen(3000, () => console.log('Escuchando al servidor'));

module.exports = server;