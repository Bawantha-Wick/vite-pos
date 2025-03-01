import { useState, useEffect } from "react";
import "./styles/pos.css";
import { setupCustomerDisplay, updateCustomerDisplay } from "./pop";
import { products } from "../src/products";
import { Link } from "react-router-dom";
import BarcodeScanner from "./components/BarcodeScanner";

interface Item {
  name: string;
  price: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [secondaryWindow, setSecondaryWindow] = useState<Window | null>(null);

  const total: number = items.reduce((sum, item) => sum + item.price, 0);

  // Open secondary display window on load
  useEffect(() => {
    // Open a new window for the customer display
    const newWindow: Window | null = window.open(
      "",
      "SecondaryDisplay",
      "width=600,height=400"
    );
    setSecondaryWindow(newWindow);

    if (newWindow) {
      setupCustomerDisplay(newWindow);
    }

    // Cleanup on unmount
    return () => {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
    };
  }, []);

  // Sync items and total to localStorage
  useEffect(() => {
    const data: { items: Item[]; total: number } = { items, total };
    localStorage.setItem("posData", JSON.stringify(data));
    window.dispatchEvent(new Event("storage")); // Trigger update

    // Update secondary window content
    updateCustomerDisplay(secondaryWindow, items, total);
  }, [items, total, secondaryWindow]);

  const addItem = (): void => {
    if (selectedProduct) {
      const productToAdd = products.find((p: any) => p.id === selectedProduct);
      if (productToAdd) {
        setItems([
          ...items,
          { name: productToAdd.name, price: productToAdd.price },
        ]);
        setSelectedProduct(""); // Reset selection
      }
    }
  };

  const removeItem = (index: number): void => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const clearAll = (): void => {
    setItems([]);
  };

  const printReceipt = () => {
    // Check for printer availability
    if (!window.navigator.userAgent.toLowerCase().includes("chrome") && !window.navigator.userAgent.toLowerCase().includes("firefox")) {
      alert("Printer detection is only supported in Chrome or Firefox browsers.");
      return;
    }

    // Create receipt content
    const receiptWindow = window.open("", "_blank", "height=600,width=800");
    if (!receiptWindow) {
      alert("Failed to open print window. Please check your popup blocker settings.");
      return;
    }

    const date = new Date().toLocaleString();
    const receiptId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${receiptId}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 300px;
              margin: 0 auto;
              padding: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .store-name {
              font-size: 18px;
              font-weight: bold;
            }
            .receipt-info {
              margin-bottom: 10px;
              font-size: 12px;
            }
            .items {
              width: 100%;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              margin: 10px 0;
              padding: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 5px;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
            }
            .printer-error {
              color: red;
              text-align: center;
              font-weight: bold;
              margin: 20px 0;
              display: none;
            }
            @media print {
              body {
                width: 100%;
              }
              .printer-error {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="printer-error" id="printerError">
            No printer found. Please check your printer connection and try again.
          </div>
          <div class="header">
            <div class="store-name">Your Store Name</div>
            <div>123 Main Street</div>
            <div>City, State 12345</div>
            <div>Tel: (123) 456-7890</div>
          </div>
          
          <div class="receipt-info">
            <div>Receipt #${receiptId}</div>
            <div>Date: ${date}</div>
          </div>
          
          <div class="items">
            ${items
              .map(
                (item) => `
              <div class="item">
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="total">
            <span>TOTAL</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>
          
          <script>
            window.onload = function() {
              try {
                // Check if we can access print functionality
                if (window.matchMedia('print').matches === false) {
                  // Try to print
                  window.print();
                  
                  // Check if print was canceled
                  setTimeout(() => {
                    // This runs after the print dialog closes
                    // If canceled or no printer, show message
                    if (!window.matchMedia('print').matches) {
                      document.getElementById('printerError').style.display = 'block';
                    }
                  }, 500);
                } else {
                  document.getElementById('printerError').style.display = 'block';
                }
              } catch (e) {
                document.getElementById('printerError').style.display = 'block';
                console.error("Printing error:", e);
              }
            }
          </script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  return (
    <div className="pos-terminal">
      <header className="pos-header">
        <h1 className="pos-title">POS Terminal</h1>
        {items.length > 0 && (
          <button onClick={clearAll} className="pos-button pos-danger">
            Clear All
          </button>
        )}
      </header>

      {/* Product Selection */}
      <div className="pos-form">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="pos-input pos-select"
        >
          <option value="">Select a product</option>
          {products.map((product: any) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${product.price.toFixed(2)}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="pos-button pos-success"
          disabled={!selectedProduct}
        >
          Add Item
        </button>
      </div>

      {/* Item List */}
      <div className="pos-item-list">
        <h2 className="pos-list-header">Items</h2>
        {items.length > 0 ? (
          <ul className="pos-items">
            {items.map((item, index) => (
              <li key={index} className="pos-item">
                <span className="pos-item-name">{item.name}</span>
                <div>
                  <span className="pos-item-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(index)}
                    className="pos-button pos-action-button pos-danger ml-3"
                    style={{ marginLeft: "10px" }}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center p-4">No items added yet.</p>
        )}
      </div>

      {/* Total */}
      <div className="pos-total-section">
        <span className="pos-total-label">Total</span>
        <span className="pos-total-amount">${total.toFixed(2)}</span>
      </div>
      {/* Actions Section */}
      <div className="pos-actions-section">
        <Link to="/barcode-scanner" className="pos-button pos-primary">
          <span role="img" aria-label="scan">
            🔍
          </span>{" "}
          Barcode Scanner
        </Link>
        <Link to="/scale-scanner" className="pos-button pos-success">
          <span role="img" aria-label="scale">
            ⚖️
          </span>{" "}
          Scale Scanner
        </Link>
        <Link to="/cash-drawer" className="pos-button pos-warning">
          <span role="img" aria-label="cash">
            💰
          </span>{" "}
          Cash Drawer
        </Link>
        {items.length > 0 && (
          <button onClick={printReceipt} className="pos-button pos-info">
            <span role="img" aria-label="print">
              🖨️
            </span>{" "}
            Print Receipt
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
