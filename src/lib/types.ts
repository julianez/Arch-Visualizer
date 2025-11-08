export interface Componente {
  id: string;
  nombre: string;
  aplicacionId: string;
  padreId: string | null;
  tipo: string;
  nivel: number;
}

export const componentTypes = ['Componente', 'Servicio', 'Módulo', 'Clase'];
