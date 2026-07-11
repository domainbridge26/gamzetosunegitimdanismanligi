import React from 'react';

interface LogoIconProps {
  className?: string;
  color?: string;
}

export default function LogoIcon({ className = "w-12 h-12", color = "#2D2D2D" }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      id="gamze-tosun-logo-svg"
    >
      {/* Central vertical line */}
      <line x1="60" y1="18" x2="60" y2="102" strokeWidth="2.2" stroke={color} />

      {/* Outer lyre-like curved guidelines */}
      {/* Left side curve */}
      <path
        d="M38,34 C36,55 44,72 60,75"
        strokeWidth="2.2"
        stroke={color}
        fill="none"
      />
      {/* Left side wing flare */}
      <path
        d="M38,34 C37,28 31,23 23,23"
        strokeWidth="2.2"
        stroke={color}
        fill="none"
      />

      {/* Right side curve */}
      <path
        d="M82,34 C84,55 76,72 60,75"
        strokeWidth="2.2"
        stroke={color}
        fill="none"
      />
      {/* Right side wing flare */}
      <path
        d="M82,34 C83,28 89,23 97,23"
        strokeWidth="2.2"
        stroke={color}
        fill="none"
      />

      {/* Open Book in the center */}
      {/* Left page */}
      <path
        d="M60,53 C52,50 48,53 48,53 L48,39 C48,39 52,36 60,39 Z"
        strokeWidth="2"
        stroke={color}
        fill="none"
      />
      {/* Right page */}
      <path
        d="M60,53 C68,50 72,53 72,53 L72,39 C72,39 68,36 60,39 Z"
        strokeWidth="2"
        stroke={color}
        fill="none"
      />

      {/* Laurel Wreath Leaves */}
      {/* Left branch leaves */}
      {/* Leaf 1 */}
      <path d="M41,39 C40,37 42,34 45,35 C45,37 43,40 41,39 Z" fill={color} stroke="none" />
      {/* Leaf 2 */}
      <path d="M40,46 C39,44 41,41 44,42 C44,44 42,47 40,46 Z" fill={color} stroke="none" />
      {/* Leaf 3 */}
      <path d="M41,53 C40,51 42,48 45,49 C45,51 43,54 41,53 Z" fill={color} stroke="none" />
      {/* Leaf 4 */}
      <path d="M44,60 C43,58 46,55 48,56 C48,58 46,61 44,60 Z" fill={color} stroke="none" />
      {/* Leaf 5 */}
      <path d="M50,65 C49,63 52,60 54,61 C54,63 52,66 50,65 Z" fill={color} stroke="none" />

      {/* Right branch leaves */}
      {/* Leaf 1 */}
      <path d="M79,39 C80,37 78,34 75,35 C75,37 77,40 79,39 Z" fill={color} stroke="none" />
      {/* Leaf 2 */}
      <path d="M80,46 C81,44 79,41 76,42 C76,44 78,47 80,46 Z" fill={color} stroke="none" />
      {/* Leaf 3 */}
      <path d="M79,53 C80,51 78,48 75,49 C75,51 77,54 79,53 Z" fill={color} stroke="none" />
      {/* Leaf 4 */}
      <path d="M76,60 C77,58 74,55 72,56 C72,58 74,61 76,60 Z" fill={color} stroke="none" />
      {/* Leaf 5 */}
      <path d="M70,65 C71,63 68,60 66,61 C66,63 68,66 70,65 Z" fill={color} stroke="none" />
    </svg>
  );
}
