'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { X, Clock, Navigation } from 'lucide-react';
import RadialDial from './RadialDial';

export default function GlobalBirdTracker() {
  const [profile, setProfile] = useState<any>(null);
  const [inTransitLetter, setInTransitLetter] = useState<Record<string, any> | null>(null);
  const [hasReached, setHasReached] = useState(false);
  const [genders, setGenders] = useState<{userGender: string | null, partnerGender: string | null}>({userGender: null, partnerGender: null});
  const [particles, setParticles] = useState<{x: number, y: number, destY: number, duration: number, delay: number}[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [timeStats, setTimeStats] = useState({ passed: '', remaining: '', passedPct: 0 });

  // Update time stats for the popup every second
  useEffect(() => {
    if (!showPopup || !inTransitLetter) return;
    
    const calculateTimes = () => {
      const now = Date.now();
      const start = new Date(inTransitLetter.createdAt as string).getTime();
      const end = new Date(inTransitLetter.deliverAt as string).getTime();
      
      const formatDuration = (ms: number) => {
        if (ms <= 0) return '0s';
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((ms % (1000 * 60)) / 1000);
        return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
      };
      
      let pct = ((now - start) / (end - start)) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setTimeStats({
        passed: formatDuration(Math.max(0, now - start)),
        remaining: formatDuration(Math.max(0, end - now)),
        passedPct: pct
      });
    };
    
    calculateTimes();
    const interval = setInterval(calculateTimes, 1000);
    return () => clearInterval(interval);
  }, [showPopup, inTransitLetter]);

  // We still fetch the letter to know who is who, but the animation is now continuous
  useEffect(() => {
    // Initialize particles here to avoid Math.random() during render (react-hooks/purity)
    setParticles(Array.from({ length: 15 }).map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * 160,
      destY: Math.random() * -50 - 20,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2
    })));

    const fetchLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setGenders({ userGender: json.userGender, partnerGender: json.partnerGender });
            if (json.data) {
              setInTransitLetter(json.data);
            } else {
              setInTransitLetter(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching global in-transit letter:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };

    fetchLetter();
    fetchProfile();
    const intervalId = setInterval(fetchLetter, 30000);
    
    window.addEventListener('letter-posted', fetchLetter);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('letter-posted', fetchLetter);
    };
  }, []);

  const progress = useMotionValue(0);

  // Run a continuous 60FPS loop for perfectly smooth time-based interpolation
  useAnimationFrame(() => {
    if (!inTransitLetter) return;

    const now = Date.now();
    const start = new Date(inTransitLetter.createdAt as string).getTime();
    const end = new Date(inTransitLetter.deliverAt as string).getTime();

    if (now >= end) {
      progress.set(100);
      if (!hasReached) setHasReached(true);
    } else if (now <= start) {
      progress.set(0);
      if (hasReached) setHasReached(false);
    } else {
      progress.set(((now - start) / (end - start)) * 100);
      if (hasReached) setHasReached(false);
    }
  });

  // Map the 0-100 progress directly into a CSS calc value continuously
  const birdLeftStyle = useTransform(progress, (p) => {
    const position = 15 + (p * 0.7); // 15% to 85%
    if (!inTransitLetter) return `calc(15% - 28px)`;
    return inTransitLetter.isSender ? `calc(${position}% - 28px)` : `calc(${100 - position}% - 28px)`;
  });

  return (
    <div className="absolute top-0 left-0 right-0 h-40 z-50 pointer-events-none overflow-hidden">
      
      {/* Current User Dial (Left) */}
      <div className="absolute left-24 md:left-28 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <RadialDial 
          side="left"
          avatarUrl={profile?.avatarUrl}
          name={profile?.name || "Me"}
        />
      </div>

      {/* Partner Dial (Right) */}
      <div className="absolute right-24 md:right-28 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <RadialDial 
          side="right"
          avatarUrl={profile?.partner?.avatarUrl}
          name={profile?.partner?.name || "Partner"}
          isPartnered={!!profile?.partner}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-text-primary/40 rounded-full"
          initial={{ 
            x: p.x, 
            y: p.y 
          }}
          animate={{ 
            y: [null, p.destY],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: p.delay 
          }}
        />
      ))}

      {/* The Bird - Progress Tracking */}
      {inTransitLetter && !hasReached && (
        <motion.div 
          className="absolute top-8 w-14 h-14 z-20 pointer-events-auto cursor-pointer"
          style={{ left: birdLeftStyle }}
          onClick={() => setShowPopup(true)}
        >
          {/* Bobbing Motion */}
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            {/* Realistic Bird Silhouette Animation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-text-primary drop-shadow-[0_0_8px_rgba(255,255,255,1)]" style={{ transform: inTransitLetter.isSender ? "scaleX(-1)" : "none" }}>
              <path fill="currentColor">
                <animate 
                  attributeName="d"
                  dur="0.4s"
                  repeatCount="indefinite"
                  values="
                    M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z;
                    M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                    M 30,50 Q 50,60 70,70 Q 60,60 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                    M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                    M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z
                  "
                />
              </path>
            </svg>

            {/* Dangling Letter Envelope */}
            <motion.div 
              className="absolute bottom-2 right-[18px] w-[14px] h-[10px] bg-text-primary rounded-sm shadow-lg flex flex-col overflow-hidden"
              animate={{ rotate: [-12, 12, -12], transformOrigin: "top center" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              {/* Envelope flap detail */}
              <div className="w-full h-[4px] border-b border-gray-300 relative">
                <div className="absolute top-0 left-0 right-0 h-full bg-red-400/20" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}></div>
              </div>
              {/* Envelope seal */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-red-500 rounded-full shadow-md"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Interactive Timeline Popup */}
      <AnimatePresence>
        {showPopup && inTransitLetter && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 w-80 bg-bg-secondary/95 backdrop-blur-xl border border-[#333] rounded-2xl shadow-2xl p-5 z-[60] pointer-events-auto"
          >
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 p-1.5 text-text-primary/50 hover:text-text-primary bg-bg-primary/20 hover:bg-bg-primary/40 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-[#c2410c]" />
                <h3 className="font-serif text-lg text-text-primary">Letter in Transit</h3>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#333] to-transparent" />
              
              <div className="space-y-3 font-mono">
                <div>
                  <div className="text-[10px] text-text-primary/40 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>Time Passed</span>
                    <span>{timeStats.passedPct.toFixed(1)}%</span>
                  </div>
                  <div className="text-text-primary text-sm font-medium">
                    {timeStats.passed}
                  </div>
                  <div className="mt-1 h-1 w-full bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c2410c]" style={{ width: `${timeStats.passedPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-text-primary/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} />
                    <span>Time Remaining</span>
                  </div>
                  <div className="text-[#c2410c] text-sm font-medium">
                    {timeStats.remaining}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
