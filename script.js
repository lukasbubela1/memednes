const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let memesData = [];

// DOM Elementy
const memeFeed = document.getElementById('meme-feed');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

// Načtení dat z json souboru
async function loadMemes() {
    try {
        const response = await fetch('memes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        memesData = await response.json();
        
        // Seřazení podle ID/data nejnovější první
        memesData.sort((a, b) => b.id - a.id);

        renderPage(currentPage);
    } catch (error) {
        console.error('Chyba při načítání memes.json:', error);
        memeFeed.innerHTML = `
            <div style="grid-column: 1/-1; border: 3px solid #111; padding: 20px; background: #ffde59;">
                <h2>CHYBA NAČÍTÁNÍ MEMEŮ</h2>
                <p>Ujisti se, že soubor <code>memes.json</code> existuje a je správně zformátovaný.</p>
            </div>
        `;
    }
}

// Renderování položek pro danou stránku
function renderPage(page) {
    memeFeed.innerHTML = '';

    const totalPages = Math.ceil(memesData.length / ITEMS_PER_PAGE) || 1;
    currentPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentMemes = memesData.slice(startIndex, endIndex);

    if (currentMemes.length === 0) {
        memeFeed.innerHTML = '<p>Žádné memy k zobrazení.</p>';
        return;
    }

    currentMemes.forEach(meme => {
        const card = document.createElement('article');
        card.className = 'meme-card';
        card.innerHTML = `
            <img src="${meme.url}" alt="${meme.title || 'Meme'}" loading="lazy">
            <div class="meme-info">
                <div class="meme-title">${meme.title || 'Bez názvu'}</div>
                ${meme.date ? `<div class="meme-date">${meme.date}</div>` : ''}
            </div>
        `;
        memeFeed.appendChild(card);
    });

    // Aktualizace stavu stránkování
    pageInfo.textContent = `Strana ${currentPage} / ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
}

// Event Listenery na tlačítka
btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        renderPage(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(memesData.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        renderPage(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Spuštění po načtení dokumentu
document.addEventListener('DOMContentLoaded', loadMemes);
