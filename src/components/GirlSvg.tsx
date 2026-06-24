import React from 'react';

export default function GirlSvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      <style>{`
        .girl-leg {
          transform-origin: 90px 280px;
          animation: shiftLeg 3s ease-in-out infinite;
        }
        @keyframes shiftLeg {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        .girl-head {
          transform-origin: 100px 135px;
          animation: subtleNodGirl 6s ease-in-out infinite;
        }
        @keyframes subtleNodGirl {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(-3deg); }
          80% { transform: rotate(2deg); }
        }
        .hijab-tail {
          animation: flutterHijab 2s ease-in-out infinite;
        }
        @keyframes flutterHijab {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(5px) scaleY(1.05); }
        }
      `}</style>
      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]">
        <rect x="70" y="150" width="60" height="150" fill="#8e44ad" rx="10"/>
        <g className="girl-leg">
            <rect x="80" y="280" width="20" height="100" fill="#34495e" rx="10"/>
        </g>
        <g className="girl-head">
            <circle cx="100" cy="100" r="35" fill="#f1c40f"/>
            <path className="hijab-tail" d="M130 100 Q 160 150 130 200" stroke="#2c3e50" strokeWidth="15" fill="none"/>
        </g>
      </svg>
    </div>
  );
}
