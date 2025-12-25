import React from 'react';

interface SeekIconProps {
  className?: string;
}

// YouTube-style backward seek icon (circular arrow pointing left with "10" inside)
export const SeekBackward10: React.FC<SeekIconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Circular arrow */}
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    {/* Number 1 */}
    <text x="8.5" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">1</text>
    {/* Number 0 */}
    <text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">0</text>
  </svg>
);

// YouTube-style forward seek icon (circular arrow pointing right with "10" inside)
export const SeekForward10: React.FC<SeekIconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Circular arrow */}
    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
    {/* Number 1 */}
    <text x="8.5" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">1</text>
    {/* Number 0 */}
    <text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">0</text>
  </svg>
);
