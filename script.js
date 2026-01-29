// --- CONFIGURAZIONE GITHUB ---
const CONFIG = {
    user: "ErMichele",
    repo: "ermichele.github.io",
    folder: "poesie",
    branch: "development",
    charMap: {
        "[01]": "?",
        "[02]": "!",
        "[03]": ":",
        "_": " "
    }
};

// --- ANIMAZIONE PARTICELLE ---
const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
const settings = { particleCount: 120, particleSize: 2, connectionDistance: 120, mouseAttractionRange: 150, mouseForce: 0.03, baseSpeed: 0.4 };
let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; initParticles(); }
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
            let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < settings.mouseAttractionRange) {
                let force = (settings.mouseAttractionRange - dist) / settings.mouseAttractionRange;
                this.vx += dx * force * settings.mouseForce;
                this.vy += dy * force * settings.mouseForce;
            }
        }
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.97; this.vy *= 0.97;
        if (this.x > width || this.x < 0) this.vx *= -1;
        if (this.y > height || this.y < 0) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = '#00ffc3';
        ctx.beginPath(); ctx.arc(this.x, this.y, settings.particleSize, 0, Math.PI*2); ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for(let i=0; i<settings.particleCount; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0,0,width,height);
    particles.forEach((p, i) => {
        p.update(); p.draw();
        for(let j=i+1; j<particles.length; j++) {
            let dx = p.x - particles[j].x, dy = p.y - particles[j].y, d = Math.sqrt(dx*dx+dy*dy);
            if(d < settings.connectionDistance) {
                ctx.strokeStyle = `rgba(0, 255, 195, ${1 - d/settings.connectionDistance})`;
                ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}
resize(); animate();

const selector = document.getElementById('fileSelector');
const output = document.getElementById('terminalOutput');

// Funzione per pulire il nome del file
function decodeFileName(fileName) {
    let cleanName = fileName.replace(".txt", "");
    Object.keys(CONFIG.charMap).forEach(key => {
        cleanName = cleanName.split(key).join(CONFIG.charMap[key]);
    });
    return cleanName.toUpperCase();
}

async function loadPoesie() {
    try {
        const url = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.folder}?ref=${CONFIG.branch}`;
        const response = await fetch(url);
        const files = await response.json();

        selector.innerHTML = '<option value="" disabled selected>-- LISTA FILE --</option>';

        files.forEach(file => {
            if (file.name.endsWith('.txt')) {
                const option = document.createElement('option');
                option.value = file.download_url;
                option.textContent = decodeFileName(file.name);
                selector.appendChild(option);
            }
        });
    } catch (e) {
        selector.innerHTML = '<option>ERRORE API</option>';
    }
}

selector.addEventListener('change', async (e) => {
    const downloadUrl = e.target.value;
    const displayName = e.target.options[e.target.selectedIndex].text;

    output.innerHTML = `<span class="prompt">Reading system_log: ${displayName}...</span>`;

    try {
        const res = await fetch(downloadUrl);
        const content = await res.text();
        
        setTimeout(() => {
            output.innerHTML = `
                <div class="poem-title">/// SUBJECT: ${displayName}</div>
                <div class="poem-content">${content}</div>
                <br><span class="prompt">_ (EOF)</span>
            `;
        }, 400);
    } catch (err) {
        output.innerHTML = "ERRORE DI LETTURA.";
    }
});

// Init
loadPoesie();