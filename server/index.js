const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const idJugador = 0;
// const session = require('express-session');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'preguntados'
});

app.get('/historial', (req, res) => {
    const nombre = req.query.nombre;
    const apellido = req.query.apellido;
  
    // Buscar el jugador en la base de datos por nombre y apellido
    db.query('SELECT id FROM jugadores WHERE nombre = ? AND apellido = ?', [nombre, apellido], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'Error en la base de datos' });
      } else {
        if (result.length > 0) {
          const jugadorId = result[0].id;
  
          // Buscar el historial de partidas del jugador en la tabla de jugadas
          db.query('SELECT * FROM jugadas WHERE idJugador = ?', [jugadorId], (err, historialResult) => {
            if (err) {
              console.log(err);
              res.status(500).json({ error: 'Error en la base de datos' });
            } else {
              res.json({ historial: historialResult }); // Enviar el historial de partidas como respuesta
            }
          });
        } else {
          res.json({ historial: [] }); // Enviar un historial vacío si no se encuentra el jugador
        }
      }
    });
  });  
  

app.post('/create', (req, res) => {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    // insertamos el jugador en caso de que no exista
    // se valida que no exista el nombre y apellido en la base de datos
    db.query('SELECT * FROM jugadores WHERE nombre = ? AND apellido = ?', [nombre, apellido], (err, result) => {
        if (err) {
            // si hay un error se muestra en consola
            console.log(err);
        // si no hay error
        } else {
            // si el jugador existe se muestra un mensaje
            if (result.length > 0) {
                // si el jugador existe se guarda el id del jugador
                // y se guarda en la variable de sesion
                idJugador = result[0].id;
                res.send(result);
            // si el jugador no existe
            } else {
                // si el jugador no existe se inserta en la base de datos
                db.query('INSERT INTO jugadores (nombre, apellido) VALUES (?,?)', [nombre, apellido],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // se guarda el id del jugador
                        // y se guarda en la variable de sesion
                        idJugador = result.insertId;
                        res.send(result);
                    }
                });
            }
        }
    });
});

app.listen(3001, () => {
    console.log("Servidor corriendo en puerto 3001");
});