import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px] rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-9 h-9 text-xs rounded-xl',
  lg: 'w-12 h-12 text-sm rounded-2xl',
  xl: 'w-14 h-14 text-base rounded-2xl',
};

// Generates consistent soft background color based on name
function getAvatarGradient(name: string): string {
  const colors = [
    'from-emerald-500 to-teal-600 text-white',
    'from-blue-500 to-indigo-600 text-white',
    'from-violet-500 to-purple-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
    'from-cyan-500 to-blue-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(name);
  const gradientClass = getAvatarGradient(name || 'User');

  // Treat empty string or local mock placeholders as missing images
  const isValidSrc = Boolean(src && src.trim() && src !== '#' && !imageError);

  if (isValidSrc) {
    return (
      <img
        src={src!}
        alt=""
        onError={() => setImageError(true)}
        className={`${sizeClass} object-cover shrink-0 ring-1 ring-emerald-500/20 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold tracking-wider shrink-0 shadow-xs select-none ${className}`}
    >
      {initials}
    </div>
  );
};
