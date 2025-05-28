function goToPage(page) {
    window.location.href = page;
}

function createGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = ''; // Clear the container

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate the number of columns dynamically based on device width
    const itemMinSize = 60; // Minimum item size
    let numCols = Math.floor(containerWidth / itemMinSize);
    const itemWidth = containerWidth / numCols;
    const numRows = Math.floor(containerHeight / itemWidth);
    const itemHeight = containerHeight / numRows;

    // Update grid-template-columns to ensure items fit perfectly
    container.style.gridTemplateColumns = `repeat(${numCols}, ${itemWidth}px)`;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const div = document.createElement('div');
            div.classList.add('grid-item');
            div.innerText = 'Grazie';
            div.style.width = `${itemWidth}px`;
            div.style.height = `${itemHeight}px`;
            container.appendChild(div);
        }
    }
    console.log(`Grid created with ${numRows * numCols} items.`); // Debug
}

window.addEventListener('resize', createGrid);
document.addEventListener('DOMContentLoaded', createGrid);
