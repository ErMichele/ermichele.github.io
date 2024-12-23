document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = 'none';
    });
});
