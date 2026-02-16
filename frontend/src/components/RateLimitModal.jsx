import React, { useEffect, useState } from 'react';

const RateLimitModal = () => {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Listen for rate limit events
    const handleRateLimit = () => {
      setShow(true);
      setCountdown(5);
    };

    window.addEventListener('rateLimitExceeded', handleRateLimit);

    return () => {
      window.removeEventListener('rateLimitExceeded', handleRateLimit);
    };
  }, []);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, countdown]);

  const handleClose = () => {
    setShow(false);
    setCountdown(5);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div className="bg-base-100 rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-bounce-in border-4 border-warning">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg
              className="w-24 h-24 text-warning animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <div className="absolute -top-2 -right-2">
              <svg
                className="w-10 h-10 text-error animate-spin-slow"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-warning text-center mb-4">
          Slow Down! 🚦
        </h2>

        {/* Message */}
        <div className="bg-base-200 rounded-2xl p-6 mb-6">
          <p className="text-xl text-center font-bold text-primary mb-3">
            Free server bro konjam wait pannunga after 5 minutes ku aprom check pannunga, peace jingala!! 🤙
          </p>
          <div className="divider my-2"></div>
          <p className="text-sm text-center text-gray-400">
            Too many requests! Please wait and try again in a few minutes.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="radial-progress text-accent" style={{ "--value": (countdown / 5) * 100, "--size": "4rem", "--thickness": "6px" }}>
            <span className="text-2xl font-bold">{countdown}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-300">Auto close in</p>
            <p className="text-xs text-gray-500">{countdown} seconds</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="btn btn-warning w-full text-lg font-bold hover:scale-105 transition-transform"
        >
          Okay, Got it! 👍
        </button>

        <style>
          {`
          @keyframes bounce-in {
            0% { 
              opacity: 0; 
              transform: scale(0.5) translateY(-50px);
            }
            60% {
              transform: scale(1.1) translateY(0);
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateY(0);
            }
          }
          .animate-bounce-in {
            animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default RateLimitModal;
