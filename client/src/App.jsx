import './App.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';

function App() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [historial, setHistorial] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  const add = () => {
    Axios.post('http://localhost:3001/jugadores', {
      nombre: nombre,
      apellido: apellido,
    }).then(response => {
      console.log(response.data.mensaje);
      alert(nombre + " " + apellido + " el juego va a comenzar");
      
      // Obtener preguntas y opciones
      Axios.get('http://localhost:3001/preguntas')
        .then(response => {
          setPreguntas(response.data.preguntas);
        })
        .catch(error => {
          console.error("Error al obtener las preguntas", error);
        });
    }).catch(error => {
      console.error("Error al guardar el jugador", error);
    });
  }
  

  const obtenerHistorial = () => {
    setHistorial(preguntas);
  }

  useEffect(() => {
    obtenerHistorial();
    Axios.get('http://localhost:3001/preguntas')
      .then(response => {
        setPreguntas(response.data.preguntas);
      })
      .catch(error => {
        console.error("Error al obtener las preguntas", error);
      });
    Axios.get('http://localhost:3001/jugadores')
      .then(response => {
        setJugadores(response.data.jugadores);
      })
      .catch(error => {
        console.error("Error al obtener los jugadores", error);
      });
  }, [nombre, apellido]);

  return (
    <div className="App">
      <div className="datos">
        <h1>Bienvenido a la trivia de cultura general</h1>
        <h2>Por favor ingrese los siguientes datos para iniciar</h2>
        <label>Nombre: <input
          onChange={(event) => {
            setNombre(event.target.value);
          }}
          type="text" /></label><br />
        <label>Apellido: <input
          onChange={(event) => {
            setApellido(event.target.value);
          }}
          type="text" /></label>
        <button onClick={add}>iniciar</button>
        <button onClick={obtenerHistorial}>Historial</button>
        
      </div>
      <div className="preguntas">
        <h2>Preguntas</h2>
        <ul>
          {preguntas.map((pregunta, index) => (
            <li key={index}>
              {pregunta.pregunta}
              <ul>
                {pregunta.opciones.map((opcion, index) => (
                  <li key={index}>{opcion}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="historial">
        <h2>Historial de {nombre} {apellido}</h2>
        <ul>
          {historial.map((historia, index) => (
            <li key={index}>
              {historia.pregunta}
            </li>
          ))}
        </ul>
      </div>
      <div className="jugadores">
        <h2>Lista de Jugadores</h2>
        <ul>
          {jugadores.map((jugador, index) => (
            <li key={index}>
              {jugador.nombre} {jugador.apellido}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
