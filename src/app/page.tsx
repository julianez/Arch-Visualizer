'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { initialData } from '@/lib/data';
import type { Componente } from '@/lib/types';
import { DataManager } from '@/components/arch-viz/data-manager';
import { DiagramViewer } from '@/components/arch-viz/diagram-viewer';
import { ComponentForm } from '@/components/arch-viz/component-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, DraftingCompass } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [components, setComponents] = useState<Componente[]>(initialData);
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Componente | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<Componente | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedComponents = window.localStorage.getItem('archviz-components');
      if (storedComponents) {
        setComponents(JSON.parse(storedComponents));
      } else {
        window.localStorage.setItem('archviz-components', JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('archviz-components', JSON.stringify(components));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [components, isMounted]);

  const appIds = useMemo(() => ['all', ...Array.from(new Set(components.map(c => c.aplicacionId)))], [components]);
  
  useEffect(() => {
    if (isMounted && !appIds.includes(selectedApp)) {
      setSelectedApp('all');
    }
  }, [appIds, selectedApp, isMounted]);

  const filteredComponents = useMemo(() => {
    if (selectedApp === 'all') return components;
    return components.filter(c => c.aplicacionId === selectedApp);
  }, [components, selectedApp]);

  const handleAddComponent = () => {
    setEditingComponent(null);
    setIsFormOpen(true);
  };

  const handleEditComponent = (component: Componente) => {
    setEditingComponent(component);
    setIsFormOpen(true);
  };

  const handleDeleteComponent = (component: Componente) => {
    setComponentToDelete(component);
  };

  const confirmDelete = () => {
    if (componentToDelete) {
      // Also need to handle children. For simplicity, we can just detach them.
      setComponents(prev => prev
        .filter(c => c.id !== componentToDelete.id)
        .map(c => c.padreId === componentToDelete.id ? { ...c, padreId: null } : c)
      );
      toast({
          title: "Componente eliminado",
          description: `El componente "${componentToDelete.nombre}" ha sido eliminado.`,
      });
      setComponentToDelete(null);
    }
  };

  const handleFormSubmit = (data: Componente) => {
    if (editingComponent) {
      // Edit
      setComponents(prev => prev.map(c => c.id === data.id ? data : c));
      toast({ title: "Componente actualizado", description: `"${data.nombre}" guardado.` });
    } else {
      // Add
      if (components.some(c => c.id === data.id)) {
        toast({
          variant: "destructive",
          title: "Error: ID duplicado",
          description: `El ID "${data.id}" ya existe. Por favor, elige uno único.`,
        });
        return;
      }
      setComponents(prev => [...prev, data]);
      toast({ title: "Componente añadido", description: `"${data.nombre}" creado.` });
    }
  };
  
  if (!isMounted) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <DraftingCompass className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <>
      <main className="flex flex-col h-screen bg-background text-foreground font-body">
        <header className="flex items-center justify-between p-4 border-b shrink-0 flex-wrap gap-4">
          <div className="flex items-center gap-3">
             <DraftingCompass className="h-8 w-8 text-primary"/>
            <h1 className="text-2xl font-headline font-bold">ArchViz</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedApp} value={selectedApp}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por aplicación..." />
              </SelectTrigger>
              <SelectContent>
                {appIds.map(id => (
                  <SelectItem key={id} value={id}>
                    {id === 'all' ? 'Todas las Apps' : id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddComponent}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Componente
            </Button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
          <div className="flex flex-col overflow-y-auto rounded-lg">
            <DataManager 
              components={filteredComponents} 
              onEdit={handleEditComponent} 
              onDelete={handleDeleteComponent}
            />
          </div>
          <div className="flex flex-col overflow-y-auto rounded-lg">
            <DiagramViewer components={filteredComponents} appName={selectedApp === 'all' ? 'Todas' : selectedApp} />
          </div>
        </div>
      </main>

      <ComponentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        component={editingComponent}
        allComponents={components}
      />

      <AlertDialog open={!!componentToDelete} onOpenChange={(open) => !open && setComponentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el componente "{componentToDelete?.nombre}"
              y se desvincularán sus hijos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setComponentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
