'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import type { Componente } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface DiagramViewerProps {
  components: Componente[];
  appName: string;
}

const generatePlantUmlCode = (components: Componente[], appName: string) => {
  if (components.length === 0) {
    return `@startuml\n' No hay componentes para mostrar para la aplicación ${appName}.\n@enduml`;
  }

  const sortedByLevel = [...components].sort((a, b) => a.nivel - b.nivel);
  let puml = `@startuml ArchViz Diagram\n`;
  puml += `!theme plain\n`;
  puml += `title Arquitectura para ${appName}\n\n`;
  
  puml += `skinparam componentStyle uml2\n`;
  puml += `skinparam shadowing false\n`;
  puml += `skinparam rectangle {\n  RoundCorner 20\n  BackgroundColor LightBlue\n}\n`;
  puml += `skinparam node {\n  BackgroundColor LightGray\n}\n\n`;

  const levels = [...new Set(sortedByLevel.map(c => c.nivel))].sort((a,b) => a - b);

  levels.forEach(level => {
      puml += `' Nivel ${level}\n`;
      sortedByLevel.filter(c => c.nivel === level).forEach(c => {
          puml += `[${c.id}] as "${c.nombre.replace(/"/g, "''")}\\n<size:10>[${c.tipo}]</size>"\n`;
      });
      puml += '\n';
  });

  puml += `' Relaciones\n`;
  sortedByLevel.forEach(c => {
    if (c.padreId && components.some(p => p.id === c.padreId)) {
      puml += `${c.padreId} <|-- ${c.id}\n`;
    }
  });

  puml += `@enduml`;
  return puml;
};


export function DiagramViewer({ components, appName }: DiagramViewerProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const plantUmlCode = useMemo(() => generatePlantUmlCode(components, appName), [components, appName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(plantUmlCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Visualización del Diagrama</CardTitle>
        <CardDescription>Código PlantUML generado a partir de los componentes.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 bg-muted/30 rounded-lg m-6 mt-0 p-4 relative overflow-hidden">
        {isClient ? (
          <pre className="text-sm overflow-auto h-full w-full">
            <code>{plantUmlCode}</code>
          </pre>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[220px]" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} className="w-full" variant="secondary">
          {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {isCopied ? 'Copiado!' : 'Copiar Código'}
        </Button>
      </CardFooter>
    </Card>
  );
}
