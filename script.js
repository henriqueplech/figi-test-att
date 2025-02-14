class Store {
  constructor() {
    this.products = [];
    this.cart = new Map();
    this.init();
  }

  async init() {
    this.showLoading();
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      this.products = await response.json();
      this.renderProducts();
    } catch (error) {
      this.showError(error.message);
    }
  }

  showLoading() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }

  showError(message) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `
      <div class="error">
        <p>${message}</p>
        <button onclick="store.init()">Try Again</button>
      </div>
    `;
  }

  renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const template = document.getElementById('product-template');
    productsGrid.innerHTML = '';

    this.products.forEach(product => {
      const clone = template.content.cloneNode(true);
      
      const img = clone.querySelector('img');
      img.src = product.image;
      img.alt = product.title;
      
      clone.querySelector('.product-title').textContent = product.title;
      clone.querySelector('.rating-value').textContent = product.rating.rate;
      clone.querySelector('.rating-count').textContent = `(${product.rating.count} reviews)`;
      clone.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
      
      const card = clone.querySelector('.product-card');
      card.dataset.productId = product.id;
      
      const addToCartBtn = clone.querySelector('.add-to-cart');
      const quantityControls = clone.querySelector('.quantity-controls');
      
      if (this.cart.has(product.id)) {
        addToCartBtn.classList.add('hidden');
        quantityControls.classList.remove('hidden');
        quantityControls.querySelector('.quantity').textContent = this.cart.get(product.id);
      }
      
      productsGrid.appendChild(clone);
    });

    this.attachEventListeners();
  }

  attachEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.onclick = (e) => {
        const productId = parseInt(e.target.closest('.product-card').dataset.productId);
        this.addToCart(productId);
      };
    });

    document.querySelectorAll('.increase').forEach(button => {
      button.onclick = (e) => {
        const productId = parseInt(e.target.closest('.product-card').dataset.productId);
        this.updateQuantity(productId, (this.cart.get(productId) || 0) + 1);
      };
    });

    document.querySelectorAll('.decrease').forEach(button => {
      button.onclick = (e) => {
        const productId = parseInt(e.target.closest('.product-card').dataset.productId);
        this.updateQuantity(productId, (this.cart.get(productId) || 0) - 1);
      };
    });
  }

  addToCart(productId) {
    this.updateQuantity(productId, 1);
  }

  updateQuantity(productId, quantity) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      this.cart.delete(productId);
    } else {
      this.cart.set(productId, quantity);
    }

    this.updateProductCard(productId);
    this.updateCart();
  }

  updateProductCard(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    const addToCartBtn = card.querySelector('.add-to-cart');
    const quantityControls = card.querySelector('.quantity-controls');
    const quantitySpan = card.querySelector('.quantity');

    if (this.cart.has(productId)) {
      addToCartBtn.classList.add('hidden');
      quantityControls.classList.remove('hidden');
      quantitySpan.textContent = this.cart.get(productId);
    } else {
      addToCartBtn.classList.remove('hidden');
      quantityControls.classList.add('hidden');
    }
  }

  updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    const template = document.getElementById('cart-item-template');

    cartItems.innerHTML = '';
    let total = 0;

    this.cart.forEach((quantity, productId) => {
      const product = this.products.find(p => p.id === productId);
      if (!product) return;

      const clone = template.content.cloneNode(true);
      
      const img = clone.querySelector('img');
      img.src = product.image;
      img.alt = product.title;
      
      clone.querySelector('h3').textContent = product.title;
      clone.querySelector('.cart-item-price').textContent = `${quantity}x $${product.price.toFixed(2)}`;
      
      const removeBtn = clone.querySelector('.remove-item');
      removeBtn.onclick = () => this.updateQuantity(productId, 0);
      
      cartItems.appendChild(clone);
      total += product.price * quantity;
    });

    cartCount.textContent = this.cart.size;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    if (this.cart.size > 0) {
      cartSummary.classList.remove('hidden');
      emptyCart.classList.add('hidden');
    } else {
      cartSummary.classList.add('hidden');
      emptyCart.classList.remove('hidden');
    }
  }
}

const store = new Store();