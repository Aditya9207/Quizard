import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { timeConverter } from '../../utils';

const Countdown = ({ countdownTime, timeOver, setTimeTaken }) => {
  const totalTime = countdownTime * 1000;
  const [timerTime, setTimerTime] = useState(totalTime);
  const { hours, minutes, seconds } = timeConverter(timerTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = timerTime - 1000;

      if (newTime >= 0) {
        setTimerTime(newTime);
      } else {
        clearInterval(timer);
        Swal.fire({
          icon: 'info',
          title: "Oops! Time's up.",
          text: 'See how you did!',
          confirmButtonText: 'Check Results',
          confirmButtonColor: '#7C3AED',
          background: '#ffffff',
          color: '#1E1B4B',
          timer: 5000,
          willClose: () => timeOver(totalTime - timerTime),
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      setTimeTaken(totalTime - timerTime + 1000);
    };
    // eslint-disable-next-line
  }, [timerTime]);

  const remainingSec = timerTime / 1000;
  
  // Color thresholds based on absolute seconds remaining
  const isGreen = remainingSec > 60;
  const isAmber = remainingSec <= 60 && remainingSec > 30;
  const isRed = remainingSec <= 30;

  const colors = {
    bg: isGreen ? 'rgba(16, 185, 129, 0.1)' : isAmber ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    border: isGreen ? 'rgba(16, 185, 129, 0.3)' : isAmber ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    text: isGreen ? '#10B981' : isAmber ? '#F59E0B' : '#EF4444',
  };

  return (
    <motion.div 
      animate={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      transition={{ duration: 0.4 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-solid text-sm font-mono font-bold ${isRed ? 'animate-shake' : ''}`}
      title="When timer reaches zero, the quiz ends automatically and your results are shown"
    >
      <Clock className="w-4 h-4" />
      <div className="flex items-center gap-0.5 tracking-wider">
        <span>{hours}</span>
        <span className="opacity-50 font-sans">:</span>
        <span>{minutes}</span>
        <span className="opacity-50 font-sans">:</span>
        <span>{seconds}</span>
      </div>
    </motion.div>
  );
};

Countdown.propTypes = {
  countdownTime: PropTypes.number.isRequired,
  timeOver: PropTypes.func.isRequired,
  setTimeTaken: PropTypes.func.isRequired,
};

export default Countdown;
