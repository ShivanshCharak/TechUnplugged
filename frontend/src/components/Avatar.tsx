import React from 'react';
import { AvatarProps } from '../types';

export const Avatar: React.FC<AvatarProps> = ({ size, name }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    big: 'w-16 h-16 text-xl'
  };
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};