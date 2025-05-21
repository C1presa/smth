import React from 'react';
import { getThemeColor } from '../styles/theme';
import CardEffect from './CardEffect';

const Card = ({ 
  name, 
  archetype, 
  cost, 
  attack, 
  health, 
  effects = [], 
  isActive = false,
  onClick,
  className = ''
}) => {
  const themeColor = getThemeColor(archetype);
  
  return (
    <div 
      className={`card ${archetype.toLowerCase()} ${isActive ? 'active' : ''} ${className}`}
      style={{
        borderColor: themeColor.primary,
        background: themeColor.gradient
      }}
      onClick={onClick}
    >
      <div className="card-header">
        <span className="card-name">{name}</span>
        <span className="card-cost">{cost}</span>
      </div>
      
      <div className="card-body">
        <div className="card-stats">
          <span className="card-attack">{attack}</span>
          <span className="card-health">{health}</span>
        </div>
        
        {effects.length > 0 && (
          <div className="card-effects">
            {effects.map((effect, index) => (
              <CardEffect
                key={`${effect.type}-${index}`}
                type={effect.type}
                value={effect.value}
                isActive={isActive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card; 