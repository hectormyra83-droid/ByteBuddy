import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  // no custom props
}

const Logo: React.FC<LogoProps> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width="40" 
      height="40"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(220, 90%, 60%)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(260, 100%, 70%)' }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
      <path 
        d="M38 25 V 75 H 55 C 68 75 75 68 75 55 C 75 42 68 35 55 35 H 38 M 50 35 V 58 H 58 C 65 58 68 55 68 50 C 68 45 65 42 58 42 H 50"
        fill="none"
        stroke="hsl(210 40% 98%)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M38 25 C 20 35 30 50 38 50"
        fill="none"
        stroke="hsl(210 40% 98%)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;