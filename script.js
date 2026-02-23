// 1. КОНСТАНТИ ТА НАЛАШТУВАННЯ
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzbNYlcu8ZCE-rhzZv5bIZ2jLWmLVcQ5q3oLNENWjIBW3qjdecYonzLiePkj-xYzNiL/exec";

// Твої контактні дані (змінюй тут, і вони оновляться всюди)
const CONTACT_INFO = {
    tgUsername: "solomia_ka",
    igUsername: "silveri_jewelry_ua",
    phoneNumber: "+380680243337"
};

// 2. СТАТИЧНІ ТОВАРИ (які не тягнуться з таблиці)
const STATIC_PRODUCTS = [
    {
        title: "Шарм 'Срібна ніч'",
        price: "---",
        category: "Шарм", // Переконайся, що в HTML у кнопки фільтра data-filter="шарми"
        description: "Ціну та каталог шармів уточнюйте в менеджера!",
        image: "img/charm.JPG" // Шлях до локального фото
    }
];

// 3. ОСНОВНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ
async function fetchAndRenderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="text-align: center; width: 100%;">Завантаження колекції...</p>';

    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const dynamicProducts = await response.json();
        
        // Об'єднуємо статичні товари з товарами з Google Таблиці
        const allProducts = [...STATIC_PRODUCTS, ...dynamicProducts];

        grid.innerHTML = ''; 

        if (allProducts.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%;">Товарів поки немає.</p>';
            return;
        }

        allProducts.forEach((product) => {
            if (!product.title) return; 

            // Обробка посилань Google Drive
            let finalImageUrl = product.image;
            if (finalImageUrl.includes('drive.google.com')) {
                const fileIdMatch = finalImageUrl.match(/[-\w]{25,}/);
                if (fileIdMatch) {
                    finalImageUrl = `https://lh3.googleusercontent.com/d/${fileIdMatch[0]}`;
                }
            }

            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category?.toLowerCase());
            
            card.innerHTML = `
                <div class="product-img">
                    <img src="${finalImageUrl}" alt="${product.title}" loading="lazy">
                </div>
                <h3>${product.title}</h3>
                <p class="product-desc">${product.description || ''}</p>
                <p class="price">${product.price} грн</p>
                <button class="order-btn" onclick="openOrderModal('${product.title.replace(/'/g, "\\'")}', '${product.price}')">Замовити</button>
            `;
            grid.appendChild(card);
        });

        initFilters();

    } catch (error) {
        console.error("Помилка завантаження: ", error);
        grid.innerHTML = '<p style="text-align: center; color: red;">Помилка завантаження. Перевірте зʼєднання.</p>';
    }
}

// 4. ЛОГІКА ФІЛЬТРІВ
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter').toLowerCase();

            products.forEach(product => {
                const category = product.getAttribute('data-category') || "";
                product.style.display = (filter === 'all' || category === filter) ? 'flex' : 'none';
            });
        });
    });
}

// 5. МОДАЛЬНЕ ВІКНО
window.openOrderModal = function(title, price) {
    document.getElementById('modal-product-info').innerText = `${title} — ${price} грн`;

    const textMessage = encodeURIComponent(`Добрий день! Хочу замовити:\n${title}\nЦіна: ${price} грн.`);
    
    document.getElementById('btn-tg').href = `https://t.me/${CONTACT_INFO.tgUsername}?text=${textMessage}`;
    document.getElementById('btn-vb').href = `viber://chat?number=${CONTACT_INFO.phoneNumber.replace('+', '%2B')}`;
    document.getElementById('btn-ig').href = `https://instagram.com/${CONTACT_INFO.igUsername}`;

    document.getElementById('order-modal').style.display = 'flex';
}

window.closeOrderModal = function() {
    document.getElementById('order-modal').style.display = 'none';
}

// 6. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProducts();

    // Бургер-меню
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = burger.classList.contains('active') ? 'hidden' : '';
        });
    }

    // FAQ Акордеон
    const accordionQuestions = document.querySelectorAll('.accordion-question');
    accordionQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem) item.classList.remove('active');
            });
            currentItem.classList.toggle('active');
        });
    });
});

// Закриття модалки при кліку поза нею
window.onclick = (e) => {
    const modal = document.getElementById('order-modal');
    if (e.target === modal) modal.style.display = "none";
}