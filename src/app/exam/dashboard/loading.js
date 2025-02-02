export default function loading() {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-animation overflow-hidden">
        <div className="relative flex items-center justify-center">
          {/* Outer Glowing Orbs */}
          <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 opacity-75 animate-ping"></div>
          <div className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-75 animate-ping delay-200"></div>
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-75 animate-ping delay-400"></div>
  
          {/* Central Multi-Layered Spinning Discs */}
          <div className="absolute w-28 h-28 border-4 border-solid border-transparent border-t-blue-400 border-b-yellow-400 rounded-full animate-spin-fast"></div>
          <div className="absolute w-20 h-20 border-4 border-solid border-transparent border-l-purple-400 border-r-green-400 rounded-full animate-spin-reverse-fast"></div>
          <div className="absolute w-12 h-12 bg-white rounded-full shadow-lg animate-pulse-fast"></div>
  
          {/* Inner Rotating Gradient Rings */}
          <div className="absolute w-48 h-48 border-4 border-dotted border-indigo-300 rounded-full animate-spin-reverse"></div>
          <div className="absolute w-64 h-64 border-4 border-dotted border-pink-300 rounded-full animate-spin-reverse-slow"></div>
  
          {/* Additional Spinning Layers */}
          <div className="absolute w-80 h-80 border-2 border-dashed border-white rounded-full animate-spin-extra-slow"></div>
          <div className="absolute w-96 h-96 border-2 border-dotted border-yellow-200 rounded-full animate-spin-extra-reverse-slow"></div>
        </div>
      </div>
    );
  }
  