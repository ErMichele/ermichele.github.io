// Calcolo età dinamica
function calculateAge() {
    const birthDate = new Date('2009-12-02');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('Età').textContent = age;
}

// Ricerca progetti
function searchProjects() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    const projects = document.querySelectorAll('.project-card');
    let visibleCount = 0;

    projects.forEach(project => {
        const name = project.getAttribute('data-name').toLowerCase();
        const tags = project.getAttribute('data-tags').toLowerCase();
        const text = (name + ' ' + tags).toLowerCase();

        if (input === '' || text.includes(input)) {
            project.style.display = 'block';
            visibleCount++;
        } else {
            project.style.display = 'none';
        }
    });

    if (visibleCount === 0 && input !== '') {
        console.log('Nessun progetto trovato per: ' + input);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    calculateAge();

    // Ricerca
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', searchProjects);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchProjects();
        }
    });

    // Effetti hover per card (fallback se CSS non basta)
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const hiddenInfo = card.querySelector('.hidden-info');
        card.addEventListener('mouseenter', () => {
            hiddenInfo.style.opacity = '1';
            hiddenInfo.style.transform = 'translateY(0)';
        });
        card.addEventListener('mouseleave', () => {
            hiddenInfo.style.opacity = '0';
            hiddenInfo.style.transform = 'translateY(10px)';
        });
    });

    // Smooth scroll per nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});