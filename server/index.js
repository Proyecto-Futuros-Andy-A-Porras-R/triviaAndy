const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());

const jugadoresFilePath = path.join(__dirname, 'data', 'jugadores.json');

// Endpoint para obtener preguntas
app.get('/preguntas', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'preguntas.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener las preguntas' });
    } else {
      const preguntas = JSON.parse(data);
      res.json({ preguntas });
    }
  });
});

// Endpoint para obtener y guardar jugadores
app.get('/jugadores', (req, res) => {
    fs.readFile(jugadoresFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Error al obtener los jugadores' });
        } else {
          console.log(data); // Agregar esta línea
          const jugadores = JSON.parse(data);
          res.json({ jugadores });
        }
      });
    });
          

  app.post('/jugadores', (req, res) => {
    fs.readFile(jugadoresFilePath, 'utf8', (err, data) => {
      if (err) {
        // Si el archivo no existe, se crea y se agrega el primer jugador
        const jugadores = [{ nombre: req.body.nombre, apellido: req.body.apellido }];
        fs.writeFile(jugadoresFilePath, JSON.stringify(jugadores), 'utf8', err => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al guardar el jugador' });
          } else {
            res.json({ mensaje: 'Jugador guardado con éxito' });
          }
        });
      } else {
        const jugadores = JSON.parse(data);
        const jugadorExistente = jugadores.find(jugador =>
          jugador.nombre === req.body.nombre && jugador.apellido === req.body.apellido
        );
        if (!jugadorExistente) {
          jugadores.push({ nombre: req.body.nombre, apellido: req.body.apellido });
          fs.writeFile(jugadoresFilePath, JSON.stringify(jugadores), 'utf8', err => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: 'Error al guardar el jugador' });
            } else {
              res.json({ mensaje: 'Jugador guardado con éxito' });
            }
          });
        } else {
          res.json({ mensaje: 'El jugador ya existe' });
        }
      }
    });
  });
  

// Ruta para servir los archivos estáticos de React
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Ruta para cualquier otra solicitud - sirve el archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
