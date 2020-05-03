//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controladores/competenciasController.js');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.post('/competencias', controlador.crearCompetencia);
app.get('/competencias', controlador.buscarCompetencias);
app.get('/competencias/:id/peliculas', controlador.obtenerDosPeliculas);
app.post('/competencias/:id/voto', controlador.votar);
app.get('/competencias/:id/resultados', controlador.obtenerResultados);
app.get('/generos', controlador.obtenerGeneros);
app.get('/actores', controlador.obtenerActores);
app.get('/directores', controlador.obtenerDirectores);
app.delete('/competencias/:id/votos', controlador.eliminarVotos);
app.get('/competencias/:id', controlador.obtenerCompetencia);
app.delete('/competencias/:id', controlador.eliminarCompetencia);
app.put('/competencias/:id', controlador.modificarCompetencia);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});