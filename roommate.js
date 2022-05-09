const axios = require('axios');
const { v4 } = require('uuid');
const fs = require('fs');
const { calculoGastos } = require('./gasto');

// 3. El botón “Agregar roommate” de la aplicación cliente genera una petición POST (sin
// payload) esperando que el servidor registre un nuevo roommate random con la API
// randomuser, por lo que debes preparar una ruta POST /roommate en el servidor que
// ejecute una función asíncrona importada de un archivo externo al del servidor (la
// función debe ser un módulo), para obtener la data de un nuevo usuario y la acumule
// en un JSON (roommates.json).
// El objeto correspondiente al usuario que se almacenará debe tener un id generado
// con el paquete UUID.

const agregarRoommate = async () => {
    try {

        const { data } = await axios.get('https://randomuser.me/api');
        const resultado = data.results[0];
        
        const roommate = {
            id : v4().slice(-6),
            correo : resultado.email,
            nombre : `${resultado.name.first} ${resultado.name.last}`,
            debe : 0,
            recibe : 0,
            total : 0
        };

        return roommate;

    } catch (error) {

        throw error;

    };
};

const guardarRoommate = (roommate) => {

    const roommatesJson = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    roommatesJson.roommates.push(roommate);
    fs.writeFileSync('roommates.json', JSON.stringify(roommatesJson));
    calculoGastos();

};

module.exports = { agregarRoommate, guardarRoommate };