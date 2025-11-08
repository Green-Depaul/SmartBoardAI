import React from 'react';
import { cn } from './utils';

interface MaterialIconProps {
  name: string;
  variant?: 'filled' | 'outlined' | 'round';
  size?: 'small' | 'medium' | 'large' | number;
  className?: string;
  style?: React.CSSProperties;
}

export function MaterialIcon({ 
  name, 
  variant = 'filled', 
  size = 'medium', 
  className, 
  style 
}: MaterialIconProps) {
  const getClassName = () => {
    switch (variant) {
      case 'outlined':
        return 'material-icons-outlined';
      case 'round':
        return 'material-icons-round';
      default:
        return 'material-icons';
    }
  };

  const getSizeStyle = () => {
    if (typeof size === 'number') {
      return { fontSize: `${size}px`, ...style };
    }
    
    const sizeMap = {
      small: '18px',
      medium: '24px',
      large: '36px'
    };
    
    return { fontSize: sizeMap[size], ...style };
  };

  return (
    <span 
      className={cn(getClassName(), className)}
      style={getSizeStyle()}
    >
      {name}
    </span>
  );
}