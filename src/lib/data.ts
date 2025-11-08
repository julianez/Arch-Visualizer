import type { Componente } from './types';

export const initialData: Componente[] = [
  // Aplicación 1: Core System
  { id: 'A1', nombre: 'Microservicio Core', aplicacionId: 'APL-1', padreId: null, tipo: 'Componente', nivel: 1 },
  { id: 'A2', nombre: 'API de Productos', aplicacionId: 'APL-1', padreId: 'A1', tipo: 'Servicio', nivel: 2 },
  { id: 'A3', nombre: 'Módulo de Inventario', aplicacionId: 'APL-1', padreId: 'A2', tipo: 'Módulo', nivel: 3 },
  { id: 'A4', nombre: 'Base de Datos SQL', aplicacionId: 'APL-1', padreId: 'A1', tipo: 'Clase', nivel: 2 },

  // Aplicación 2: Reporting
  { id: 'B1', nombre: 'Servidor de Reportes', aplicacionId: 'APL-2', padreId: null, tipo: 'Componente', nivel: 1 },
  { id: 'B2', nombre: 'Exportador PDF', aplicacionId: 'APL-2', padreId: 'B1', tipo: 'Servicio', nivel: 2 }
];
