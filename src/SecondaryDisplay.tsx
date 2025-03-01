import { useState, useEffect } from "react";
import "./styles/pos.css";

interface Item {
  name: string;
  price: number;
}

function SecondaryDisplay() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Listen for storage updates
  useEffect(() => {
    const updateDisplay = (): void => {
      const data: { items: Item[]; total: number } = JSON.parse(
        localStorage.getItem("posData") || "{}"
      );
      setItems(data.items || []);
      setTotal(data.total || 0);
    };

    // Initial load
    updateDisplay();

    // Listen for changes
    window.addEventListener("storage", updateDisplay);
    return () => window.removeEventListener("storage", updateDisplay);
  }, []);

  return (
    <div className="customer-display">
      <header className="customer-header">
        <h1 className="customer-title">Customer Display</h1>
        <p>Thank you for your purchase</p>
      </header>

      <div className="customer-content">
        <h2 className="pos-list-header" style={{ color: "#a5b4fc" }}>
          Your Order
        </h2>

        {items.length > 0 ? (
          <>
            <ul className="customer-items-list">
              {items.map((item, index) => (
                <li key={index} className="customer-item">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="customer-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="customer-empty">No items in your cart yet</div>
        )}
      </div>
    </div>
  );
}

export default SecondaryDisplay;
