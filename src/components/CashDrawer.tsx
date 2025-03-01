import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/cash-drawer.css";

function CashDrawer() {
  const [isDrawerConnected, setIsDrawerConnected] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Cash drawer not connected");
  const serialPortRef = useRef<SerialPort | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);

  // Check if Web Serial API is available
  const isSerialSupported = "serial" in navigator;

  // Connect to the cash drawer
  const connectToDrawer = async () => {
    if (!isSerialSupported) {
      setStatus("Error: Web Serial API not supported in this browser");
      return;
    }

    try {
      setStatus("Requesting cash drawer connection...");

      // Request port access from the user
      const port = await navigator.serial.requestPort();

      // Open the serial port with common cash drawer settings
      // Baud rate varies by model (typically 9600 or 19200)
      await port.open({ baudRate: 9600 });

      serialPortRef.current = port;

      // Get a writer to send commands to the cash drawer
      const textEncoder = new TextEncoder();
      const writer = port.writable.getWriter();
      writerRef.current = writer;

      setIsDrawerConnected(true);
      setStatus("Cash drawer connected and ready");
    } catch (error) {
      console.error("Error connecting to cash drawer:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Failed to connect"}`
      );
      setIsDrawerConnected(false);
    }
  };

  // Disconnect from the cash drawer
  const disconnectFromDrawer = async () => {
    try {
      if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
      }

      if (serialPortRef.current) {
        await serialPortRef.current.close();
        serialPortRef.current = null;
      }

      setIsDrawerConnected(false);
      setStatus("Cash drawer disconnected");
    } catch (error) {
      console.error("Error disconnecting from cash drawer:", error);
      setStatus(
        `Error: ${
          error instanceof Error ? error.message : "Failed to disconnect"
        }`
      );
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (writerRef.current) {
        writerRef.current.releaseLock();
      }
      if (serialPortRef.current && serialPortRef.current.readable) {
        disconnectFromDrawer();
      }
    };
  }, []);

  // Open the cash drawer by sending the appropriate command
  const openCashDrawer = async () => {
    if (!isDrawerConnected || !writerRef.current) {
      setStatus("Error: Cash drawer not connected");
      return;
    }

    try {
      setStatus("Opening cash drawer...");

      // This command sequence is common for many cash drawers
      // Some common open drawer commands include:
      // ESC + p + 0 + 25 + 250 (for Epson)
      // 0x1B + 0x70 + 0x00 + 0x19 + 0xFA
      const encoder = new TextEncoder();
      const openCommand = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);

      await writerRef.current.write(openCommand);

      setIsDrawerOpen(true);
      setStatus("Cash drawer opened");

      // Set drawer state back to closed after a few seconds (UI only)
      setTimeout(() => {
        setIsDrawerOpen(false);
        setStatus("Cash drawer ready");
      }, 3000);
    } catch (error) {
      console.error("Error opening cash drawer:", error);
      setStatus(
        `Error: ${
          error instanceof Error ? error.message : "Failed to open drawer"
        }`
      );
    }
  };

  return (
    <div className="pos-terminal">
      <header className="pos-header">
        <h1 className="pos-title">Cash Drawer Management</h1>
      </header>

      <div className="cash-drawer-container">
        <div className="drawer-status-indicator">
          <div
            className={`status-light ${
              isDrawerConnected ? "connected" : "disconnected"
            }`}
          ></div>
          <p className="status-text">{status}</p>

          {!isSerialSupported && (
            <p className="error-message">
              Your browser doesn't support the Web Serial API. Try using Chrome
              or Edge.
            </p>
          )}
        </div>

        <div className="drawer-visualization">
          <div className={`drawer-image ${isDrawerOpen ? "open" : "closed"}`}>
            {isDrawerOpen ? "💵 OPEN 💵" : "🔒 CLOSED 🔒"}
          </div>
        </div>

        <div className="drawer-actions">
          {!isDrawerConnected ? (
            <button
              onClick={connectToDrawer}
              className="pos-button pos-primary"
              disabled={!isSerialSupported}
            >
              Connect to Cash Drawer
            </button>
          ) : (
            <>
              <button
                onClick={openCashDrawer}
                className="pos-button pos-primary"
                disabled={isDrawerOpen}
                style={{ marginRight: "10px" }}
              >
                Open Cash Drawer
              </button>
              <button
                onClick={disconnectFromDrawer}
                className="pos-button pos-danger"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        <div className="mt-4">
          <Link to="/" className="pos-button pos-secondary">
            Back to POS Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CashDrawer;
