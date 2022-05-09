const fs = require('fs');

const agregarGasto = (g) => {

    let roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    let roommatesLista = roommatesJSON.roommates;

    let listaGastos = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));

    if(roommatesLista.length > 0) {

        listaGastos.gastos.push(g);
        fs.writeFileSync('gastos.json', JSON.stringify(listaGastos));
        calculoGastos();

    } else {

        console.log('No se puede agregar el gasto');

    };

};

const calculoGastos = () => {

    let roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    let roommatesLista = roommatesJSON.roommates;

    let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    let gastosLista = gastosJSON.gastos;

    let divisor = roommatesLista.length;

    roommatesLista.forEach(miembro => {

        miembro.recibe = 0;

        miembro.debe = 0;

    });

    roommatesLista.forEach(miembro => {

        gastosLista.forEach(gasto => {

            if(miembro.nombre == gasto.roommate) {
               miembro.recibe += parseInt(gasto.monto / divisor);
            } else {
                miembro.debe -= parseInt(gasto.monto / divisor);
            };

        });

    });

    fs.writeFileSync('roommates.json', JSON.stringify(roommatesJSON));

};

module.exports = { calculoGastos, agregarGasto };