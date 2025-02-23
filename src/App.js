import React, { useState, useEffect } from 'react';

// Lista de países de Asia y sus capitales
const asianCountries = [
  { country: "Afganistán", capital: "Kabul" },
  { country: "Arabia Saudita", capital: "Riad" },
  { country: "Armenia", capital: "Ereván" },
  { country: "Azerbaiyán", capital: "Bakú" },
  { country: "Bahréin", capital: "Manama" },
  { country: "Bangladés", capital: "Daca" },
  { country: "Bután", capital: "Thimphu" },
  { country: "Birmania (Myanmar)", capital: "Naipyidó" },
  { country: "Brunei", capital: "Bandar Seri Begawan" },
  { country: "Camboya", capital: "Nom Pen" },
  { country: "China", capital: "Pekín" },
  { country: "Chipre", capital: "Nicosia" },
  { country: "Corea del Norte", capital: "Pionyang" },
  { country: "Corea del Sur", capital: "Seúl" },
  { country: "Emiratos Árabes Unidos", capital: "Abu Dabi" },
  { country: "Filipinas", capital: "Manila" },
  { country: "Georgia", capital: "Tiflis" },
  { country: "India", capital: "Nueva Delhi" },
  { country: "Indonesia", capital: "Yakarta" },
  { country: "Irán", capital: "Teherán" },
  { country: "Irak", capital: "Bagdad" },
  { country: "Israel", capital: "Jerusalén" },
  { country: "Japón", capital: "Tokio" },
  { country: "Jordania", capital: "Amán" },
  { country: "Kazajistán", capital: "Nursultán" },
  { country: "Kirguistán", capital: "Biskek" },
  { country: "Kuwait", capital: "Kuwait" },
  { country: "Laos", capital: "Vientián" },
  { country: "Líbano", capital: "Beirut" },
  { country: "Malasia", capital: "Kuala Lumpur" },
  { country: "Maldivas", capital: "Malé" },
  { country: "Mongolia", capital: "Ulán Bator" },
  { country: "Nepal", capital: "Katmandú" },
  { country: "Omán", capital: "Mascate" },
  { country: "Pakistán", capital: "Islamabad" },
  { country: "Rusia", capital: "Moscú" },
  { country: "Siria", capital: "Damasco" },
  { country: "Sri Lanka", capital: "Sri Jayawardenapura Kotte" },
  { country: "Tayikistán", capital: "Dusambé" },
  { country: "Tailandia", capital: "Bangkok" },
  { country: "Timor Oriental", capital: "Dili" },
  { country: "Turquía", capital: "Ankara" },
  { country: "Turkmenistán", capital: "Asjabad" },
  { country: "Uzbekistán", capital: "Taskent" },
  { country: "Vietnam", capital: "Hanói" },
  { country: "Yemen", capital: "Saná" }
];

// Función para barajar un arreglo (algoritmo Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Función para generar preguntas según los requisitos
function generateQuestions() {
  const shuffledCountries = shuffle(asianCountries);
  const midIndex = Math.floor(shuffledCountries.length / 2);

  // Preguntas tipo “¿Cuál es la capital de [país]?”
  const capitalQuestions = shuffledCountries.slice(0, midIndex).map(item => {
    const correct = item.capital;
    // Opciones incorrectas: capitales de otros países (sin incluir la correcta)
    const capitalsPool = shuffle(asianCountries.filter(c => c.capital !== correct).map(c => c.capital));
    const options = shuffle([correct, capitalsPool[0], capitalsPool[1], capitalsPool[2]]);
    return {
      type: "capital",
      question: `¿Cuál es la capital de ${item.country}?`,
      correctAnswer: correct,
      options: options,
      associated: item.country
    };
  });

  // Preguntas tipo “La capital [capital] corresponde a qué país?”
  const countryQuestions = shuffledCountries.slice(midIndex).map(item => {
    const correct = item.country;
    // Opciones incorrectas: otros países (sin incluir el correcto)
    const countriesPool = shuffle(asianCountries.filter(c => c.country !== correct).map(c => c.country));
    const options = shuffle([correct, countriesPool[0], countriesPool[1], countriesPool[2]]);
    return {
      type: "country",
      question: `La capital ${item.capital} corresponde a qué país?`,
      correctAnswer: correct,
      options: options,
      associated: item.capital
    };
  });

  // Combina ambas mitades y baraja el orden final de las preguntas
  return shuffle([...capitalQuestions, ...countryQuestions]);
}

const App = () => {
  // Estados de la aplicación
  const [quizState, setQuizState] = useState('select'); // 'select', 'quiz', 'result'
  const [difficulty, setDifficulty] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState(15000);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Al iniciar el quiz, se reinician los valores y se genera el listado de preguntas
  const startTest = (level) => {
    let time;
    switch (level) {
      case 'principiante':
        time = 15000;
        break;
      case 'intermedio':
        time = 10000;
        break;
      case 'avanzado':
        time = 7000;
        break;
      default:
        time = 15000;
    }
    setDifficulty(level);
    setTimePerQuestion(time);
    setQuestions(generateQuestions());
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setQuizState('quiz');
    setTimeRemaining(time);
  };

  // Función para reiniciar el test (volver a la pantalla de selección)
  const restartTest = () => {
    setQuizState('select');
    setDifficulty(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setTimeRemaining(0);
  };

  // Controla el temporizador de cada pregunta
  useEffect(() => {
    if (quizState !== 'quiz') return;
    if (timeRemaining <= 0) {
      // Si se agota el tiempo, se registra como "Sin respuesta"
      recordAnswer(null);
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 100);
    }, 100);
    return () => clearInterval(timer);
  }, [timeRemaining, quizState]);

  // Función para registrar la respuesta seleccionada o la falta de respuesta
  const recordAnswer = (selected) => {
    const current = questions[currentQuestionIndex];
    const isCorrect = selected === current.correctAnswer;
    const answerRecord = {
      question: current.question,
      selected: selected ? selected : "Sin respuesta",
      correctAnswer: current.correctAnswer,
      isCorrect: !!selected && isCorrect
    };
    if (selected && isCorrect) {
      setScore(prev => prev + 1);
    }
    setUserAnswers(prev => [...prev, answerRecord]);
    // Avanzar a la siguiente pregunta o finalizar
    if (currentQuestionIndex + 1 >= questions.length) {
      setQuizState('result');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(timePerQuestion);
    }
  };

  // Función para calcular la calificación final
  const getGrade = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "Excelente";
    else if (percentage >= 70) return "Bueno";
    else return "Necesita mejorar";
  };

  // Renderizado según el estado del quiz
  if (quizState === 'select') {
    return (
      <div style={styles.container}>
        <h1>Test de Países y Capitales de Asia</h1>
        <h2>Seleccione el nivel de dificultad</h2>
        <button style={styles.button} onClick={() => startTest('principiante')}>
          Principiante (15 s)
        </button>
        <button style={styles.button} onClick={() => startTest('intermedio')}>
          Intermedio (10 s)
        </button>
        <button style={styles.button} onClick={() => startTest('avanzado')}>
          Avanzado (7 s)
        </button>
      </div>
    );
  }

  if (quizState === 'quiz') {
    const current = questions[currentQuestionIndex];
    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    const timerPercent = (timeRemaining / timePerQuestion) * 100;
    return (
      <div style={styles.quizContainer}>
        <h2>{current.question}</h2>
        <div style={styles.optionsContainer}>
          {current.options.map((option, index) => (
            <button
              key={index}
              style={styles.optionButton}
              onClick={() => recordAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div style={styles.barContainer}>
          <div style={{ ...styles.timerBar, width: `${timerPercent}%` }}></div>
        </div>
        <div style={styles.barContainer}>
          <div style={{ ...styles.progressBar, width: `${progressPercent}%` }}></div>
        </div>
      </div>
    );
  }

  if (quizState === 'result') {
    const wrongAnswers = userAnswers.filter(ans => !ans.isCorrect);
    return (
      <div style={styles.container}>
        <h2>Resultados</h2>
        <p>Puntuación: {score} de {questions.length}</p>
        <h3>Calificación: {getGrade()}</h3>
        <h4>Errores:</h4>
        {wrongAnswers.length === 0 ? (
          <p>No cometiste errores, ¡excelente desempeño!</p>
        ) : (
          wrongAnswers.map((ans, index) => (
            <p key={index}>
              {index + 1}. {ans.question} - Tu respuesta: {ans.selected} | Correcta: {ans.correctAnswer}
            </p>
          ))
        )}
        <button style={styles.button} onClick={restartTest}>
          Reiniciar Test
        </button>
      </div>
    );
  }

  return null;
};

// Estilos en línea para la aplicación
const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto'
  },
  quizContainer: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  button: {
    padding: '10px 15px',
    margin: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    background: '#3498db',
    color: '#fff',
    fontSize: '1em'
  },
  optionsContainer: {
    marginTop: '20px'
  },
  optionButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: 'none',
    borderRadius: '5px',
    background: '#3498db',
    color: '#fff',
    cursor: 'pointer'
  },
  barContainer: {
    background: '#e0e0e0',
    borderRadius: '5px',
    height: '20px',
    margin: '15px 0',
    overflow: 'hidden'
  },
  timerBar: {
    height: '100%',
    background: '#e74c3c'
  },
  progressBar: {
    height: '100%',
    background: '#3498db'
  }
};

export default App;