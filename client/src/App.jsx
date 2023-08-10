import './App.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';

function App() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [preguntas, setPreguntas] = useState([]);
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
  const [historialRespuestas, setHistorialRespuestas] = useState({});
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);

  const add = () => {
    Axios.post('http://localhost:3001/jugadores', {
      nombre: nombre,
      apellido: apellido,
    }).then(response => {
      console.log(response.data.mensaje);
      obtenerPreguntas();
    }).catch(error => {
      console.error("Error al guardar el jugador", error);
    });
  }

  const obtenerPreguntas = () => {
    Axios.get('http://localhost:3001/preguntas')
      .then(response => {
        setPreguntas(response.data.preguntas);
        setMostrarPreguntas(true);
      })
      .catch(error => {
        console.error("Error al obtener las preguntas", error);
      });
  }

  const responderPregunta = (preguntaIndex, respuestaSeleccionada) => {
    const pregunta = preguntas[preguntaIndex];
    const respuestaCorrecta = pregunta.respuesta_correcta;

    if (respuestaSeleccionada === respuestaCorrecta) {
      setRespuestasCorrectas(prevRespuestasCorrectas => prevRespuestasCorrectas + 1);
    }
  };

  const guardarHistorialEnBackend = () => {
    const jugadorRespuestas = {};
    preguntas.forEach((pregunta, index) => {
      const selectedOption = document.querySelector(`input[name=pregunta${index}]:checked`);
      if (selectedOption) {
        const respuestaSeleccionada = selectedOption.value;
        jugadorRespuestas[index] = respuestaSeleccionada;
      }
    });

    const puntos = respuestasCorrectas;

    Axios.post('http://localhost:3001/historial', {
      nombre: nombre,
      apellido: apellido,
      respuestas: jugadorRespuestas,
      respuestasCorrectas: respuestasCorrectas,
      puntos: puntos
    }).then(response => {
      console.log(response.data); // Mensaje del servidor
    }).catch(error => {
      console.error("Error al guardar el historial", error);
    });
    if (puntos > 6) {
      alert(`¡Felicitaciones ${nombre}! Has respondido correctamente ${puntos} preguntas`);
    }
    else {
      alert(`¡Lo siento ${nombre}! Has respondido correctamente ${puntos} preguntas`);
    }
  };

  useEffect(() => {
    if (mostrarPreguntas) {
      guardarHistorialEnBackend();
    }
  }, [mostrarPreguntas]);

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
        <button onClick={add}>Iniciar</button>
        {mostrarPreguntas && (
          <div className="preguntas">
            <h2>Preguntas</h2>
            <ul>
              {preguntas.map((pregunta, index) => (
                <li key={index}>
                  <p>{pregunta.pregunta}</p>
                  <ul>
                    {pregunta.opciones.map((opcion, opcionIndex) => (
                      <li key={opcionIndex}>
                        <label>
                          <input
                            type="radio"
                            name={`pregunta${index}`}
                            value={opcion}
                            onClick={() => responderPregunta(index, opcion)} />
                          {opcion}
                        </label>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <button onClick={guardarHistorialEnBackend}>Guardar Respuestas</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
