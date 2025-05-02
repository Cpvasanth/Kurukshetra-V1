'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

interface MatchCountdownProps {
  targetDate: Date;
}

export function MatchCountdown({ targetDate }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const secondsDifference = differenceInSeconds(targetDate, now);

      if (secondsDifference <= 0) {
        setTimeLeft(null);
        setHasStarted(true);
        return;
      }

      setHasStarted(false);
      const duration = intervalToDuration({ start: now, end: targetDate });
      setTimeLeft(duration);
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  if (hasStarted) {
    return <div className="text-center font-semibold text-green-600 animate-pulse">Match in Progress!</div>;
  }

  if (!timeLeft) {
    return <div className="text-center font-semibold text-muted-foreground">Calculating time...</div>; // Or a loading state
  }

  const formatUnit = (value: number | undefined) => (value ?? 0).toString().padStart(2, '0');

  // Determine text color based on proximity
   const totalSecondsLeft = differenceInSeconds(targetDate, new Date());
   let textColorClass = 'text-primary';
   if (totalSecondsLeft < 60 * 5) { // Less than 5 minutes
       textColorClass = 'text-red-600 animate-pulse'; // Urgent Red
   } else if (totalSecondsLeft < 60 * 60) { // Less than 1 hour
       textColorClass = 'text-orange-500'; // Warning Orange
   }

  return (
    <div className={`flex justify-center items-baseline space-x-2 font-mono text-xl font-bold ${textColorClass} transition-colors duration-500`}>
      {timeLeft.days && timeLeft.days > 0 ? (
        <div className="text-center">
          <span className="block text-3xl animate-countdown-tick">{formatUnit(timeLeft.days)}</span>
          <span className="text-xs font-medium text-muted-foreground">Days</span>
        </div>
      ) : null}
      { (timeLeft.days && timeLeft.days > 0) || (timeLeft.hours && timeLeft.hours > 0) ? (
        <div className="text-center">
          <span className="block text-3xl animate-countdown-tick">{formatUnit(timeLeft.hours)}</span>
          <span className="text-xs font-medium text-muted-foreground">Hours</span>
        </div>
      ) : null}
      <div className="text-center">
        <span className="block text-3xl animate-countdown-tick">{formatUnit(timeLeft.minutes)}</span>
        <span className="text-xs font-medium text-muted-foreground">Mins</span>
      </div>
      <div className="text-center">
        <span className="block text-3xl animate-countdown-tick">{formatUnit(timeLeft.seconds)}</span>
        <span className="text-xs font-medium text-muted-foreground">Secs</span>
      </div>
       <style jsx>{`
         @keyframes countdownTick {
           0% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.1); opacity: 0.8; }
           100% { transform: scale(1); opacity: 1; }
         }
         .animate-countdown-tick {
            /* Apply animation with a slight delay to stagger */
            animation: countdownTick 1s ease-in-out infinite;
         }
         /* Stagger the animation slightly for each unit */
         div:nth-child(1) span:first-child { animation-delay: 0s; }
         div:nth-child(2) span:first-child { animation-delay: 0.1s; }
         div:nth-child(3) span:first-child { animation-delay: 0.2s; }
         div:nth-child(4) span:first-child { animation-delay: 0.3s; }
       `}</style>
    </div>
  );
}
