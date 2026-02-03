// --- PHYSICS BACKGROUND ---
const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
const settings = {
    particleCount: window.innerWidth < 768 ? 50 : 120,
    particleSize: 1.5,
    connectionDistance: 130,
    mouseAttractionRange: 180,
    mouseForce: 0.05,
    baseSpeed: 0.5
};
let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', () => {
    settings.mouseForce = -0.2;
    setTimeout(() => settings.mouseForce = 0.05, 400);
});

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * settings.baseSpeed;
        this.vy = (Math.random() - 0.5) * settings.baseSpeed;
    }
    update() {
        if (mouse.x != null) {
            let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < settings.mouseAttractionRange) {
                let force = (settings.mouseAttractionRange - dist) / settings.mouseAttractionRange;
                this.vx += dx * force * settings.mouseForce;
                this.vy += dy * force * settings.mouseForce;
            }
        }
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.98; this.vy *= 0.98;
        if (this.x > width) this.x = 0; else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0; else if (this.y < 0) this.y = height;
    }
    draw() {
        ctx.fillStyle = '#00ffc3';
        ctx.beginPath(); ctx.arc(this.x, this.y, settings.particleSize, 0, Math.PI * 2); ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < settings.particleCount; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
        p.update(); p.draw();
        for (let j = i + 1; j < particles.length; j++) {
            let dx = p.x - particles[j].x, dy = p.y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < settings.connectionDistance) {
                ctx.strokeStyle = `rgba(0, 255, 195, ${(1 - d / settings.connectionDistance) * 0.3})`;
                ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

// --- INTERACTIVE TERMINAL ---
const terminalInput = document.getElementById('terminalInput');
const terminalHistory = document.getElementById('terminalHistory');
const terminalBody = document.getElementById('terminalBody');

const SCRIPT_URL = '';
const DEFAULT_LOGS = [
    { name: 'Introduction.txt', content: 'This is my personal archive of poetry and thoughts. It may differ from a standard developer portfolio, but it is my own.' },
    { name: 'Poem1.txt', content: 'Roses are red,\nViolets are blue,\nCode is poetry,\nAnd so are you.' },
];

let VIRTUAL_FS = {};
let selectedIndex = -1;
let isSelectionMode = false;

async function fetchWithRetry(url, retries = 5, delay = 1000) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return fetchWithRetry(url, retries - 1, delay * 2);
        }
        throw error;
    }
}

async function initializeFileSystem() {
    DEFAULT_LOGS.forEach(file => { VIRTUAL_FS[file.name] = file.content; });
    addLine("Initializing remote connection...");
    try {
        if (SCRIPT_URL && SCRIPT_URL !== '') {
            const remoteData = await fetchWithRetry(SCRIPT_URL);
            if (Array.isArray(remoteData)) {
                remoteData.forEach(file => { VIRTUAL_FS[file.name] = file.content; });
                addLine("<span style='color: #00ffc3'>Remote archive synced successfully.</span>");
            }
        } else {
            addLine("<span style='color: #ff9d00'>Notice: Running in local mode.</span>");
        }
    } catch (err) {
        addLine("<span class='output-error'>Warning: Sync failed. Using cached files.</span>");
    }
    addLine("Type 'ls' to see files. Use arrows to select.");
}

const COMMANDS = {
    'help': () => "Available: ls, cat [file], clear, whoami. (Use arrows in ls mode)",
    'ls': () => {
        const keys = Object.keys(VIRTUAL_FS);
        if (keys.length === 0) return "Archive is empty.";
        
        isSelectionMode = true;
        selectedIndex = 0;
        
        const fileList = keys.map((f, i) => 
            `<div class="file-item ${i === 0 ? 'selected' : ''}" data-index="${i}" onclick="runCat('${f}')">${f}</div>`
        ).join('');
        
        return `<div class="output-ls" id="ls-container">${fileList}</div>`;
    },
    'cat': (args) => {
        if (!args[0]) return '<span class="output-error">Error: specify a file.</span>';
        const content = VIRTUAL_FS[args[0]];
        if (!content) return `<span class="output-error">Error: '${args[0]}' not found.</span>`;
        return `<div class="output-text">${content.replace(/\n/g, '<br>')}</div>`;
    },
    'clear': () => {
        terminalHistory.innerHTML = '';
        isSelectionMode = false;
        return null;
    },
    'whoami': () => "guest@archive - Limited Access"
};

function runCat(filename) {
    addLine(`cat ${filename}`, true);
    const output = COMMANDS['cat']([filename]);
    addLine(output);
    isSelectionMode = false;
    selectedIndex = -1;
}

function updateSelection() {
    const items = document.querySelectorAll('.file-item');
    items.forEach((item, i) => {
        item.classList.toggle('selected', i === selectedIndex);
    });
}

function addLine(text, isInput = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (isInput) {
        line.innerHTML = `<span class="prompt">guest@archive:~$</span> ${text}`;
    } else {
        line.innerHTML = text;
    }
    terminalHistory.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

terminalInput.addEventListener('keydown', (e) => {
    const keys = Object.keys(VIRTUAL_FS);

    if (isSelectionMode) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % keys.length;
            updateSelection();
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + keys.length) % keys.length;
            updateSelection();
            return;
        }
        if (e.key === 'Enter' && terminalInput.value.trim() === '') {
            e.preventDefault();
            runCat(keys[selectedIndex]);
            terminalInput.value = '';
            return;
        }
    }

    if (e.key === 'Enter') {
        const rawInput = terminalInput.value.trim();
        const [cmd, ...args] = rawInput.toLowerCase().split(' ');

        if (rawInput) {
            isSelectionMode = false;
            addLine(rawInput, true);
            if (COMMANDS[cmd]) {
                const output = COMMANDS[cmd](args);
                if (output !== null) addLine(output);
            } else {
                addLine(`<span class="output-error">Command not known: ${cmd}</span>`);
            }
        }
        terminalInput.value = '';
    }
});

terminalBody.addEventListener('click', () => terminalInput.focus());

// --- NAVIGATION ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.nav-node').forEach(node => {
                const href = node.getAttribute('href');
                if (href) node.classList.toggle('active', href.substring(1) === entry.target.id);
            });
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('section').forEach(section => observer.observe(section));

window.onload = () => {
    resize();
    animate();
    initializeFileSystem();
};