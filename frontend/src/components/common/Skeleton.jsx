import React from 'react';

/**
 * A professional Skeleton primitive component.
 * @param {string} className - Additional classes for dimensions and custom styling
 * @param {string} variant - 'rect' | 'circle' | 'text'
 * @param {string} width - Custom width (can be tailwind class or style)
 * @param {string} height - Custom height (can be tailwind class or style)
 */
const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const baseClass = "skeleton inline-block";
  
  const variants = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 mb-2",
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
