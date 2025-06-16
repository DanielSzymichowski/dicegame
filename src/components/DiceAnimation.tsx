import React from 'react';
import { Dice6 } from 'lucide-react';

function DiceAnimation() {
  return (
    <div className="relative">
      <Dice6 className="w-12 h-12 text-blue-600 animate-spin" />
      <div className="absolute inset-0 animate-pulse">
        <Dice6 className="w-12 h-12 text-blue-400" />
      </div>
    </div>
  );
}

export default DiceAnimation;