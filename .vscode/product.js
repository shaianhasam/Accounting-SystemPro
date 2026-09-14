/* =========================================================
   ACCOUNT PRO
   PRODUCTS JS
   ========================================================= */

"use strict";

const PRODUCTS_STORAGE_KEY = "accountProProducts";

let products = [];
let editingProductId = null;

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupProductEvents();
  renderProducts();
  updateProductSummary();
  hideProductForm();
});

/* =========================================================
   DOM HELPERS
   ========================================================= */

function getElement(id) {
  return document.getElementById(id);
}

/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

function loadProducts() {
  try {
    const savedProducts = localStorage.getItem(
      PRODUCTS_STORAGE_KEY
    );

    products = savedProducts
      ? JSON.parse(savedProducts)
      : [];
  } catch (error) {
    console.error("Error loading products:", error);
    products = [];
  }
}

/* =========================================================
   SAVE PRODUCTS
   ========================================================= */

function saveProducts() {
  localStorage.setItem(
    PRODUCTS_STORAGE_KEY,
    JSON.stringify(products)
  );

  if (typeof updateNotificationBadge === "function") {
    updateNotificationBadge();
  }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupProductEvents() {
  const productForm = getElement("productForm");
  const cancelProductBtn = getElement("cancelProductBtn");
  const openProductFormBtn = getElement("openProductFormBtn");
  const productSearch = getElement("productSearch");
  const categoryFilter = getElement("categoryFilter");
  const statusFilter = getElement("statusFilter");
  const clearFiltersBtn = getElement("clearFiltersBtn");

  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
  }

  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", () => {
      resetProductForm();
      hideProductForm();
    });
  }

  if (openProductFormBtn) {
    openProductFormBtn.addEventListener("click", () => {
      resetProductForm();
      showProductForm();
    });
  }

  if (productSearch) {
    productSearch.addEventListener("input", renderProducts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderProducts);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", renderProducts);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }
}

/* =========================================================
   FORM VISIBILITY
   ========================================================= */

function showProductForm() {
  const formCard = getElement("productFormCard");

  if (formCard) {
    formCard.style.display = "block";
    formCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function hideProductForm() {
  const formCard = getElement("productFormCard");

  if (formCard) {
    formCard.style.display = "none";
  }
}

/* =========================================================
   SUBMIT PRODUCT
   ========================================================= */

function handleProductSubmit(event) {
  event.preventDefault();

  const name = getElement("productName").value.trim();
  const category = getElement("productCategory").value;
  const purchasePrice = Number(
    getElement("purchasePrice").value
  );
  const sellingPrice = Number(
    getElement("sellingPrice").value
  );
  const stockQuantity = Number(
    getElement("stockQuantity").value
  );
  const lowStockWarning = Number(
    getElement("lowStockWarning").value
  );

  const imageInput = getElement("productImage");

  if (!name || !category) {
    alert("Please fill in all required fields.");
    return;
  }

  if (
    purchasePrice < 0 ||
    sellingPrice < 0 ||
    stockQuantity < 0 ||
    lowStockWarning < 0
  ) {
    alert("Values cannot be negative.");
    return;
  }

  const imageFile = imageInput.files[0];

  if (editingProductId) {
    updateExistingProduct({
      name,
      category,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      lowStockWarning,
      imageFile
    });
  } else {
    createNewProduct({
      name,
      category,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      lowStockWarning,
      imageFile
    });
  }
}

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

function createNewProduct(productData) {
  const product = {
    id: Date.now().toString(),

    name: productData.name,
    category: productData.category,

    purchasePrice: productData.purchasePrice,
    sellingPrice: productData.sellingPrice,

    stockQuantity: productData.stockQuantity,
    lowStockWarning: productData.lowStockWarning,

    image: "",

    createdAt: new Date().toISOString()
  };

  if (productData.imageFile) {
    const reader = new FileReader();

    reader.onload = function (event) {
      product.image = event.target.result;

      products.unshift(product);
      saveProducts();
      finishProductSave("Product added successfully.");
    };

    reader.readAsDataURL(productData.imageFile);
  } else {
    products.unshift(product);
    saveProducts();
    finishProductSave("Product added successfully.");
  }
}

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

function updateExistingProduct(productData) {
  const productIndex = products.findIndex(
    (product) => product.id === editingProductId
  );

  if (productIndex === -1) {
    alert("Product not found.");
    return;
  }

  const oldProduct = products[productIndex];

  const updatedProduct = {
    ...oldProduct,

    name: productData.name,
    category: productData.category,

    purchasePrice: productData.purchasePrice,
    sellingPrice: productData.sellingPrice,

    stockQuantity: productData.stockQuantity,
    lowStockWarning: productData.lowStockWarning
  };

  if (productData.imageFile) {
    const reader = new FileReader();

    reader.onload = function (event) {
      updatedProduct.image = event.target.result;

      products[productIndex] = updatedProduct;

      saveProducts();
      finishProductSave("Product updated successfully.");
    };

    reader.readAsDataURL(productData.imageFile);
  } else {
    products[productIndex] = updatedProduct;

    saveProducts();
    finishProductSave("Product updated successfully.");
  }
}

/* =========================================================
   FINISH SAVE
   ========================================================= */

function finishProductSave(message) {
  renderProducts();
  updateProductSummary();
  resetProductForm();
  hideProductForm();

  alert(message);
}

/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {
  const tableBody = getElement("productsTableBody");
  const emptyState = getElement("emptyProductsState");

  if (!tableBody) {
    return;
  }

  const filteredProducts = getFilteredProducts();

  tableBody.innerHTML = "";

  if (filteredProducts.length === 0) {
    if (emptyState) {
      emptyState.classList.add("show");
    }

    updateShowingText(0);
    return;
  }

  if (emptyState) {
    emptyState.classList.remove("show");
  }

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");

    const status = getProductStatus(product);
    const statusClass = getStatusClass(status);

    row.innerHTML = `
      <td>
        <div class="product-cell">
          <div class="product-image">
            ${
              product.image
                ? `<img src="${product.image}" alt="${escapeHTML(product.name)}">`
                : `<i class="fa-solid fa-box"></i>`
            }
          </div>

          <div>
            <div class="product-name">
              ${escapeHTML(product.name)}
            </div>

            <div class="product-category">
              Product ID: ${product.id}
            </div>
          </div>
        </div>
      </td>

      <td>${escapeHTML(product.category)}</td>

      <td>$${Number(product.purchasePrice).toFixed(2)}</td>

      <td>$${Number(product.sellingPrice).toFixed(2)}</td>

      <td>${product.stockQuantity}</td>

      <td>
        <span class="status-badge ${statusClass}">
          ${status}
        </span>
      </td>

      <td>
        <div class="action-buttons">
          <button
            class="table-action-btn edit"
            type="button"
            title="Edit"
            onclick="editProduct('${product.id}')"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            class="table-action-btn delete"
            type="button"
            title="Delete"
            onclick="deleteProduct('${product.id}')"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateShowingText(filteredProducts.length);
}

/* =========================================================
   FILTER PRODUCTS
   ========================================================= */

function getFilteredProducts() {
  const searchValue = (
    getElement("productSearch")?.value || ""
  )
    .trim()
    .toLowerCase();

  const categoryValue =
    getElement("categoryFilter")?.value || "all";

  const statusValue =
    getElement("statusFilter")?.value || "all";

  return products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue);

    const matchesCategory =
      categoryValue === "all" ||
      product.category === categoryValue;

    const matchesStatus =
      statusValue === "all" ||
      getProductStatus(product) === statusValue;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });
}

function clearFilters() {
  getElement("productSearch").value = "";
  getElement("categoryFilter").value = "all";
  getElement("statusFilter").value = "all";

  renderProducts();
}

/* =========================================================
   PRODUCT STATUS
   ========================================================= */

function getProductStatus(product) {
  const stock = Number(product.stockQuantity || 0);
  const warning = Number(product.lowStockWarning || 5);

  if (stock === 0) {
    return "Out of Stock";
  }

  if (stock <= warning) {
    return "Low Stock";
  }

  return "In Stock";
}

function getStatusClass(status) {
  if (status === "In Stock") {
    return "in-stock";
  }

  if (status === "Low Stock") {
    return "low-stock";
  }

  return "out-of-stock";
}

/* =========================================================
   SUMMARY CARDS
   ========================================================= */

function updateProductSummary() {
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) =>
      getProductStatus(product) === "Low Stock"
  ).length;

  const availableProducts = products.filter(
    (product) =>
      getProductStatus(product) === "In Stock"
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      getProductStatus(product) === "Out of Stock"
  ).length;

  const totalElement = getElement("totalProductsCount");
  const lowStockElement = getElement("lowStockCount");
  const availableElement = getElement(
    "availableProductsCount"
  );
  const outOfStockElement = getElement(
    "outOfStockCount"
  );

  if (totalElement) {
    totalElement.textContent = totalProducts;
  }

  if (lowStockElement) {
    lowStockElement.textContent = lowStockProducts;
  }

  if (availableElement) {
    availableElement.textContent = availableProducts;
  }

  if (outOfStockElement) {
    outOfStockElement.textContent = outOfStockProducts;
  }
}

/* =========================================================
   EDIT PRODUCT
   ========================================================= */

function editProduct(productId) {
  const product = products.find(
    (item) => item.id === productId
  );

  if (!product) {
    alert("Product not found.");
    return;
  }

  editingProductId = productId;

  getElement("productName").value = product.name;
  getElement("productCategory").value = product.category;
  getElement("purchasePrice").value = product.purchasePrice;
  getElement("sellingPrice").value = product.sellingPrice;
  getElement("stockQuantity").value = product.stockQuantity;
  getElement("lowStockWarning").value =
    product.lowStockWarning;

  getElement("productFormTitle").textContent =
    "Edit Product";

  getElement("productSubmitBtn").innerHTML = `
    <i class="fa-solid fa-save"></i>
    Update Product
  `;

  showProductForm();
}

/* =========================================================
   DELETE PRODUCT
   ========================================================= */

function deleteProduct(productId) {
  const product = products.find(
    (item) => item.id === productId
  );

  if (!product) {
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) {
    return;
  }

  products = products.filter(
    (item) => item.id !== productId
  );

  saveProducts();
  renderProducts();
  updateProductSummary();

  alert("Product deleted successfully.");
}

/* =========================================================
   RESET FORM
   ========================================================= */

function resetProductForm() {
  const form = getElement("productForm");

  if (form) {
    form.reset();
  }

  getElement("lowStockWarning").value = 5;

  editingProductId = null;

  getElement("productFormTitle").textContent =
    "Add New Product";

  getElement("productSubmitBtn").innerHTML = `
    <i class="fa-solid fa-plus"></i>
    Save Product
  `;
}

/* =========================================================
   SHOWING TEXT
   ========================================================= */

function updateShowingText(count) {
  const element = getElement("productsShowingText");

  if (element) {
    element.textContent = `Showing ${count} product${
      count === 1 ? "" : "s"
    }`;
  }
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}