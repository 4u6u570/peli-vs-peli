var con = require("../lib/conexiondb");

function buscarCompetencias(req, res) {
    let sql = "select id,nombre,condiciones from competencias ;";
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("Ocurrió un error al realizar la consulta.");
        }
        res.send(resultado);
    });
}

function obtenerDosPeliculas(req, res) {
    let sql = `SELECT * FROM competencias where id = ${req.params.id};`;
    let sqlPeliculas = `select *
                        from pelicula p,
                            genero g,
                            actor_pelicula ap,
                            director_pelicula dp,
                            actor a,
                            director d
                    where p.genero_id = g.id
                        and p.id = ap.pelicula_id
                        and p.id = dp.pelicula_id
                        and ap.actor_id = a.id
                        and dp.director_id = d.id `;

    con.query(sql, function (error, rCompetencias, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("Ocurrió un error al realizar la consulta.");
        }

        if (rCompetencias != null) {
            sqlPeliculas += `${rCompetencias[0].condiciones} order by RAND() limit 2`;
        }
        con.query(sqlPeliculas, function (error, rPeliculas, fields) {
            if (error) {
                console.log("Ocurrió un error al realizar la consulta.", error.message);
                return res.status(500).send("Ocurrió un error al realizar la consulta.");
            }
            var respuesta = {
                'competencias': rCompetencias,
                'peliculas': rPeliculas
            }

            res.send(respuesta);
        });
    });



}

module.exports = {
    buscarCompetencias: buscarCompetencias,
    obtenerDosPeliculas: obtenerDosPeliculas
}