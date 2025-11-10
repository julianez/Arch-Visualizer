
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import type { Componente, Aplicacion, AplicacionRelacionada } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import plantumlEncoder from 'plantuml-encoder';
import Image from 'next/image';
import { useI18n } from '@/context/i18n-context';

type DiagramEntity = (Componente | AplicacionRelacionada) & { padreId?: string | null };

interface DiagramViewerProps {
  entities: DiagramEntity[];
  application: Aplicacion | null;
  filteredApplications: Aplicacion[];
}

const generatePlantUmlCode = (entities: DiagramEntity[], application: Aplicacion | null, filteredApps: Aplicacion[], t: (key: string, defaultVal: string) => string) => {
  let appName = t('currentSelection', 'the current selection');
  let appDescription = t('diagramBasedOnFilters', 'Diagram based on active filters.');

  if (application) {
    appName = application.nombre;
    appDescription = application.descripcion;
  } else if (filteredApps.length > 1) {
    appName = t('multipleApplications', 'Multiple Applications');
    appDescription = t('aggregateOfApplications', 'Aggregate of {count} applications.').replace('{count}', String(filteredApps.length));
  }

  if (entities.length === 0) {
    return `@startuml\n' ${t('noComponentsToDisplayFor', 'No items to display for {appName}').replace('{appName}', appName)}\n@enduml`;
  }

  const sortedByLevel = [...entities].sort((a, b) => ('nivel' in a && 'nivel' in b ? a.nivel - b.nivel : 0));
  
  let puml = `@startuml\n`;
  puml += `!theme plain\n`;
  
  puml += `title ${t('architectureFor', 'Architecture for')} ${appName}\n`;
  if (appDescription) {
    puml += `caption "${appDescription.replace(/"/g, "''")}"\n\n`;
  }
  
  puml += `skinparam componentStyle uml2\n`;
  puml += `skinparam shadowing false\n`;
  puml += `skinparam rectangle {\n  RoundCorner 20\n  BackgroundColor LightBlue\n}\n`;
  puml += `skinparam node {\n  BackgroundColor LightGray\n}\n\n`;

  const entityIds = new Set(entities.map(e => e.id));

  sortedByLevel.forEach(entity => {
      if (entity.tipo === 'AplicacionExterna') {
          puml += `rectangle "[${entity.codigo}]\\n${entity.nombre.replace(/"/g, "''")}" as ${entity.id} #LightGray\n`;
      } else if ('nivel' in entity) {
          const component = entity as Componente;
          puml += `[${component.id}] as "${component.nombre.replace(/"/g, "''")}\\n<size:10>[${component.tipo}] | APM: ${component.id}</size>"\n`;
      }
  });
  puml += '\n';

  puml += `' ${t('relationships', 'Relationships')}\n`;
  entities.forEach(entity => {
    if (entity.padreId && entityIds.has(entity.padreId)) {
      puml += `${entity.padreId} <|-- ${entity.id}\n`;
    }
  });

  puml += `@enduml`;
  return puml;
};


export function DiagramViewer({ entities, application, filteredApplications }: DiagramViewerProps) {
  const { t } = useI18n();
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const plantUmlCode = useMemo(() => generatePlantUmlCode(entities, application, filteredApplications, t), [entities, application, filteredApplications, t]);

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

  const appName = application?.nombre || (filteredApplications.length > 1 ? t('multipleApplications', 'Multiple Applications') : t('currentView', 'the current view'));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('diagramViewerTitle', 'Diagram Visualization')}</CardTitle>
        <CardDescription>{t('diagramViewerDescription', 'Diagram generated from the components.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 bg-muted/30 rounded-lg m-6 mt-0 p-4 relative overflow-auto flex items-center justify-center">
        {!isClient || (isLoading && !diagramUrl) ? (
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : diagramUrl && entities.length > 0 ? (
            <Image 
              src={diagramUrl} 
              alt={t('architectureDiagramFor', 'Architecture diagram for {appName}').replace('{appName}', appName)}
              fill
              style={{ objectFit: 'contain' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)} // Handle image load error
              unoptimized // Required for external dynamic images
            />
        ) : (
          <p>{t('noComponentsForFilters', 'No items to display with current filters.')}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} className="w-full" variant="secondary" disabled={entities.length === 0}>
          {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {isCopied ? t('copied', 'Copied!') : t('copyCode', 'Copy Code')}
        </Button>
      </CardFooter>
    </Card>
  );
}
