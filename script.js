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

// --- EXPERIENCE SLIDER ---
let currentExpIndex = 0;
const expTrack = document.getElementById('experienceTrack');
const expFill = document.getElementById('expProgressFill');
const prevBtn = document.getElementById('prevExp');
const nextBtn = document.getElementById('nextExp');

function updateExpSlider() {
    const items = document.querySelectorAll('.experience-item');
    const total = items.length;
    expTrack.style.transform = `translateX(-${currentExpIndex * 100}%)`;
    expFill.style.width = `${((currentExpIndex + 1) / total) * 100}%`;
}

prevBtn.addEventListener('click', () => {
    const total = document.querySelectorAll('.experience-item').length;
    currentExpIndex = (currentExpIndex - 1 + total) % total;
    updateExpSlider();
});

nextBtn.addEventListener('click', () => {
    const total = document.querySelectorAll('.experience-item').length;
    currentExpIndex = (currentExpIndex + 1) % total;
    updateExpSlider();
});

// --- INTERACTIVE TERMINAL ---
const terminalInput = document.getElementById('terminalInput');
const terminalHistory = document.getElementById('terminalHistory');
const terminalBody = document.getElementById('terminalBody');
const inputArea = document.getElementById('inputArea');

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9vlBV7U-_EjEFRnbbDWNLycAyGqORC6LH0JIRs84FdJy6DCmC4nbprQSdntzWZ9XrSw/exec';
const DEFAULT_LOGS = [
    { name: 'INTRODUCTION.txt', content: 'This is my personal archive of poetry and thoughts.\nIt may differ from a standard STEM portfolio, but it is my own.' }
];

let VIRTUAL_FS = {};
let selectedIndex = -1;
let isSelectionMode = false;
let isTyping = false;

function typeWriter(element, text, speed = 15) {
    return new Promise(resolve => {
        let i = 0;
        element.classList.add('typing-cursor');
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tag = '';
                    while (text.charAt(i) !== '>' && i < text.length) { tag += text.charAt(i); i++; }
                    tag += '>'; i++;
                    element.innerHTML += tag;
                } else {
                    element.innerHTML += text.charAt(i); i++;
                }
                terminalBody.scrollTop = terminalBody.scrollHeight;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing-cursor');
                resolve();
            }
        }
        type();
    });
}

async function initializeFileSystem() {
    DEFAULT_LOGS.forEach(file => { VIRTUAL_FS[file.name] = file.content; });
    addLine("Initializing remote connection...");
    try {
        if (SCRIPT_URL && SCRIPT_URL !== '') {
            const response = await fetch(SCRIPT_URL);
            const remoteData = await response.json();
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
    addLine("Type 'help' to see available commands.");
}

const COMMANDS = {
    'help': () => "Available commands: ls, cat [file], sysinfo, clear, whoami. (Use Tab to autocomplete)",
    'sysinfo': () => {
        const uptime = Math.floor(performance.now() / 60000);
        return `<span class="output-highlight">OS:</span> ArchiveOS v1.0 <br><span class="output-highlight">Kernel:</span> 5.15.0-lowlevel <br><span class="output-highlight">Uptime:</span> ${uptime} minutes <br><span class="output-highlight">Environment:</span> C / Lua Development <br><span class="output-highlight">Host:</span> Michele_Brain_v2.4`;
    },
    'ls': () => {
        document.querySelectorAll('.output-ls.active').forEach(el => el.classList.remove('active'));
        const keys = Object.keys(VIRTUAL_FS);
        if (keys.length === 0) return "Archive is empty.";
        isSelectionMode = true;
        selectedIndex = 0;
        const fileList = keys.map((f, i) =>
            `<div class="file-item ${i === 0 ? 'selected' : ''}" data-index="${i}" onclick="runCat('${f}')">${f}</div>`
        ).join('');
        return { type: 'html', content: `<div class="output-ls active">${fileList}</div>` };
    },
    'cat': (args) => {
        if (!args[0]) return '<span class="output-error">Error: specify a file.</span>';
        const content = VIRTUAL_FS[args[0]];
        if (!content) return `<span class="output-error">Error: file '${args[0]}' not found.</span>`;
        const formatted = content.split('\n').map(line => {
            if (line.trim() === '') return '<div class="log-break"></div>';
            return `<div class="log-row">${line}</div>`;
        }).join('');
        return { type: 'text', content: `<div class="output-text">${formatted}</div>`, animate: true };
    },
    'clear': () => {
        terminalHistory.innerHTML = '';
        isSelectionMode = false;
        return null;
    },
    'whoami': () => "guest@archive - Limited Access"
};

async function runCat(filename) {
    if (isTyping) return;
    addLine(`cat ${filename}`, true);
    const result = COMMANDS['cat']([filename]);
    if (result) await addLine(result.content, false, result.animate);
    isSelectionMode = false;
    selectedIndex = -1;
    document.querySelectorAll('.output-ls.active').forEach(el => el.classList.remove('active'));
}

async function addLine(text, isInput = false, animate = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    terminalHistory.appendChild(line);
    if (isInput) {
        line.innerHTML = `<span class="prompt">guest@archive:~$</span> ${text}`;
        terminalBody.scrollTop = terminalBody.scrollHeight;
        return;
    }
    if (animate) {
        isTyping = true;
        terminalInput.disabled = true;
        inputArea.classList.add('disabled');
        await typeWriter(line, text);
        isTyping = false;
        terminalInput.disabled = false;
        inputArea.classList.remove('disabled');
        terminalInput.focus();
    } else {
        line.innerHTML = text;
    }
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function updateSelection() {
    const activeContainer = document.querySelector('.output-ls.active');
    if (!activeContainer) return;
    const items = activeContainer.querySelectorAll('.file-item');
    items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
}

// --- TAB COMPLETION LOGIC ---
terminalInput.addEventListener('keydown', async (e) => {
    if (isTyping) { e.preventDefault(); return; }
    const files = Object.keys(VIRTUAL_FS);
    if (e.key === 'Tab') {
        e.preventDefault();
        const value = terminalInput.value.trim();
        if (value.startsWith('cat ')) {
            const partial = value.substring(4).toLowerCase();
            const matches = files.filter(f => f.toLowerCase().startsWith(partial));
            if (matches.length === 1) {
                terminalInput.value = `cat ${matches[0]}`;
            } else if (matches.length > 1) {
                addLine(`cat ${partial}`, true);
                addLine(`<span class="output-info">Possible matches: ${matches.join(', ')}</span>`);
                let common = matches[0];
                for (let i = 1; i < matches.length; i++) {
                    while (!matches[i].toLowerCase().startsWith(common.toLowerCase()) && common !== "") {
                        common = common.slice(0, -1);
                    }
                }
                if (common.length > partial.length) terminalInput.value = `cat ${common}`;
            }
        }
        return;
    }
    if (isSelectionMode) {
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = (selectedIndex + 1) % files.length; updateSelection(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = (selectedIndex - 1 + files.length) % files.length; updateSelection(); return; }
        if (e.key === 'Enter' && terminalInput.value.trim() === '') { e.preventDefault(); await runCat(files[selectedIndex]); terminalInput.value = ''; return; }
    }
    if (e.key === 'Enter') {
        const rawInput = terminalInput.value.trim();
        const [cmd, ...args] = rawInput.split(' ');
        const commandKey = cmd.toLowerCase();
        if (rawInput) {
            isSelectionMode = false;
            document.querySelectorAll('.output-ls.active').forEach(el => el.classList.remove('active'));
            addLine(rawInput, true);
            if (COMMANDS[commandKey]) {
                const result = COMMANDS[commandKey](args);
                if (result !== null) {
                    if (typeof result === 'object') await addLine(result.content, false, result.animate);
                    else addLine(result);
                }
            } else { addLine(`<span class="output-error">Command not known: ${cmd}</span>`); }
        }
        terminalInput.value = '';
    }
});

terminalBody.addEventListener('click', () => { if (!isTyping) terminalInput.focus(); });

// --- NAVIGATION OBSERVER ---
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
document.getElementById('age').innerText = Math.abs(new Date(Date.now() - new Date('2009-12-02').getTime()).getUTCFullYear() - 1970);

window.onload = () => {
    resize();
    animate();
    initializeFileSystem();
    updateExpSlider();
};