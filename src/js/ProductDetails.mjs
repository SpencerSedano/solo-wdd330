import { setLocalStorage, getLocalStorage, alertMessage } from "./utils.mjs";

function productDetailsTemplate(product) {
  if (!product || Object.keys(product).length === 0) {
    return `<p class="error">Product details not available.</p>`;
  }

  const colorOptions = (product.Colors || [])
    .map((color, index) => {
      console.log("Color Data:", color);
      return `
      <div class="color-swatch ${index === 0 ? "selected" : ""}" 
           data-color="${color.ColorName || "Unknown"}" 
           style="background-image: url(${color.ColorPreviewImageSrc}); background-size: cover;" 
           title="${color.ColorName || "Unknown"}">
      </div>`;
    })
    .join("");

  return `<section class="product-detail">
    <h3>${product.Brand?.Name || "Unknown Brand"}</h3>
    <h2 class="divider">${product.NameWithoutBrand || "Unknown Product"}</h2>
    <img class="divider" src="${product.Images?.PrimaryLarge || ""}" alt="${product.NameWithoutBrand || "Product image"}" />
    <p class="product-card__price">$${product.FinalPrice || "N/A"}</p>
    <div class="product__colors">
      <p>Available Colors:</p>
      <div class="color-swatch-container">${colorOptions}</div>
      <p id="selected-color">Selected Color: ${product.Colors?.[0]?.ColorName || "None"}</p>
    </div>
    <p class="product__description">${product.DescriptionHtmlSimple || "No description available."}</p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id || ""}">Add to Cart</button>
    </div>
  </section>`;
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.selectedColor = null;
  }

  async init() {
    try {
      console.log("Fetching product details for ID:", this.productId);
      this.product = await this.dataSource.findProductById(this.productId);
      console.log("Product Data:", this.product);
      if (!this.product) {
        throw new Error(`Product with ID ${this.productId} not found.`);
      }
      this.renderProductDetails("main");
      this.addColorSelectionListener();
      document
        .getElementById("addToCart")
        ?.addEventListener("click", this.addToCart.bind(this));
    } catch (error) {
      console.error("Error initializing ProductDetails:", error);
      document.querySelector("main").innerHTML =
        `<p class='error'>Failed to load product details.</p>`;
    }
  }

  addColorSelectionListener() {
    const swatches = document.querySelectorAll(".color-swatch");
    const selectedColorElement = document.getElementById("selected-color");
    if (!swatches.length) return;

    swatches.forEach((swatch) => {
      swatch.addEventListener("click", (event) => {
        const selectedColor = event.target.dataset.color;
        this.selectedColor = selectedColor;
        selectedColorElement.textContent = `Selected Color: ${selectedColor}`;
        document
          .querySelectorAll(".color-swatch")
          .forEach((s) => s.classList.remove("selected"));
        event.target.classList.add("selected");
      });
    });
  }

  addToCart() {
    if (!this.selectedColor && this.product.Colors?.length) {
      this.selectedColor = this.product.Colors[0].ColorName;
    }

    if (!this.selectedColor) {
      alert("Please select a color before adding to cart.");
      return;
    }

    let cartContents = getLocalStorage("so-cart") || [];
    const productToAdd = { ...this.product, SelectedColor: this.selectedColor };
    cartContents.push(productToAdd);
    setLocalStorage("so-cart", cartContents);
    alertMessage(
      `${this.product.NameWithoutBrand || "Product"} (${productToAdd.SelectedColor}) added to cart!`,
    );
  }

  renderProductDetails(selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error("Invalid selector for rendering product details.");
      return;
    }
    container.innerHTML = productDetailsTemplate(this.product);
  }
}
