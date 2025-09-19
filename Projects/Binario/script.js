const binaryLabel = document.getElementById('Numero-Binario');
const decimalInput = document.getElementById('Numero-Decimale');
const resultDiv = document.getElementById('Risultato');
const submitButton = document.getElementById('Invio');

// Variabili per il controllo dei tentativi
let attemptCount = 0;
const maxAttempts = 3;

// 
const correctSound = new Audio('Resources/SFX/Right-Answer.mp3');
const wrongSound = new Audio('Resources/SFX/Wrong-Answer.mp3');

// Funzione per generare un numero casuale e mostrarlo in binario
function generateRandomBinary() {
    const randomNumber = Math.floor(Math.random() * 256); // 0-255
    binaryLabel.textContent = randomNumber.toString(2);
    binaryLabel.dataset.decimal = randomNumber; // Salva il valore decimale per il controllo
    decimalInput.value = '';
    resultDiv.textContent = '';
}

// Funzione per controllare la risposta
function checkAnswer() {
    const correctDecimal = binaryLabel.dataset.decimal;
    
    // Verifica la risposta
    if (decimalInput.value === correctDecimal) {
        correctSound.play();
        resultDiv.textContent = 'Risposta corretta! La aula successiva è la 4.';
        resultDiv.style.color = 'green';
        attemptCount = 0;
    } else {
        wrongSound.play();
        attemptCount++;

        // Se sono stati fatti troppi tentativi errati, cambia il numero
        if (attemptCount >= maxAttempts) {
            generateRandomBinary();
            resultDiv.textContent = `Hai provato ${maxAttempts} volte senza successo. Ora cambio il numero!`;
            resultDiv.style.color = 'red';
            attemptCount = 0;
        } else {
            resultDiv.textContent = `Sbagliato, riprova. Tentativi rimasti con questo numero: ${maxAttempts - attemptCount}`;
            resultDiv.style.color = 'orange';
        }
    }
}

submitButton.addEventListener('click', checkAnswer);

// Evento che rileva il cambio visibilità della scheda
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        generateRandomBinary();
    }
});

generateRandomBinary();


// Per test rapido, nella console del broswer esegui: document.getElementById('Numero-Binario').dataset.decimal per ottenere il valore decimale velocemente.
// Per test rapido, nella console del broswer esegui: document.getElementById('Numero-Decimale').value = 'valore' per inserire un valore decimale.