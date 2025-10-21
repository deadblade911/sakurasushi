// Корзина для хранения товаров
let cart = [];

// Функция инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupEventListeners();
    updateCartUI();
    loadCartPage();
});

// Инициализация корзины из localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('sakuraCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('sakuraCart', JSON.stringify(cart));
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    // Обработчики для кнопок "В корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            addToCart(productCard);
        });
    });

    // Обработчики для кнопок категорий
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterProducts(this.textContent);
            
            // Обновление активной кнопки
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Обработчик для кнопки авторизации
    const authButton = document.getElementById('openAuthModal');
    if (authButton) {
        authButton.addEventListener('click', showAuthModal);
    }

    // Обработчик для кнопки заказа в баннере
    const orderButton = document.querySelector('.order-btn');
    if (orderButton && !orderButton.classList.contains('large')) {
        orderButton.addEventListener('click', function() {
            const catalogSection = document.getElementById('catalog');
            if (catalogSection) {
                catalogSection.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                window.location.href = 'catalog.html';
            }
        });
    }
}

// Добавление товара в корзину
function addToCart(productCard) {
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = parseInt(productCard.querySelector('.product-price').textContent);
    const productDescription = productCard.querySelector('.product-description').textContent;
    
    // Проверяем, есть ли товар уже в корзине
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            description: productDescription,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${productName} добавлен в корзину! 🛒`);
}

// Обновление интерфейса корзины
function updateCartUI() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCounts.forEach(cartCount => {
        cartCount.textContent = totalItems;
        
        // Показываем счетчик только если есть товары
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    });
}

// Фильтрация продуктов по категории
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    const categoryMap = {
        'Все': 'all',
        'Суши': 'sushi',
        'Роллы': 'rolls', 
        'Вок': 'wok',
        'Напитки': 'drinks'
    };
    
    products.forEach(product => {
        const productName = product.querySelector('.product-title').textContent.toLowerCase();
        const productDescription = product.querySelector('.product-description').textContent.toLowerCase();
        
        if (category === 'Все') {
            product.style.display = 'block';
        } else {
            const shouldShow = checkProductCategory(productName, productDescription, categoryMap[category]);
            product.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

// Проверка категории товара
function checkProductCategory(productName, productDescription, category) {
    const categoryKeywords = {
        'sushi': ['суши', 'нигири', 'сашими', 'онигири'],
        'rolls': ['ролл', 'филадельфия', 'калифорния', 'запеченный'],
        'wok': ['вок'],
        'drinks': ['напиток', 'кола', 'сок', 'чай', 'кофе']
    };
    
    const searchText = productName + ' ' + productDescription;
    return categoryKeywords[category].some(keyword => 
        searchText.includes(keyword)
    );
}

// Загрузка корзины на странице cart.html
function loadCartPage() {
    if (window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html')) {
        renderCartPage();
        setupCartPageListeners();
    }
}

// Рендер страницы корзины
function renderCartPage() {
    const emptyCart = document.getElementById('emptyCart');
    const cartWithItems = document.getElementById('cartWithItems');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    if (!emptyCart || !cartWithItems || !cartItems) return;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartWithItems.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartWithItems.style.display = 'block';

    // Очищаем контейнер товаров
    cartItems.innerHTML = '';

    let total = 0;

    // Добавляем каждый товар в корзину
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="cart-item-price">${item.price} ₽</span>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
                <button class="remove-btn" data-index="${index}">×</button>
            </div>
            <div class="cart-item-total">
                ${itemTotal} ₽
            </div>
        `;

        cartItems.appendChild(cartItemElement);
    });

    if (totalPrice) {
        totalPrice.textContent = total + ' ₽';
    }
}

// Настройка обработчиков на странице корзины
function setupCartPageListeners() {
    // Обработчик для кнопки оформления заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    // Обработчик для кнопки очистки корзины
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Обработчики для кнопок изменения количества (делегирование событий)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn') || e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            
            if (e.target.classList.contains('plus')) {
                cart[index].quantity += 1;
            } else if (e.target.classList.contains('minus')) {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
            } else if (e.target.classList.contains('remove-btn')) {
                cart.splice(index, 1);
            }
            
            saveCart();
            updateCartUI();
            renderCartPage(); // Перерисовываем корзину
        }
    });
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const total = getCartTotal();
    const orderDetails = cart.map(item => 
        `${item.name} - ${item.quantity} × ${item.price}₽ = ${item.quantity * item.price}₽`
    ).join('\n');

    alert(`🎉 Заказ оформлен!\n\nДетали заказа:\n${orderDetails}\n\n💰 Итого: ${total}₽\n\nОжидайте звонка для подтверждения. Спасибо за заказ!`);
    
    clearCart();
}

// Очистка корзины
function clearCart() {
    if (cart.length === 0) {
        alert('Корзина уже пуста!');
        return;
    }

    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cart = [];
        saveCart();
        updateCartUI();
        
        // Если мы на странице корзины, перерисовываем её
        if (window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html')) {
            renderCartPage();
        }
        
        showNotification('Корзина очищена!');
    }
}

// Подсчет общей суммы
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Показ уведомления
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Модальное окно авторизации
function showAuthModal() {
    alert('Форма авторизации\n\nВ реальном приложении здесь будет окно для входа в систему с полями:\n- Email/Телефон\n- Пароль\n\nА также кнопки:\n- Войти\n- Зарегистрироваться\n- Восстановить пароль');
}