'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Componente } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TypeIcon } from "./type-icon";

interface DataManagerProps {
  components: Componente[];
  onEdit: (component: Componente) => void;
  onDelete: (component: Componente) => void;
}

export function DataManager({ components, onEdit, onDelete }: DataManagerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Gestión de Componentes</CardTitle>
        <CardDescription>Añade, edita y elimina componentes de la arquitectura.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Nivel</TableHead>
                <TableHead className="hidden lg:table-cell">Padre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.length > 0 ? components.map((component) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <TypeIcon type={component.tipo} className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{component.nombre}</span>
                        <span className="text-xs text-muted-foreground">{component.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{component.tipo}</Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell">{component.nivel}</TableCell>
                  <TableCell className="hidden lg:table-cell">{component.padreId || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(component)} aria-label={`Edit ${component.nombre}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(component)} aria-label={`Delete ${component.nombre}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay componentes para esta aplicación.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
