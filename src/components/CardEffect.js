import React from 'react';
import { getEffectStyle } from '../styles/theme';

const CardEffect = ({ type, value, isActive = false }) => {
  const effectStyle = getEffectStyle(type);
  
  return (
    <div 
      className={`effect-icon ${type.toLowerCase()} ${isActive ? 'active' : ''}`}
      style={{
        backgroundColor: effectStyle.color,
        border: `2px solid ${effectStyle.border}`,
        animation: isActive ? effectStyle.animation : 'none'
      }}
      title={`${type}: ${value}`}
    >
      {effectStyle.icon}
      {value > 1 && <span className="effect-value">{value}</span>}
    </div>
  );
};

export default CardEffect; 