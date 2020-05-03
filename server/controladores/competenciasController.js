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
    let sqlPeliculas = `select p.id, p.poster, p.titulo, g.nombre genero, a.nombre actor, d.nombre director
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
            return res.status(500).send("Ocurrió un error al realizar la consulta, la competencia no existe.");
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

function votar(req, res) {
    let idCompetencia = req.params.id;
    let idPelicula = req.body.idPelicula;
    let sqlVotar = `insert into voto (id_competencia, id_pelicula) values (${idCompetencia},${idPelicula});`;
    con.query(sqlVotar, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("Ocurrió un error al registrar el voto.");
        }
        res.send(true);
    });
}

function obtenerResultados(req, res) {
    let idCompetencia = req.params.id;
    let sqlCompetencia = `select * from competencias where id = ${idCompetencia};`;
    let sqlResultados = `select p.id, p.poster, p.titulo, count(v.id_pelicula) votos
                            from voto v,
                                pelicula p
                        where v.id_pelicula = p.id 
                            and v.id_competencia = ${idCompetencia}
                            group by p.id
                            order by 4 desc limit 3;`;

    con.query(sqlCompetencia, function (error, rCompetencia, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("La competencia no existe.");
        };
        var competencia = rCompetencia[0];
        con.query(sqlResultados, function (error, rResultado, fields) {
            if (error) {
                console.log("Ocurrió un error al realizar la consulta.", error.message);
                return res.status(500).send("Ocurrió un error al registrar el voto.");
            }
            let response= {
                competencia: competencia.nombre,
                resultados: rResultado
            }
            res.send(response);
        });
    });
}

function crearCompetencia(req, res) {
    var competencia = req.body.nombre;
    var generoId = req.body.genero;
    var directorId = req.body.director;
    var actorId = req.body.actor;
    var filtros = [];
    var filtro;
    var condiciones = Object.keys(req.body);
    var sqlControlCantidad = `SELECT count(*) cantidadPeliculas
                        FROM PELICULA P, GENERO G, ACTOR_PELICULA AP, DIRECTOR_PELICULA DP, ACTOR A, DIRECTOR D       
                       WHERE P.GENERO_ID = G.ID
                         AND P.ID = AP.PELICULA_ID
                         AND P.ID = DP.PELICULA_ID
                         AND AP.ACTOR_ID = A.ID 
                         AND DP.DIRECTOR_ID = D.ID `;
    var sqlCreaCompetencia = `INSERT INTO COMPETENCIAS (nombre,condiciones) VALUES ('${competencia}','${filtros}')`;
    var sqlControlNombre = `select 1
                    from competencias
                   where REPLACE(upper(nombre), ' ', '') = REPLACE(upper('${competencia}'), ' ', '')`;

    con.query(sqlControlNombre, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrio el un error al realizar la consulta", error.message);
            return res.status(500).send("Ocurrio el un error al realizar la consulta");
        }
        if (!resultado.length) {
            condiciones.forEach(condicion => {
                switch (condicion) {
                    case 'genero':
                        if (generoId != 0) {
                            filtros.push(` G.ID =  ${generoId}`);
                        }
                        break;
                    case 'director':
                        if (directorId != 0) {
                            filtros.push(` D.ID =  ${directorId}`);
                        }
                        break;
                    case 'actor':
                        if (actorId != 0) {
                            filtros.push(` A.ID  = ${actorId}`);
                        }
                        break;
                }
            });

            if (filtros.length !== 0) {
                filtro += filtros.join(" and ");
                sqlControlCantidad += " AND " + filtros.join(" and ");
            };

            con.query(sqlControlCantidad, function (error, resultado, fields) {
                if (error) {
                    console.log("Ocurrio el un error al realizar la consulta", error.message);
                    return res.status(500).send("Ocurrio el un error al realizar la consulta");
                }

                if (resultado[0].cantidadPeliculas >= 2) {
                    con.query(sqlCreaCompetencia, function (error, resultado, fields) {
                        if (error) {
                            console.log("Ocurrio el un error al realizar la consulta", error.message);
                            return res.status(500).send("Ocurrio el un error al realizar la consulta");
                        }
                        res.send(resultado);
                    });
                } else {
                    return res.status(422).send("La cantida de peliculas para esta competencia tiene que ser mayor o igual a 2");
                }
            });
        } else {
            return res.status(422).send("La competencia que quiere crear ya existe");
        }
    });


}

function eliminarVotos(req, res) {
    let idCompetencia = req.params.id;
    let sqlEliminaVotos = `delete from voto where id_competencia = ${idCompetencia}`;

    con.query(sqlEliminaVotos, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("Ocurrió un error al reiniciar los votos.");
        }
        res.send(resultado);
    });
}

function obtenerCompetencia(req, res) {
    let idCompetencia = req.params.id;
    let sqlInfoComp = `select c.id,c.nombre ,d.nombre director, g.nombre genero, a.nombre actor
                         from (select id, nombre,condiciones,
                                      SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(SUBSTRING(condiciones,INSTR(condiciones, 'G.')),' AND ',1)), ' ',-1) genero_id,
                                      SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(SUBSTRING(condiciones,INSTR(condiciones, 'A.')),' AND ',1)), ' ',-1) actor_id,
                                      SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(SUBSTRING(condiciones,INSTR(condiciones, 'D.')),' AND ',1)), ' ',-1) director_id    
                                 from competencias
                                where id = ${idCompetencia}) c
                                 left join director d on c.director_id = d.id
                                 left join genero g on c.genero_id = g.id
                                 left join actor a on c.actor_id = a.id`;

    con.query(sqlInfoComp, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("La competencia no existe.");
        }
        var response = {
            'id': resultado,
            'nombre': resultado[0].nombre,
            'genero_nombre': resultado[0].genero,
            'actor_nombre': resultado[0].actor,
            'director_nombre': resultado[0].director
        }
        res.send(response);
    });
}

function obtenerGeneros(req, res) {
    let sqlObtieneGeneros = `select * from genero`;

    con.query(sqlObtieneGeneros, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("No se puede recuperar los géneros.");
        }
        res.send(resultado);
    });
}

function obtenerActores(req, res) {
    let sqlObtieneActores = `select * from actor`;

    con.query(sqlObtieneActores, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("No se puede recuperar los actores.");
        }
        res.send(resultado);
    })
}

function obtenerDirectores(req, res) {
    let sqlObtieneDirectores = `select * from director`;

    con.query(sqlObtieneDirectores, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("No se puede recuperar los directores.");
        }
        res.send(resultado);
    })
}
function eliminarCompetencia(req, res) {
    let idCompetencia = req.params.id;
    let sqlEliminaVotos = `delete from voto where id_competencia = ${idCompetencia}`;
    let sqlEliminaCompetencia = `delete from competencias where id = ${idCompetencia}`;

    con.query(sqlEliminaVotos, function (error, resultado, fields) {
        if (error) {
            console.log("Ocurrió un error al realizar la consulta.", error.message);
            return res.status(500).send("No se pueden eliminar los votos.");
        };
        con.query(sqlEliminaCompetencia, function (error, resultado, fields) {
            if (error) {
                console.log("Ocurrió un error al realizar la consulta.", error.message);
                return res.status(500).send("No se pueden eliminar las comeptencias.");
            }
            res.send(resultado);
        });
    });
}

function modificarCompetencia(req, res) {
    let nombreCompetencia = req.body.nombre;
    let idCompetencia = req.params.id;
    let sqlModificaCompetencia = `update competencias
    set nombre = '${nombreCompetencia}'
  where id = ${idCompetencia};`

  con.query(sqlModificaCompetencia, function (error, resultado, fields) {
    if (error) {
        console.log("Ocurrió un error al realizar la consulta.", error.message);
        return res.status(500).send("No se puede modificar la competencia.");
    }
    var response = {'id': resultado};
    res.send(response);
});

}
module.exports = {
    buscarCompetencias: buscarCompetencias,
    obtenerDosPeliculas: obtenerDosPeliculas,
    votar: votar,
    obtenerResultados: obtenerResultados,
    crearCompetencia: crearCompetencia,
    obtenerGeneros: obtenerGeneros,
    obtenerActores: obtenerActores,
    obtenerDirectores: obtenerDirectores,
    eliminarVotos: eliminarVotos,
    obtenerCompetencia: obtenerCompetencia,
    eliminarCompetencia: eliminarCompetencia,
    modificarCompetencia : modificarCompetencia
}