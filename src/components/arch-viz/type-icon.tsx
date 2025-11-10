
'use client';

import React from 'react';
import { Box, Circle, Puzzle, FileCode, Minus } from 'lucide-react';

interface TypeIconProps {
  type: string;
  className?: string;
}

export function TypeIcon({ type, className }: TypeIconProps) {
  const props = {
    className,
    'aria-label': type,
  };
  
  switch (type) {
    case 'Componente':
      return <Box {...props} />;
    case 'Servicio':
      return <Circle {...props} />;
    case 'Módulo':
      return <Puzzle {...props} />;
    case 'Clase':
      return <FileCode {...props} />;
    default:
      return <Minus {...props} />;
  }
}
