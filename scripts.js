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
    document.getElementById("età").textContent = eta;
}
window.onload = calcolaEta;