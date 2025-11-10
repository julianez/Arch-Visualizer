'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import type { Aplicacion } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import plantumlEncoder from 'plantuml-encoder';
import Image from 'next/image';
import { useI18n } from '@/context/i18n-context';

interface ApplicationRelationViewerProps {
  allApplications: Aplicacion[];
  filteredApplications: Aplicacion[];
}

const generatePlantUmlCode = (
  allApplications: Aplicacion[],
  filteredApplications: Aplicacion[],
  t: (key: string) => string
) => {
  if (filteredApplications.length === 0) {
    return `@startuml\n' ${t('noAppsForFilters')}\n@enduml`;
  }

  let puml = `@startuml AppRelations\n`;
  puml += `!theme plain\n`;
  puml += `title ${t('appRelationships')}\n\n`;
  puml += `skinparam rectangle {\n  RoundCorner 20\n  BackgroundColor SkyBlue\n  BorderColor DarkBlue\n}\n`;

  const filteredAppIds = new Set(filteredApplications.map(app => app.id));

  // Define all applications in the filter scope
  filteredApplications.forEach(app => {
    puml += `rectangle "[${app.id}]\\n${app.nombre.replace(/"/g, "''")}" as ${app.id}\n`;
  });

  puml += '\n';

  // Define relationships
  const drawnRelations = new Set<string>();

  filteredApplications.forEach(app => {
    if (app.relaciones) {
      app.relaciones.forEach(targetId => {
        // Draw relation only if target is also in the filter scope
        if (filteredAppIds.has(targetId)) {
          const relationKey = [app.id, targetId].sort().join('-');
          if (!drawnRelations.has(relationKey)) {
            puml += `${app.id} -- ${targetId}\n`;
            drawnRelations.add(relationKey);
          }
        }
      });
    }
  });

  puml += `@enduml`;
  return puml;
};


export function ApplicationRelationViewer({ allApplications, filteredApplications }: ApplicationRelationViewerProps) {
  const { t } = useI18n();
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const plantUmlCode = useMemo(() => generatePlantUmlCode(allApplications, filteredApplications, t), [allApplications, filteredApplications, t]);

  useEffect(() => {
    if (isClient) {
      setIsLoading(true);
      try {
        const encoded = plantumlEncoder.encode(plantUmlCode);
        const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
        setDiagramUrl(url);
      } catch (error) {
        console.error("Error generating diagram URL:", error);
        setDiagramUrl('');
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
        <CardTitle>{t('relationDiagramTitle')}</CardTitle>
        <CardDescription>{t('relationDiagramDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 bg-muted/30 rounded-lg m-6 mt-0 p-4 relative overflow-auto flex items-center justify-center">
        {!isClient || (isLoading && !diagramUrl) ? (
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : diagramUrl && filteredApplications.length > 0 ? (
            <Image 
              src={diagramUrl} 
              alt={t('appRelationships')}
              fill
              style={{ objectFit: 'contain' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              unoptimized
            />
        ) : (
          <p>{t('noAppsForFilters')}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} className="w-full" variant="secondary" disabled={filteredApplications.length === 0}>
          {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {isCopied ? t('copied') : t('copyCode')}
        </Button>
      </CardFooter>
    </Card>
  );
}
