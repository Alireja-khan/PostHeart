import React from 'react';

export default function BoySvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      <style>{`
        .boy-shirt {
          transform-origin: 100px 140px; 
          animation: waveShirt 4s ease-in-out infinite;
        }
        @keyframes waveShirt {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(-5deg); }
        }
        .boy-head {
          transform-origin: 100px 135px;
          animation: subtleNod 6s ease-in-out infinite;
        }
        @keyframes subtleNod {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(3deg); }
          70% { transform: rotate(-2deg); }
        }
      `}</style>
      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]">
        <rect x="70" y="150" width="60" height="200" fill="#2c3e50" rx="10"/>
        <path className="boy-shirt" d="M60 140 L140 140 L150 260 L50 260 Z" fill="#1abc9c"/>
        <g className="boy-head">
            <circle cx="100" cy="100" r="35" fill="#f1c40f"/>
            <rect x="70" y="60" width="60" height="20" fill="#34495e"/>
        </g>
      </svg>
    </div>
  );
}
