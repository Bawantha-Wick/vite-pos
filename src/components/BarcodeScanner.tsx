import { useState, useEffect, useRef } from "react";
import "../styles/barcode-scanner.css";

const BarcodeScanner = () => {
  const [connectedScanners, setConnectedScanners] = useState<MediaDeviceInfo[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<string>("");
  const [scanResult, setScanResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [manualInput, setManualInput] = useState<string>("");

  // Detect barcode scanners on component mount
  useEffect(() => {
    const detectDevices = async () => {
      try {
        // Get all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setConnectedScanners(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedScanner(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error detecting devices:", error);
      }
    };

    detectDevices();
  }, []);

  // Start listening for barcode input when scanning is activated
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isScanning) return;

      if (event.key === "Enter") {
        // Most barcode scanners send an Enter key after scanning
        processBarcodeInput();
      } else if (/^[\w\d]$/.test(event.key)) {
        // Collect barcode characters
        setManualInput(prev => prev + event.key);
      }
    };

    if (isScanning) {
      window.addEventListener("keydown", handleKeyDown);
      // Focus the hidden input to capture keystrokes
      if (inputRef.current) inputRef.current.focus();
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isScanning, manualInput]);

  const processBarcodeInput = () => {
    if (manualInput.trim()) {
      setScanResult(manualInput);
      setManualInput("");
    }
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    setScanResult("");
    setManualInput("");
    
    // Re-focus input when toggling on
    if (!isScanning && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const refreshDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setConnectedScanners(videoDevices);
    } catch (error) {
      console.error("Error refreshing devices:", error);
    }
  };

  const handleBackToPos = () => {
    window.history.back();
  };

  return (
    <div className="barcode-scanner-container">
      <header className="scanner-header">
        <h1>Barcode Scanner Setup</h1>
        <button onClick={handleBackToPos} className="pos-button">
          Back to POS
        </button>
      </header>

      <div className="scanner-content">
        <div className="scanner-devices">
          <h2>Connected Devices</h2>
          <div className="device-list">
            {connectedScanners.length > 0 ? (
              <ul>
                {connectedScanners.map((device) => (
                  <li key={device.deviceId}>
                    {device.label || `Scanner (${device.deviceId.slice(0, 8)}...)`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No barcode scanners detected</p>
            )}
            <button onClick={refreshDevices} className="pos-button pos-success">
              Refresh Devices
            </button>
          </div>
        </div>

        <div className="scanner-operation">
          <h2>Scan Barcode</h2>
          <div className="scan-controls">
            <button 
              onClick={toggleScanning} 
              className={`pos-button ${isScanning ? 'pos-danger' : 'pos-success'}`}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>
            
            {/* Hidden input to capture scanner input */}
            <input 
              ref={inputRef}
              type="text"
              className="hidden-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onBlur={() => isScanning && inputRef.current?.focus()}
              onKeyDown={(e) => e.key === "Enter" && processBarcodeInput()}
            />

            <div className="manual-entry">
              <p>Or enter barcode manually:</p>
              <div className="manual-input-group">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="pos-input"
                  placeholder="Type or scan barcode"
                />
                <button 
                  onClick={processBarcodeInput} 
                  className="pos-button pos-success"
                >
                  Process
                </button>
              </div>
            </div>
          </div>

          <div className="scan-result">
            <h3>Scan Result:</h3>
            {scanResult ? (
              <div className="result-display">
                <span>{scanResult}</span>
              </div>
            ) : (
              <p className="no-result">No barcode scanned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;