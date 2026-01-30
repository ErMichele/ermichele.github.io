const CONFIG = {
    user: "ErMichele",
    repo: "ermichele.github.io",
    branch: "Development",
    folder: "poesie",
    updateFrequency: 24 * 60 * 60 * 1000,
    charMap: {
        "[01]": "?",
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

// --- LOGICA DI DECODIFICA NOMI ---
function cleanName(fileName) {
    let name = fileName.replace(".txt", "");
    for (let key in CONFIG.charMap) {
        name = name.split(key).join(CONFIG.charMap[key]);
    }
    return name.toUpperCase();
}

// --- GESTORE AGGIORNAMENTI (GIORNALIERO) ---
async function fetchWithCache() {
    const lastCheck = localStorage.getItem('last_sync');
    const cachedManifest = localStorage.getItem('manifest_data');
    const now = Date.now();

    // Se abbiamo la cache e non è passata una giornata, non disturbare il server
    if (cachedManifest && lastCheck && (now - lastCheck < CONFIG.updateFrequency)) {
        console.log("/// LOG: Caricamento da cache locale (Sync OK)");
        renderMenu(JSON.parse(cachedManifest));
        return;
    }

    console.log("/// LOG: Controllo aggiornamenti nel branch " + CONFIG.branch);
    
    // Costruiamo l'URL "Raw" per evitare i blocchi dell'API di GitHub
    const manifestUrl = `https://raw.githubusercontent.com/${CONFIG.user}/${CONFIG.repo}/${CONFIG.branch}/${CONFIG.folder}/manifest.json`;

    try {
        const response = await fetch(manifestUrl);
        if (!response.ok) throw new Error("Manifest non trovato");
        
        const data = await response.json();
        
        // Salviamo in locale
        localStorage.setItem('manifest_data', JSON.stringify(data.files));
        localStorage.setItem('last_sync', now);
        
        renderMenu(data.files);
    } catch (err) {
        console.error("/// ERRORE SYNC:", err);
        if (cachedManifest) renderMenu(JSON.parse(cachedManifest));
    }
}

function renderMenu(files) {
    const selector = document.getElementById('fileSelector');
    if(!selector) return;
    
    selector.innerHTML = '<option value="" disabled selected>-- SELEZIONA LOG --</option>';
    files.forEach(file => {
        const opt = document.createElement('option');
        // Creiamo l'URL diretto al file di testo
        opt.value = `https://raw.githubusercontent.com/${CONFIG.user}/${CONFIG.repo}/${CONFIG.branch}/${file.path}`;
        opt.textContent = cleanName(file.name);
        selector.appendChild(opt);
    });
}

// --- LOGICA DEL TERMINALE ---
document.getElementById('fileSelector').addEventListener('change', async (e) => {
    const output = document.getElementById('terminalOutput');
    const url = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;

    output.innerHTML = `<span class="prompt">guest@archive:~$ cat ${name}</span><br><span class="loading">Inizializzazione stream...</span>`;

    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Simuliamo un piccolo delay di caricamento "cyber"
        setTimeout(() => {
            output.innerHTML = `
                <div class="poem-title">/// LOG_NAME: ${name}</div>
                <div class="poem-content">${text.replace(/\n/g, '<br>')}</div>
                <br><span class="prompt">_ (EOF)</span>
            `;
        }, 600);
    } catch (err) {
        output.innerHTML = `<span style="color: #ff5f56">ERRORE: FILE_CORRUPTED_OR_MISSING</span>`;
    }
});

// Start
fetchWithCache();