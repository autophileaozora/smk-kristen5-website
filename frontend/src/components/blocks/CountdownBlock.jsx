import { useState, useEffect } from 'react';

// Countdown Block - Display countdown timer for events
const CountdownBlock = ({
  title = 'Pendaftaran Dibuka',
  subtitle = 'Jangan lewatkan kesempatan mendaftar!',
  targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  expiredMessage = 'Waktu telah berakhir!',
  buttonText = 'Daftar Sekarang',
  buttonUrl = '/pendaftaran',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  variant = 'default', // default, minimal, boxed, gradient
  size = 'lg', // sm, md, lg
  backgroundColor = 'primary',
  backgroundImage = '',
}) => {

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const bgClasses = {
    primary: 'bg-primary-600 text-white',
    dark: 'bg-gray-900 text-white',
    blue: 'bg-blue-600 text-white',
    gradient: 'bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 text-white',
    white: 'bg-white text-gray-900',
  };

  const sizeClasses = {
    sm: { number: 'text-2xl', label: 'text-xs', padding: 'py-8' },
    md: { number: 'text-4xl', label: 'text-sm', padding: 'py-12' },
    lg: { number: 'text-5xl md:text-6xl', label: 'text-base', padding: 'py-16' },
  };

  const formatNumber = (num) => String(num).padStart(2, '0');

  const TimeUnit = ({ value, label }) => {
    const sizeConfig = sizeClasses[size] || sizeClasses.lg;

    if (variant === 'boxed') {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[70px] md:min-w-[100px]">
            <span className={`${sizeConfig.number} font-bold block text-center`}>
              {formatNumber(value)}
            </span>
          </div>
          <span className={`${sizeConfig.label} mt-2 uppercase tracking-wider opacity-80`}>{label}</span>
        </div>
      );
    }

    if (variant === 'minimal') {
      return (
        <div className="text-center px-2 md:px-4">
          <span className={`${sizeConfig.number} font-bold`}>{formatNumber(value)}</span>
          <span className={`${sizeConfig.label} block opacity-80`}>{label}</span>
        </div>
      );
    }

    // Default variant
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <span className={`${sizeConfig.number} font-bold`}>{formatNumber(value)}</span>
        </div>
        <span className={`${sizeConfig.label} uppercase tracking-wider opacity-80`}>{label}</span>
      </div>
    );
  };

  const Separator = () => (
    <span className={`${sizeClasses[size]?.number || 'text-5xl'} font-bold opacity-50 px-1 md:px-2`}>:</span>
  );

  const sizeConfig = sizeClasses[size] || sizeClasses.lg;

  return (
    <section
      className={`${sizeConfig.padding} px-4 relative overflow-hidden ${
        bgClasses[backgroundColor] || bgClasses.primary
      }`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Overlay for background image */}
      {backgroundImage && <div className="absolute inset-0 bg-black/60" />}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>}
        {subtitle && <p className="text-lg opacity-80 mb-8">{subtitle}</p>}

        {timeLeft.expired ? (
          <div className="text-2xl md:text-4xl font-bold py-8">{expiredMessage}</div>
        ) : (
          <div className="flex justify-center items-start gap-2 md:gap-4 flex-wrap mb-8">
            {showDays && (
              <>
                <TimeUnit value={timeLeft.days} label="Hari" />
                {(showHours || showMinutes || showSeconds) && <Separator />}
              </>
            )}
            {showHours && (
              <>
                <TimeUnit value={timeLeft.hours} label="Jam" />
                {(showMinutes || showSeconds) && <Separator />}
              </>
            )}
            {showMinutes && (
              <>
                <TimeUnit value={timeLeft.minutes} label="Menit" />
                {showSeconds && <Separator />}
              </>
            )}
            {showSeconds && <TimeUnit value={timeLeft.seconds} label="Detik" />}
          </div>
        )}

        {buttonText && buttonUrl && !timeLeft.expired && (
          <a
            href={buttonUrl}
            className={`inline-block px-8 py-3 rounded-full font-bold transition-all hover:scale-105 ${
              backgroundColor === 'white'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

export default CountdownBlock;
