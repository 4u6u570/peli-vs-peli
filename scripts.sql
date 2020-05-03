use competencias;

CREATE TABLE `competencias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) DEFAULT NULL,
  `condiciones` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `voto` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_competencia` int unsigned DEFAULT NULL,
  `id_pelicula` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idPelicula_idx` (`id_pelicula`),
  KEY `idCompetencias_idx` (`id_competencia`),
  CONSTRAINT `idCompetencias` FOREIGN KEY (`id_competencia`) REFERENCES `competencias` (`id`),
  CONSTRAINT `idPelicula` FOREIGN KEY (`id_pelicula`) REFERENCES `pelicula` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

