const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let allMemes = [];
let filteredMemes = [];
let activeCategory = 'all';

// DOM Elementy
const memeFeed = document.getElementById('meme-feed');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
const filtersContainer = document.getElementById('category-filters');

// Načtení dat
async function loadMemes() {
    try {
        const response = await fetch('memes.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allMemes = await response.json();
        allMemes.sort((a, b) => b.id - a.id); // Nejnovější první

        filteredMemes = [...allMemes];
        
        renderCategories();
        renderPage(1);
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

// Vygenerování tlačítek kategorií
function renderCategories() {
    const categoriesSet = new Set();
    
    allMemes.forEach(meme => {
        if (meme.category) {
            categoriesSet.add(meme.category);
        } else if (Array.isArray(meme.tags)) {
            meme.tags.forEach(tag => categoriesSet.add(tag));
        }
    });

    const categories = ['vše', ...Array.from(categoriesSet)];

    filtersContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${cat === 'vše' ? 'active' : ''}`;
        btn.textContent = cat;
        btn.addEventListener('click', () => filterByCategory(cat, btn));
        filtersContainer.appendChild(btn);
    });
}

// Filtrování memů podle kategorie
function filterByCategory(category, clickedBtn) {
    activeCategory = category;
    
    // Změna aktivního tlačítka
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');

    if (category === 'vše') {
        filteredMemes = [...allMemes];
    } else {
        filteredMemes = allMemes.filter(m => 
            m.category === category || (Array.isArray(m.tags) && m.tags.includes(category))
        );
    }

    renderPage(1);
}

// Renderování stránky
function renderPage(page) {
    memeFeed.innerHTML = '';

    const totalPages = Math.ceil(filteredMemes.length / ITEMS_PER_PAGE) || 1;
    currentPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentMemes = filteredMemes.slice(startIndex, endIndex);

    if (currentMemes.length === 0) {
        memeFeed.innerHTML = '<p style="grid-column: 1/-1;">V této kategorii nejsou žádné memy.</p>';
        return;
    }

    currentMemes.forEach(meme => {
        const card = document.createElement('article');
        card.className = 'meme-card';
        
        const categoryBadge = meme.category ? `<span class="tag-badge">${meme.category}</span>` : '';
        
        card.innerHTML = `
            <img src="${meme.url}" alt="${meme.title || 'Meme'}" loading="lazy">
            <div class="meme-info">
                <div class="meme-title">${meme.title || 'Bez názvu'}</div>
                ${meme.date ? `<div class="meme-date">${meme.date}</div>` : ''}
                <div class="meme-tags">${categoryBadge}</div>
            </div>
        `;
        memeFeed.appendChild(card);
    });

    pageInfo.textContent = `Strana ${currentPage} / ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
}

btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        renderPage(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredMemes.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        renderPage(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.addEventListener('DOMContentLoaded', loadMemes);
