// Calculator state
let currentValue = '0';
let previousValue = null;
let operation = null;
let resetScreen = false;
let calculationHistory = [];

// DOM elements
const displayCurrent = document.querySelector('.display .current');
const displayHistory = document.querySelector('.display .history');
const resultCard = document.querySelector('.result-card');
const resultValue = document.querySelector('.result-value');
const buttons = document.querySelectorAll('.btn');
const historyList = document.querySelector('.history-list');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particles setup
const particles = [];
const particleCount = 200;

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`
    });
}

// Mouse interaction
let mouseX = null;
let mouseY = null;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.x;
    mouseY = e.y;
});

canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

// Draw particles
function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Mouse interaction
        if (mouseX !== null && mouseY !== null) {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - distance) / 100;
                particle.x += Math.cos(angle) * force * 2;
                particle.y += Math.sin(angle) * force * 2;
            }
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    requestAnimationFrame(drawParticles);
}

drawParticles();

// Update display
function updateDisplay() {
    displayCurrent.textContent = currentValue;
    
    if (previousValue !== null && operation !== null) {
        displayHistory.textContent = `${previousValue} ${getOperationSymbol(operation)}`;
    } else {
        displayHistory.textContent = '';
    }
}

// Get operation symbol for display
function getOperationSymbol(op) {
    switch(op) {
        case 'add': return '+';
        case 'subtract': return '-';
        case 'multiply': return '×';
        case 'divide': return '÷';
        case 'percent': return '%';
        default: return '';
    }
}

// Add ripple effect to buttons
function createRipple(e) {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();
    
    button.appendChild(circle);
}

// Add click event to buttons
buttons.forEach(button => {
    button.addEventListener('click', createRipple);
    
    button.addEventListener('click', () => {
        if (button.dataset.value) {
            inputNumber(button.dataset.value);
        } else if (button.dataset.action) {
            handleAction(button.dataset.action);
        }
    });
});

// Handle number input
function inputNumber(number) {
    if (currentValue === '0' || resetScreen) {
        currentValue = number;
        resetScreen = false;
    } else {
        currentValue += number;
    }
    updateDisplay();
}

// Handle actions
function handleAction(action) {
    switch(action) {
        case 'clear':
            currentValue = '0';
            previousValue = null;
            operation = null;
            break;
            
        case 'backspace':
            if (currentValue.length > 1) {
                currentValue = currentValue.slice(0, -1);
            } else {
                currentValue = '0';
            }
            break;
            
        case 'negate':
            currentValue = String(parseFloat(currentValue) * -1);
            break;
            
        case 'percent':
            currentValue = String(parseFloat(currentValue) / 100);
            break;
            
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            if (previousValue === null) {
                previousValue = currentValue;
            } else if (!resetScreen) {
                calculate();
            }
            operation = action;
            resetScreen = true;
            break;
            
        case 'calculate':
            if (previousValue !== null && operation !== null) {
                calculate();
                operation = null;
                previousValue = null;
            }
            break;
    }
    updateDisplay();
}

// Perform calculation
function calculate() {
    let result;
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch(operation) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Add to history
    const historyItem = {
        expression: `${previousValue} ${getOperationSymbol(operation)} ${currentValue}`,
        result: result
    };
    
    calculationHistory.push(historyItem);
    addToHistoryPanel(historyItem);
    
    // Show result with animation
    showResult(result);
    
    currentValue = String(result);
    resetScreen = true;
}

// Add calculation to history panel
function addToHistoryPanel(item) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.textContent = `${item.expression} = ${item.result}`;
    historyList.prepend(historyItem);
    
    // Limit history items
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Show result with animation and effects
function showResult(result) {
    resultValue.textContent = result;
    resultCard.classList.add('show');
    
    // Create floating particles around result card
    for (let i = 0; i < 20; i++) {
        createFloatingParticle();
    }
    
    // Create confetti effect
    createConfetti();
    
    // Hide result card after 5 seconds
    setTimeout(() => {
        resultCard.classList.remove('show');
    }, 5000);
}

// Create floating particles around result
function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.classList.add('float-particle');
    
    const cardRect = resultCard.getBoundingClientRect();
    const x = cardRect.left + Math.random() * cardRect.width;
    const y = cardRect.top + Math.random() * cardRect.height;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    document.body.appendChild(particle);
    
    // Animate particle
    const animation = particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { 
            transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, 
            opacity: 0 
        }
    ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'ease-out'
    });
    
    animation.onfinish = () => particle.remove();
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = `${-10 - Math.random() * 20}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(confetti);
        
        // Animate confetti
        const animation = confetti.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { 
                transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, 
                opacity: 0 
            }
        ], {
            duration: 1000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Initialize display
updateDisplay();

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (/[0-9]/.test(e.key)) {
        inputNumber(e.key);
    } else if (e.key === '.') {
        inputNumber('.');
    } else if (e.key === '+') {
        handleAction('add');
    } else if (e.key === '-') {
        handleAction('subtract');
    } else if (e.key === '*') {
        handleAction('multiply');
    } else if (e.key === '/') {
        handleAction('divide');
    } else if (e.key === 'Enter' || e.key === '=') {
        handleAction('calculate');
    } else if (e.key === 'Escape') {
        handleAction('clear');
    } else if (e.key === 'Backspace') {
        handleAction('backspace');
    } else if (e.key === '%') {
        handleAction('percent');
    }
});