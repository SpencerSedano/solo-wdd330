import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");
  const uniqueCartItems = {};
  cartItems.forEach((item) => {
    if (uniqueCartItems[item.Id]) {
      uniqueCartItems[item.Id].quantity += 1;
    } else {
      uniqueCartItems[item.Id] = { ...item, quantity: 1 };
    }
  });

  const htmlItems = Object.values(uniqueCartItems).map(cartItemTemplate);
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  totalInCart(Object.values(uniqueCartItems));
}

function cartItemTemplate(item) {
  console.log(item.Image);
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Images.PrimaryLarge}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: ${item.quantity}</p>
  <p class="cart-card__price">$${item.FinalPrice * item.quantity}</p>
</li>`;

  return newItem;
}

function totalInCart(itemsInCart) {
  let sum = 0;
  const totalPrice = document.querySelector(".cart-total");
  for (let i = 0; i < itemsInCart.length; i++) {
    sum += itemsInCart[i].FinalPrice * itemsInCart[i].quantity;
  }
  if (itemsInCart.length > 0) {
    // cartTotal.style.display = "block";
    totalPrice.innerHTML = `Total: ${sum.toFixed(2)}`;
  }
}

renderCartContents();
