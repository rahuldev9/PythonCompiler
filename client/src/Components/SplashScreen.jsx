import { useEffect, useState } from "react";
import { FaPython } from "react-icons/fa";

const SplashScreen = ({ duration = 3000 }) => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const loadingText = "Loading your python coding experience...";
  const [typedText, setTypedText] = useState("");

  // Progress bar & timer logic
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);
      if (percentage >= 100) {
        clearInterval(interval);
        setShow(false);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setTypedText(loadingText.slice(0, index + 1));
      index++;
      if (index >= loadingText.length) clearInterval(typingInterval);
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="text-6xl text-yellow-400 mb-6 animate-bounce">
        <FaPython />
      </div>
      <h1 className="text-white text-5xl font-bold mb-4 animate-pulse">
      CodePy
      </h1>
      <p className="text-gray-300 text-sm h-6">{typedText}</p>
      <div className="w-64 h-2 bg-gray-700 rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-blue-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
