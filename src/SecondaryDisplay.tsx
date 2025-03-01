import { useState, useEffect } from "react";

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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-6">Customer Display</h1>
      <div className="w-full max-w-md">
        {/* Item List */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Items</h2>
          <ul className="list-none">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between py-1">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="text-xl font-bold flex justify-between border-t pt-2">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default SecondaryDisplay;
