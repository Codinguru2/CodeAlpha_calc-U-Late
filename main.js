document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelector('.calculator-buttons');

    // State object to track the calculator's current status
    let calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };

    // --- Core Functions ---

    function updateDisplay() {
        display.value = calculator.displayValue;
    }

    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;

        if (waitingForSecondOperand === true) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    function inputDecimal(dot) {
        // If we are waiting for a new operand, start with '0.'
        if (calculator.waitingForSecondOperand === true) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        // Prevent multiple decimals in one number
        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    }

    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
    }

    // --- Calculation Logic ---

    const operations = {
        '+': (first, second) => first + second,
        '-': (first, second) => first - second,
        '×': (first, second) => first * second,
        '÷': (first, second) => first / second,
    };

    function performCalculation() {
        const { firstOperand, displayValue, operator } = calculator;
        const secondOperand = parseFloat(displayValue);

        // If no operator or waiting for second operand, there's nothing to calculate yet
        if (operator === null || calculator.waitingForSecondOperand) {
            return;
        }

        // Handle division by zero
        if (operator === '÷' && secondOperand === 0) {
            calculator.displayValue = 'Error: Div by 0';
            calculator.firstOperand = null;
            calculator.operator = null;
            calculator.waitingForSecondOperand = true;
            return;
        }

        const result = operations[operator](firstOperand, secondOperand);
        
        // Format result: limit precision and remove trailing zeros
        const finalResult = String(parseFloat(result.toFixed(8))); 
        
        calculator.displayValue = finalResult;
        calculator.firstOperand = parseFloat(finalResult); // Store result for chained operations
        calculator.waitingForSecondOperand = true; // Ready for new operation/number
    }

    function handleOperator(nextOperator) {
        const inputValue = parseFloat(calculator.displayValue);

        // If we have a stored result and pressed a new operator, or if we just pressed equals
        if (nextOperator === '=') {
            // Only perform calculation if we have a first operand and an operator
            if (calculator.firstOperand !== null && calculator.operator !== null) {
                performCalculation();
                calculator.operator = null; // Clear operator after equals
            }
            return;
        }

        // Handle other operators (+, -, ×, ÷)
        if (calculator.firstOperand === null) {
            // No first operand yet, so set the current input as the first operand
            calculator.firstOperand = inputValue;
        } else if (calculator.operator) {
            // An operator is already set, so chain the calculation
            performCalculation();
        }
        
        // Set the new operator and wait for the second operand
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    // --- Event Listeners ---
    
    // Main Button Click Handler
    buttons.addEventListener('click', (event) => {
        const { target } = event;

        if (!target.matches('button')) return;

        if (target.classList.contains('number')) {
            inputDigit(target.textContent);
        } else if (target.classList.contains('decimal')) {
            inputDecimal('.');
        } else if (target.classList.contains('clear')) {
            resetCalculator();
        } else if (target.classList.contains('operator') || target.classList.contains('equals')) {
            // Pass the symbol (e.g., '+', '=', '×') to the handler
            handleOperator(target.textContent); 
        }

        updateDisplay();
    });

    // Bonus Task: Keyboard Support
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (/[0-9]/.test(key)) {
            inputDigit(key);
        } else if (key === '.') {
            inputDecimal('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            // Map keyboard keys to the display symbols for consistent logic
            const operatorMap = { '+': '+', '-': '-', '*': '×', '/': '÷' };
            handleOperator(operatorMap[key]);
        } else if (key === 'Enter' || key === '=') {
            // Use '=' for calculation
            handleOperator('=');
            event.preventDefault(); // Prevents "Enter" key behavior like clicking the last focused button
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            resetCalculator();
        } else {
            return; 
        }
        
        updateDisplay();
    });

    // Initial display update
    updateDisplay();
});