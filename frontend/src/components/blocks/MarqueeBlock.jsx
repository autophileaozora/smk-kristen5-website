const MarqueeBlock = ({
  text = 'Enter your scrolling text here',
  speed = 'normal',
  direction = 'left',
  bgColor = 'primary',
  textColor = 'white',
  pauseOnHover = true,
}) => {
  const speedClasses = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: 'animate-marquee-fast',
  };

  const bgColorClasses = {
    primary: 'bg-primary-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    gray: 'bg-gray-700',
    white: 'bg-white border-y border-gray-200',
  };

  const textColorClasses = {
    white: 'text-white',
    black: 'text-black',
    primary: 'text-primary-600',
    gray: 'text-gray-700',
  };

  return (
    <div className={`relative overflow-hidden py-3 ${bgColorClasses[bgColor] || bgColorClasses.primary} my-6`}>
      <div
        className={`
          flex whitespace-nowrap
          ${speedClasses[speed] || speedClasses.normal}
          ${direction === 'right' ? 'animate-reverse' : ''}
          ${pauseOnHover ? 'hover:pause' : ''}
        `}
      >
        <span className={`inline-block px-4 text-lg font-medium ${textColorClasses[textColor] || textColorClasses.white}`}>
          {text}
        </span>
        <span className={`inline-block px-4 text-lg font-medium ${textColorClasses[textColor] || textColorClasses.white}`}>
          {text}
        </span>
        <span className={`inline-block px-4 text-lg font-medium ${textColorClasses[textColor] || textColorClasses.white}`}>
          {text}
        </span>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes marquee-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes marquee-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }

        .animate-marquee-fast {
          animation: marquee-fast 10s linear infinite;
        }

        .animate-reverse {
          animation-direction: reverse;
        }

        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarqueeBlock;
