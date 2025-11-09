export interface Dominio {
  nivel1: string;
  nivel2: string;
  nivel3: string;
}

export interface Aplicacion {
  id: string;
  nombre: string;
  descripcion: string;
  pais: string;
  segmento: string;
  dominio: Dominio;
  currency_issues: boolean;
  disposition: 'Mantener' | 'Actualizar' | 'Eliminar' | 'Investigar';
}


export interface Componente {
  id: string;
  nombre: string;
  aplicacionId: string;
  padreId: string | null;
  tipo: string;
  nivel: number;
}

export const componentTypes = ['Componente', 'Servicio', 'Módulo', 'Clase'];
export const dispositionTypes = ['Mantener', 'Actualizar', 'Eliminar', 'Investigar'];
