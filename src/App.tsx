import { useState, useEffect } from "react";

interface Item {
  name: string;
  price: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");

  const total: number = items.reduce((sum, item) => sum + item.price, 0);

  // Open secondary display window on load
  useEffect(() => {
    const secondaryWindow: Window | null = window.open(
      "/secondary",
      "SecondaryDisplay",
      "width=600,height=400"
    );
    if (secondaryWindow) {
      secondaryWindow.document.title = "Customer Display";
    }
    // Cleanup on unmount
    return () => {
      if (secondaryWindow && !secondaryWindow.closed) {
        secondaryWindow.close();
      }
    };
  }, []);

  // Sync items and total to localStorage
  useEffect(() => {
    const data: { items: Item[]; total: number } = { items, total };
    localStorage.setItem("posData", JSON.stringify(data));
    window.dispatchEvent(new Event("storage")); // Trigger update
  }, [items, total]);

  const addItem = (): void => {
    if (itemName && itemPrice) {
      setItems([...items, { name: itemName, price: parseFloat(itemPrice) }]);
      setItemName("");
      setItemPrice("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">POS Terminal</h1>

      {/* Item Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setItemName(e.target.value)
          }
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={itemPrice}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setItemPrice(e.target.value)
          }
          className="border p-2 mr-2"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Item
        </button>
      </div>

      {/* Item List */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <ul className="list-disc pl-5">
          {items.map((item, index) => (
            <li key={index}>
              {item.name}: ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Total */}
      <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
    </div>
  );
}

export default App;
