import React from 'react';

interface AwardIconProps {
  color?: string;
  className?: string;
  size?: number;
}

export const CrownVectorIcon: React.FC<AwardIconProps> = ({
  color = '#0B0C10',
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M2.5 18.5L2 7.5L7.5 12.2L12 4.5L16.5 12.2L22 7.5L21.5 18.5H2.5Z"
      fill={color}
    />
    <rect x="2.5" y="19.6" width="19" height="2.3" rx="1" fill={color} />
    <circle cx="2.2" cy="6.2" r="1.35" fill={color} />
    <circle cx="12" cy="3.4" r="1.35" fill={color} />
    <circle cx="21.8" cy="6.2" r="1.35" fill={color} />
  </svg>
);

export const CupVectorIcon: React.FC<AwardIconProps> = ({
  color = '#DC2626',
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M6.5 5.2C2.4 5.2 2.4 11.2 6.8 11.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 5.2C21.6 5.2 21.6 11.2 17.2 11.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.2 3.5H17.8L17.2 10.6C16.9 14.3 14.5 16 12 16.2C9.5 16 7.1 14.3 6.8 10.6L6.2 3.5Z"
      fill={color}
    />
    <rect x="10.6" y="15.6" width="2.8" height="3.6" fill={color} />
    <rect x="7.2" y="19" width="9.6" height="2.6" rx="1" fill={color} />
  </svg>
);
