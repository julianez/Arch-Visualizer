'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import type { Componente } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { plantumlEncoder } from 'plantuml-encoder';
import Image from 'next/image';

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
  const [diagramUrl, setDiagramUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const plantUmlCode = useMemo(() => generatePlantUmlCode(components, appName), [components, appName]);

  useEffect(() => {
    if (isClient) {
      setIsLoading(true);
      try {
        const encoded = plantumlEncoder.encode(plantUmlCode);
        const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
        setDiagramUrl(url);
      } catch (error) {
        console.error("Error generating diagram URL:", error);
        setDiagramUrl(''); // Clear url on error
      }
    }
  }, [plantUmlCode, isClient]);

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
        <CardDescription>Diagrama generado a partir de los componentes.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 bg-muted/30 rounded-lg m-6 mt-0 p-4 relative overflow-auto flex items-center justify-center">
        {!isClient || (isLoading && !diagramUrl) ? (
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : diagramUrl ? (
            <Image 
              src={diagramUrl} 
              alt={`Diagrama de arquitectura para ${appName}`}
              fill
              style={{ objectFit: 'contain' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)} // Handle image load error
              unoptimized // Required for external dynamic images
            />
        ) : (
          <p>No se pudo generar el diagrama.</p>
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
