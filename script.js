//Animazioni per i bottoni social
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'none';
    });
});

//Funzione per calcolare gli anni
var dataDiNascita = new Date(2009, 11, 2);
function calcolaEta() {
    var oggi = new Date();
    var eta = oggi.getFullYear() - dataDiNascita.getFullYear();
    // Controlla se la data di compleanno è già passata quest'anno
    if (oggi.getMonth() < dataDiNascita.getMonth() || (oggi.getMonth() === dataDiNascita.getMonth() && oggi.getDate() < dataDiNascita.getDate())) {
        eta--;
    }
    document.getElementById("Età").textContent = eta;
}
window.onload = calcolaEta;

const coloriSfondo = ["#f0f0f0", "#ffcc00", "#66ac78", "#e74c3c", "#8e44ad"];
document.addEventListener("DOMContentLoaded", function() {
    let progetti = document.querySelectorAll(".progetto");  
    progetti.forEach(progetto => {
        progetto.style.backgroundColor = coloriSfondo[Math.floor(Math.random() * coloriSfondo.length)];  
    });
});

