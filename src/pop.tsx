import React from "react";

interface Item {
  name: string;
  price: number;
}

interface CustomerDisplayProps {
  window: Window;
}

export const setupCustomerDisplay = (newWindow: Window): void => {
  if (!newWindow) return;

  newWindow.document.title = "Customer Display";

  // Add base styles to the new window
  const styleElement = newWindow.document.createElement("style");
  styleElement.innerHTML = `
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f0f0f0; }
    .customer-display { max-width: 100%; margin: 0 auto; }
    .pos-items { list-style: none; padding: 0; }
    .pos-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .pos-total-section { margin-top: 20px; display: flex; justify-content: space-between; font-size: 24px; font-weight: bold; }
  `;
  newWindow.document.head.appendChild(styleElement);

  // Create the initial structure
  const root = newWindow.document.createElement("div");
  root.className = "customer-display";
  root.innerHTML = `
    <h2>Your Order</h2>
    <ul class="pos-items"></ul>
    <div class="pos-total-section">
      <span class="pos-total-label">Total:</span>
      <span class="pos-total-amount">$0.00</span>
    </div>
  `;
  newWindow.document.body.appendChild(root);
};

export const updateCustomerDisplay = (
  secondaryWindow: Window | null,
  items: Item[],
  total: number
): void => {
  if (!secondaryWindow) return;

  const itemList = secondaryWindow.document.querySelector(".pos-items");
  const totalAmount =
    secondaryWindow.document.querySelector(".pos-total-amount");

  if (itemList && totalAmount) {
    itemList.innerHTML = items
      .map(
        (item) => `
      <li class="pos-item">
        <span class="pos-item-name">${item.name}</span>
        <span class="pos-item-price">$${item.price.toFixed(2)}</span>
      </li>
    `
      )
      .join("");
    totalAmount.textContent = `$${total.toFixed(2)}`;
  }
};
