import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { orderAPI } from '../../services/api';
import { FiCamera, FiDollarSign, FiPackage, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Scanner = () => {
  const [scanMode, setScanMode] = useState('PAYMENT'); // PAYMENT or SERVE
  const [scanning, setScanning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );
      
      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Failed to start camera. Please allow camera access.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    
    try {
      if (scanMode === 'PAYMENT') {
        const response = await orderAPI.scanForPayment(decodedText);
        setScannedOrder(response.data.order);
      } else {
        const response = await orderAPI.scanForServe(decodedText);
        setScannedOrder(response.data.order);
        toast.success('Order served successfully!');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.response?.data?.message || 'Invalid QR code');
      setScannedOrder(null);
    }
  };

  const onScanError = (error) => {
    // Ignore scan errors (happens constantly while scanning)
  };

  const handleMarkPaid = async () => {
    if (!scannedOrder) return;
    
    setLoading(true);
    try {
      await orderAPI.markPaid(scannedOrder.order_id);
      toast.success('Payment confirmed! Order added to queue.');
      setScannedOrder(null);
    } catch (error) {
      console.error('Error marking paid:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedOrder(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">QR Scanner</h1>
        <p className="text-gray-400">Scan order QR codes for payment or serving</p>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Mode Selection */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Scan Mode</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setScanMode('PAYMENT');
                setScannedOrder(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                scanMode === 'PAYMENT'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <FiDollarSign />
              Payment Scan
            </button>
            <button
              onClick={() => {
                setScanMode('SERVE');
                setScannedOrder(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                scanMode === 'SERVE'
                  ? 'border-green-500 bg-green-500/10 text-green-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <FiPackage />
              Serve Scan
            </button>
          </div>
        </div>

        {/* Mode Description */}
        <div className={`mb-6 p-4 rounded-lg border ${
          scanMode === 'PAYMENT' 
            ? 'bg-orange-500/10 border-orange-500/30' 
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-start gap-3">
            <FiAlertCircle className={`text-xl mt-0.5 ${
              scanMode === 'PAYMENT' ? 'text-orange-400' : 'text-green-400'
            }`} />
            <div>
              <p className={`font-medium ${
                scanMode === 'PAYMENT' ? 'text-orange-400' : 'text-green-400'
              }`}>
                {scanMode === 'PAYMENT' ? 'Payment Mode' : 'Serve Mode'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {scanMode === 'PAYMENT' 
                  ? 'For offline orders awaiting payment at Counter A. Scan to confirm payment received.'
                  : 'For ready orders. Scan when customer collects their order to mark as served.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Scanner */}
        {!scannedOrder && (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div 
              id="qr-reader" 
              ref={scannerRef}
              className={`w-full ${scanning ? '' : 'hidden'}`}
            ></div>
            
            {!scanning && (
              <div className="p-12 text-center">
                <FiCamera className="text-5xl text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Click below to start scanning</p>
                <button
                  onClick={startScanner}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    scanMode === 'PAYMENT'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Start Scanner
                </button>
              </div>
            )}

            {scanning && (
              <div className="p-4 text-center">
                <p className="text-gray-400 mb-3">Point camera at QR code</p>
                <button
                  onClick={stopScanner}
                  className="text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scanned Order */}
        {scannedOrder && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Order Found</h3>
              <button
                onClick={resetScanner}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID</span>
                <span className="font-mono text-orange-400">
                  #{scannedOrder.order_id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-medium ${
                  scannedOrder.order_status === 'SERVED' 
                    ? 'text-gray-500' 
                    : scannedOrder.order_status === 'READY'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                }`}>
                  {scannedOrder.order_status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-white">₹{scannedOrder.total_amount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Counter</span>
                <span className="text-white">{scannedOrder.counter}</span>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-400 mb-2">Items:</p>
                {scannedOrder.items.map((item, i) => (
                  <p key={i} className="text-white">
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              {/* Actions based on mode */}
              {scanMode === 'PAYMENT' && scannedOrder.order_status === 'AWAITING_PAYMENT' && (
                <button
                  onClick={handleMarkPaid}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold py-3 rounded-lg mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Confirm Payment
                    </>
                  )}
                </button>
              )}

              {scanMode === 'SERVE' && scannedOrder.order_status === 'SERVED' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center mt-4">
                  <FiCheck className="text-3xl text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Order Served Successfully!</p>
                </div>
              )}

              <button
                onClick={() => {
                  resetScanner();
                  startScanner();
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg mt-2"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
