import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './App.css';


function App() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [historialRespuestas, setHistorialRespuestas] = useState({});

  const iniciarTrivia = () => {
    //Mensaje que inició la trivia
    alert("Iniciando la trivia");
    obtenerPreguntas();
    setMostrarPreguntas(true);
  };

  const obtenerPreguntas = () => {
    Axios.get('http://localhost:3001/preguntas')
      .then(response => {
        setPreguntas(response.data.preguntas);
      })
      .catch(error => {
        console.error("Error al obtener las preguntas", error);
      });
  };
  const responderPregunta = (preguntaIndex, respuestaSeleccionada) => {
    const pregunta = preguntas[preguntaIndex];
    const respuestaCorrecta = pregunta.respuesta_correcta;

    if (respuestaSeleccionada === respuestaCorrecta) {
      // Incrementamos el contador de respuestas correctas
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
    
    // Enviar respuestas a través de Axios al endpoint de historial
    Axios.post('http://localhost:3001/historial', {
      nombre: nombre,
      apellido: apellido,
      respuestas: jugadorRespuestas,
      puntos: puntos
    }).then(response => {
      console.log(response.data); // Mensaje del servidor
      if (puntos > 6) {
        alert(`¡Felicitaciones ${nombre}! Has respondido correctamente ${puntos} preguntas`);
      } else {
        alert(`¡Lo siento ${nombre}! Has respondido correctamente ${puntos} preguntas`);
      }
    }).catch(error => {
      console.error("Error al guardar el historial", error);
    });
    setMostrarPreguntas(false);
  };
  const mostrarHistorial = () => {
    // Obtener el historial de respuestas a través de Axios
    // se usar la direccion /historial/:nombre/:apellido
    Axios.get(`http://localhost:3001/historial/${nombre}/${apellido}`)
      .then(response => {
        setHistorialRespuestas(response.data.historial);
      }
      ).catch(error => {
        console.error("Error al obtener el historial", error);
      });
  };

  return (
    <div className="App">
      <div className="datos">
        <h1>Bienvenido a la trivia de cultura general</h1>
        <h2>Por favor ingrese los siguientes datos</h2>
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
        {!mostrarPreguntas && (
          <button onClick={iniciarTrivia}>Iniciar</button>
        )}
        {mostrarPreguntas && (
          <>
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
          </>
        )}
        <button onClick={mostrarHistorial}>Historial de respuestas</button>
        {/* Mostrar el historial de respuestas */}
        {Object.keys(historialRespuestas).length > 0 && (
          <div className="historial">
            <h2>Historial de respuestas</h2>
            <ul>
              {Object.entries(historialRespuestas).map(([timestamp, data]) => (
                <li key={timestamp}>
                  <p>Fecha y hora: {new Date(Number(timestamp)).toLocaleString()}</p>
                  <p>Nombre: {nombre}</p>
                  <p>Apellido: {apellido}</p>
                  <p>Puntos: {data.puntos}</p>
                  <p>Respuestas:</p>
                  <ul>
                    {Object.entries(data.respuestas).map(([preguntaIndex, respuesta]) => (
                      <li key={preguntaIndex}>
                        Pregunta {parseInt(preguntaIndex) + 1}: {respuesta}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
