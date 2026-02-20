const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
