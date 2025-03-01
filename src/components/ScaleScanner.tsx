import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/pos.css";

const ScaleScanner: React.FC = () => {
  const [weight, setWeight] = useState<number | null>(null);
  const [deviceConnected, setDeviceConnected] = useState<boolean>(false);
  const [devices, setDevices] = useState<SerialPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if Web Serial API is supported
  const isSerialSupported = 'serial' in navigator;

  useEffect(() => {
    // Try to connect to the previously selected port if available
    const connectToSavedPort = async () => {
      const savedPortInfo = localStorage.getItem('scalePortInfo');
      if (savedPortInfo && isSerialSupported) {
        try {
          const ports = await navigator.serial.getPorts();
          if (ports.length > 0) {
            setDevices(ports);
            // Attempt to find the saved port
            const portInfo = JSON.parse(savedPortInfo);
            await connectToPort(ports[0]); // Connect to first available port for now
            setSelectedPort(portInfo.path);
          }
        } catch (err) {
          setError("Failed to connect to saved device");
          console.error(err);
        }
      }
    };
    
    connectToSavedPort();
    
    // Clean up on unmount
    return () => {
      disconnectFromScale();
    };
  }, []);

  const requestPort = async () => {
    if (!isSerialSupported) {
      setError("Web Serial API is not supported in your browser");
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      setDevices([...devices, port]);
      await connectToPort(port);
    } catch (err) {
      setError("User canceled the device selection or connection failed");
      console.error(err);
    }
  };

  const connectToPort = async (port: SerialPort) => {
    try {
      await port.open({ baudRate: 9600 }); // Common baud rate for scales, adjust as needed
      
      setDeviceConnected(true);
      setError(null);
      
      // Start reading data from the scale
      readFromScale(port);
      
      // Save port info
      localStorage.setItem('scalePortInfo', JSON.stringify({
        path: 'scale-device' // This would be replaced with actual device info
      }));
      
    } catch (err) {
      setDeviceConnected(false);
      setError("Failed to open the connection to the scale");
      console.error(err);
    }
  };

  const disconnectFromScale = async () => {
    try {
      if (deviceConnected) {
        // This would need to reference the actual port object
        // Currently just resetting the state
        setDeviceConnected(false);
        setWeight(null);
      }
    } catch (err) {
      console.error("Error disconnecting from scale:", err);
    }
  };

  const readFromScale = async (port: SerialPort) => {
    const reader = port.readable?.getReader();
    
    if (!reader) {
      setError("Could not get reader from serial port");
      return;
    }
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        
        // Process the data from the scale
        // This implementation depends on your specific scale protocol
        // For demonstration, we'll just convert the bytes to a string and parse a number
        const decoder = new TextDecoder();
        const data = decoder.decode(value);
        const parsedWeight = parseFloat(data.trim());
        
        if (!isNaN(parsedWeight)) {
          setWeight(parsedWeight);
        }
      }
    } catch (err) {
      console.error("Error reading from scale:", err);
      setError("Error reading from scale");
    } finally {
      reader.releaseLock();
    }
  };

  // Simulate weight reading (for testing without actual hardware)
  const simulateWeightReading = () => {
    const randomWeight = (Math.random() * 5 + 0.1).toFixed(3);
    setWeight(parseFloat(randomWeight));
    setDeviceConnected(true);
  };

  return (
    <div className="pos-terminal">
      <header className="pos-header">
        <h1 className="pos-title">Scale Scanner</h1>
        <Link to="/" className="pos-button pos-secondary">
          Back to POS
        </Link>
      </header>

      <div className="pos-scanner-container">
        {error && (
          <div className="pos-error-message">
            {error}
          </div>
        )}

        <div className="pos-scale-display">
          <h2>Weight Reading</h2>
          <div className="pos-weight-value">
            {weight !== null ? (
              <span>{weight} kg</span>
            ) : (
              <span>0.000 kg</span>
            )}
          </div>
          <div className="pos-connection-status">
            Status: {deviceConnected ? 
              <span className="status-connected">Connected</span> : 
              <span className="status-disconnected">Not Connected</span>
            }
          </div>
        </div>

        <div className="pos-scale-actions">
          {isSerialSupported ? (
            <button 
              onClick={requestPort} 
              className="pos-button pos-primary"
              disabled={deviceConnected}
            >
              Connect to Scale
            </button>
          ) : (
            <p>Your browser does not support the Web Serial API required to connect to scales.</p>
          )}
          
          {deviceConnected && (
            <button 
              onClick={disconnectFromScale} 
              className="pos-button pos-danger"
            >
              Disconnect
            </button>
          )}
          
          {/* Testing button for demo purposes */}
          <button 
            onClick={simulateWeightReading} 
            className="pos-button pos-success"
          >
            Simulate Reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScaleScanner;