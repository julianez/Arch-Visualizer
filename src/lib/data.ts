import type { Componente, Aplicacion, AplicacionRelacion } from './types';

export const initialComponentData: Componente[] = [
  // Aplicación 1: Core System
  { id: 'A1', nombre: 'Microservicio Core', aplicacionId: 'APL-1', padreId: null, tipo: 'Componente', nivel: 1 },
  { id: 'A2', nombre: 'API de Productos', aplicacionId: 'APL-1', padreId: 'A1', tipo: 'Servicio', nivel: 2 },
  { id: 'A3', nombre: 'Módulo de Inventario', aplicacionId: 'APL-1', padreId: 'A2', tipo: 'Módulo', nivel: 3 },
  { id: 'A4', nombre: 'Base de Datos SQL', aplicacionId: 'APL-1', padreId: 'A1', tipo: 'Clase', nivel: 2 },

  // Aplicación 2: Reporting
  { id: 'B1', nombre: 'Servidor de Reportes', aplicacionId: 'APL-2', padreId: null, tipo: 'Componente', nivel: 1 },
  { id: 'B2', nombre: 'Exportador PDF', aplicacionId: 'APL-2', padreId: 'B1', tipo: 'Servicio', nivel: 2 },

  // Aplicación 3: CRM
  { id: 'C1', nombre: 'Interfaz de Cliente', aplicacionId: 'APL-3', padreId: null, tipo: 'Componente', nivel: 1 },
  { id: 'C2', nombre: 'Gestor de Contactos', aplicacionId: 'APL-3', padreId: 'C1', tipo: 'Servicio', nivel: 2 }
];

export const initialApplicationData: Aplicacion[] = [
    {
        id: 'APL-1',
        nombre: 'Core System',
        descripcion: 'Sistema central para la gestión de productos e inventario.',
        pais: 'Global',
        segmento: 'Retail',
        dominio: {
            nivel1: 'Operaciones',
            nivel2: 'Backend',
            nivel3: 'Inventario'
        },
    },
    {
        id: 'APL-2',
        nombre: 'Reporting',
        descripcion: 'Plataforma de generación de reportes y análisis de datos.',
        pais: 'USA',
        segmento: 'Finanzas',
        dominio: {
            nivel1: 'Business Intelligence',
            nivel2: 'Análisis',
            nivel3: 'Visualización'
        },
    },
    {
        id: 'APL-3',
        nombre: 'CRM',
        descripcion: 'Gestión de relaciones con clientes y ciclo de ventas.',
        pais: 'EMEA',
        segmento: 'Ventas',
        dominio: {
            nivel1: 'Clientes',
            nivel2: 'Comercial',
            nivel3: 'Seguimiento'
        },
    }
];

export const initialAppRelations: AplicacionRelacion[] = [
  { sourceAppId: 'APL-1', targetAppId: 'APL-2', description: 'Envía datos para reportes' },
  { sourceAppId: 'APL-3', targetAppId: 'APL-1', description: 'Consulta info de productos' },
];
