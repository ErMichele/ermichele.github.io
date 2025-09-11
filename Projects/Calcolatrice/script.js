const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const ButtonPress = new Audio("resources/SFX/Button-Press.mp3");

let input = '';
let badInput = false;

function updateDisplay() {
    display.value = input;
}

function calculate() {
    try {
        const expression = input.replace(/x/g, '*').replace(/÷/g, '/');
        const result = eval(expression);

        if (!isFinite(result) || isNaN(result)) {
            throw new Error('Invalid calculation');
        }

        input = result.toFixed(2);
        updateDisplay();
    } catch (error) {
        input = 'Errore';
        badInput = true;
        updateDisplay();
    }
}

function toggleSign() {
    input = input.startsWith('-') ? input.slice(1) : '-' + input;
    updateDisplay();
}

function backspace() {
    input = input.slice(0, -1);
    updateDisplay();
}

function applyPercentage() {
    try {
        const result = eval(input) / 100;
        if (!isFinite(result) || isNaN(result)) {
            throw new Error('Invalid calculation');
        }
        input = result.toString();
        updateDisplay();
    } catch {
        input = 'Errore';
        badInput = true;
        updateDisplay();
    }
}

function applySquareRoot() {
    try {
        const result = Math.sqrt(eval(input));
        if (!isFinite(result) || isNaN(result)) {
            throw new Error('Invalid calculation');
        }
        input = result.toString();
        updateDisplay();
    } catch (error) {
        input = 'Errore';
        badInput = true;
        updateDisplay();
    }
}

function applySquare() {
    try {
        const result = Math.pow(eval(input), 2);
        if (!isFinite(result) || isNaN(result)) {
            throw new Error('Invalid calculation');
        }
        input = result.toString();
        updateDisplay();
    } catch (error) {
        input = 'Errore';
        badInput = true;
        updateDisplay();
    }
}

function applyInverse() {
    try {
        const result = 1 / eval(input);
        if (!isFinite(result) || isNaN(result)) {
            throw new Error('Invalid calculation');
        }
        input = result.toString();
        updateDisplay();
    } catch (error) {
        input = 'Errore';
        badInput = true;
        updateDisplay();
    }
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        ButtonPress.play();
        const value = button.textContent;

        if (badInput) {
            input = '';
            badInput = false;
            updateDisplay();
        }

        switch (value) {
            case '=':
                calculate();
                break;
            case 'C':
                input = '';
                updateDisplay();
                break;
            case '←':
                backspace();
                break;
            case '+/-':
                toggleSign();
                break;
            case '%':
                applyPercentage();
                break;
            case '√':
                applySquareRoot();
                break;
            case 'x²':
                applySquare();
                break;
            case '1/x':
                applyInverse();
                break;
            case 'π':
                input += Math.PI.toString();
                updateDisplay();
                break;
            default:
                input += value;
                updateDisplay();
        }
    });
});

document.addEventListener('keydown', (e) => {
    const key = e.key;
    ButtonPress.play();

    if (badInput) {
        input = '';
        badInput = false;
        updateDisplay();
    }

    if (key === 'Enter') {
        calculate();
    } else if (key === 'Escape') {
        input = '';
        updateDisplay();
    } else if (key === 'Backspace') {
        backspace();
    } else if (!isNaN(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
        input += key;
        updateDisplay();
    }
});
