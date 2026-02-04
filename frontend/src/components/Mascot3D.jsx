import { useState, useEffect, useRef } from 'react';

const Mascot3D = ({ size = 80 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const mascotRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (mascotRef.current) {
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const deltaX = mousePos.x - mascotCenterX;
      const deltaY = mousePos.y - mascotCenterY;

      // Calculate distance for normalization
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 300;
      const normalizedDistance = Math.min(distance / maxDistance, 1);

      // Eye movement - more responsive
      const maxEyeOffset = 5;
      const eyeX = distance > 0 ? (deltaX / distance) * normalizedDistance * maxEyeOffset : 0;
      const eyeY = distance > 0 ? (deltaY / distance) * normalizedDistance * maxEyeOffset : 0;
      setEyeOffset({ x: eyeX, y: eyeY });

      // Head tilt - subtle rotation
      const maxTiltX = 8; // degrees for left-right rotation
      const maxTiltY = 5; // degrees for up-down tilt
      const tiltX = (deltaX / maxDistance) * maxTiltX;
      const tiltY = (deltaY / maxDistance) * maxTiltY;
      setHeadTilt({
        x: Math.max(-maxTiltX, Math.min(maxTiltX, tiltX)),
        y: Math.max(-maxTiltY, Math.min(maxTiltY, tiltY))
      });
    }
  }, [mousePos]);

  return (
    <div
      ref={mascotRef}
      className="relative inline-block"
      style={{
        width: size,
        height: size,
        perspective: '500px',
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(var(--tilt-y)) rotateY(var(--tilt-x)); }
          50% { transform: translateY(-10px) rotateX(var(--tilt-y)) rotateY(var(--tilt-x)); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.7)); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `rotateY(${headTilt.x}deg) rotateX(${-headTilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{
            animation: 'glow 2s ease-in-out infinite',
            overflow: 'visible'
          }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="bodyGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="30%" stopColor="#60a5fa" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="earGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="innerEarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f9a8d4" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <radialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="highlight" cx="25%" cy="25%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="shadowGradient" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e3a8a" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Shadow under mascot */}
          <ellipse cx="50" cy="92" rx="25" ry="6" fill="url(#shadowGradient)" />

          {/* Left ear */}
          <ellipse
            cx="25" cy="22" rx="14" ry="18"
            fill="url(#earGradient)"
            transform="rotate(-15 25 22)"
            filter="url(#softShadow)"
          />
          <ellipse
            cx="25" cy="25" rx="7" ry="10"
            fill="url(#innerEarGradient)"
            transform="rotate(-15 25 25)"
          />

          {/* Right ear */}
          <ellipse
            cx="75" cy="22" rx="14" ry="18"
            fill="url(#earGradient)"
            transform="rotate(15 75 22)"
            filter="url(#softShadow)"
          />
          <ellipse
            cx="75" cy="25" rx="7" ry="10"
            fill="url(#innerEarGradient)"
            transform="rotate(15 75 25)"
          />

          {/* Main body/head with 3D effect */}
          <ellipse
            cx="50" cy="55" rx="36" ry="33"
            fill="url(#bodyGradient3D)"
            filter="url(#softShadow)"
          />

          {/* Highlight on body for 3D effect */}
          <ellipse
            cx="50" cy="55" rx="36" ry="33"
            fill="url(#highlight)"
          />

          {/* Left eye white */}
          <ellipse
            cx="36" cy="52" rx="11" ry="12"
            fill="white"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
          />

          {/* Right eye white */}
          <ellipse
            cx="64" cy="52" rx="11" ry="12"
            fill="white"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
          />

          {/* Left pupil - follows cursor */}
          <g style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
            transition: 'transform 0.08s ease-out',
            transformOrigin: '36px 52px'
          }}>
            <circle cx="36" cy="53" r="6" fill="#1e293b" />
            <circle cx="34" cy="50" r="2.5" fill="white" />
            <circle cx="38" cy="55" r="1" fill="white" opacity="0.5" />
          </g>

          {/* Right pupil - follows cursor */}
          <g style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
            transition: 'transform 0.08s ease-out',
            transformOrigin: '64px 52px'
          }}>
            <circle cx="64" cy="53" r="6" fill="#1e293b" />
            <circle cx="62" cy="50" r="2.5" fill="white" />
            <circle cx="66" cy="55" r="1" fill="white" opacity="0.5" />
          </g>

          {/* Cheeks */}
          <ellipse cx="20" cy="62" rx="7" ry="5" fill="url(#cheekGradient)" />
          <ellipse cx="80" cy="62" rx="7" ry="5" fill="url(#cheekGradient)" />

          {/* Nose - small and cute */}
          <ellipse cx="50" cy="62" rx="4" ry="3" fill="#1e40af" />
          <ellipse cx="49" cy="61" rx="1.5" ry="1" fill="#3b82f6" opacity="0.5" />

          {/* Mouth - cute smile */}
          <path
            d="M 40 70 Q 50 78 60 70"
            stroke="#1e40af"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sparkles around mascot */}
          <g fill="#93c5fd">
            <circle cx="10" cy="35" r="2">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="30" r="1.5">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="8" cy="70" r="1.5">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="92" cy="65" r="2">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Small stars */}
          <g fill="#dbeafe">
            <path d="M 5 50 l 2 -2 l 2 2 l -2 2 z">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M 95 45 l 1.5 -1.5 l 1.5 1.5 l -1.5 1.5 z">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Mascot3D;
