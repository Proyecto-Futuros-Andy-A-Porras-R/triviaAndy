import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './App.css';

function App() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [preguntas, setPreguntas] = useState([]);
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [historialRespuestas, setHistorialRespuestas] = useState({});
  const [indicePreguntaActual, setIndicePreguntaActual] = useState(0);
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({});

  

  const iniciarTrivia = () => {
    //Mensaje que inició la trivia
    if(nombre === "" || apellido === ""){
      alert("Por favor ingrese su nombre y apellido");
    } else {
      alert(`Iniciando la trivia ${nombre} ${apellido}`);
      obtenerPreguntas();
      setMostrarPreguntas(true);
      setIndicePreguntaActual(0);
      setRespuestasSeleccionadas({});
      setRespuestasCorrectas(0);
      //la variable historialRespuestas se reinicia
      setHistorialRespuestas({});
    }
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
    if (preguntas.length > preguntaIndex) {
      const pregunta = preguntas[preguntaIndex];
      const respuestaCorrecta = pregunta.respuesta_correcta;
  
      setRespuestasSeleccionadas(prevRespuestasSeleccionadas => ({
        ...prevRespuestasSeleccionadas,
        [preguntaIndex]: respuestaSeleccionada
      }));
  
      if (respuestaSeleccionada === respuestaCorrecta) {
        setRespuestasCorrectas(prevRespuestasCorrectas => prevRespuestasCorrectas + 1);
      }
    }
  };
  

  const guardarHistorialEnBackend = () => {
    const jugadorRespuestas = respuestasSeleccionadas;

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
    Axios.get(`http://localhost:3001/historial/${nombre}/${apellido}`)
    .then(response => {
      setHistorialRespuestas(response.data.historial);
      // setIndiceRespuestaActual(0); // Configurar el índice de la respuesta actual al primer elemento
    })
    .catch(error => {
      console.error("Error al obtener el historial", error);
    });
  };

  useEffect(() => {
    obtenerPreguntas();
  }, []);
  

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
            <h2>Preguntas {indicePreguntaActual + 1}</h2>
            <p>{preguntas[indicePreguntaActual].pregunta}</p>
            <ul>
            {preguntas[indicePreguntaActual].opciones.map((opcion, opcionIndex) => (
              <li key={opcionIndex}>
                <label>
                  <input
                    type="radio"
                    name={`pregunta${indicePreguntaActual}`}
                    value={opcion}
                    checked={
                      respuestasSeleccionadas[indicePreguntaActual] === opcion ||
                      (respuestasSeleccionadas[indicePreguntaActual] === undefined &&
                        respuestasSeleccionadas[indicePreguntaActual] === opcion)
                    } // Verifica si esta opción está seleccionada en el estado o si no hay selección actual
                    onClick={() => responderPregunta(indicePreguntaActual, opcion)} // Cambiado onClick por onChange
                  />
                  {opcion}
                </label>
              </li>
            ))}
            </ul>
            <dir>
              <button onClick={() => setIndicePreguntaActual(indicePreguntaActual - 1)} disabled={indicePreguntaActual === 0}>
                Anterior
              </button>
              <button
              onClick={() => {
                  setIndicePreguntaActual(indicePreguntaActual + 1);
                   // Reinicia la respuesta seleccionada  
                }
              }
              disabled={indicePreguntaActual === preguntas.length - 1}
            >
              Siguiente
            </button>
            </dir>
            {/* // Mostrar el botón de guardar respuestas solo cuando se hayan respondido todas las preguntas */}
            {Object.keys(respuestasSeleccionadas).length === preguntas.length && (
              <button onClick={guardarHistorialEnBackend}>Guardar Respuestas</button>
            )}
          </>
        )}
        {/*Boton para mostrar el historial */}
        {!mostrarPreguntas && (
          <button onClick={mostrarHistorial}>Historial de respuestas</button>
        )}
         {/* Mostrar el historial de respuestas */}
         {Object.keys(historialRespuestas).length > 0 && !mostrarPreguntas &&(
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
