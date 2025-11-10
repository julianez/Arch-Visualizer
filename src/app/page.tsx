
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { initialComponentData, initialApplicationData, initialRelatedApps } from '@/lib/data';
import type { Componente, Aplicacion, AplicacionRelacionada } from '@/lib/types';
import { componentTypes } from '@/lib/types';
import { DataManager } from '@/components/arch-viz/data-manager';
import { RelatedAppManager } from '@/components/arch-viz/related-app-manager';
import { DiagramViewer } from '@/components/arch-viz/diagram-viewer';
import { ComponentForm } from '@/components/arch-viz/component-form';
import { RelatedAppForm } from '@/components/arch-viz/related-app-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PlusCircle, DraftingCompass, FilterX, Languages, SlidersHorizontal } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/context/i18n-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type Filters = {
  pais: string | 'all';
  segmento: string | 'all';
  dominio1: string | 'all';
  dominio2: string | 'all';
  dominio3: string | 'all';
  aplicacionId: string | 'all';
};

const allEntityTypes = [...componentTypes, 'AplicacionExterna'];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Data States
  const [components, setComponents] = useState<Componente[]>([]);
  const [applications, setApplications] = useState<Aplicacion[]>([]);
  const [relatedApps, setRelatedApps] = useState<AplicacionRelacionada[]>([]);

  // Filter States
  const [filters, setFilters] = useState<Filters>({
    pais: 'all',
    segmento: 'all',
    dominio1: 'all',
    dominio2: 'all',
    dominio3: 'all',
    aplicacionId: 'all',
  });
  const [visibleTypes, setVisibleTypes] = useState<string[]>(allEntityTypes);

  // UI States
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [isRelatedAppFormOpen, setIsRelatedAppFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Componente | null>(null);
  const [editingRelatedApp, setEditingRelatedApp] = useState<AplicacionRelacionada | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{item: Componente | AplicacionRelacionada, type: 'component' | 'relatedApp'} | null>(null);

  const { toast } = useToast();
  const { t, setLocale, locale } = useI18n();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedComponents = window.localStorage.getItem('archviz-components');
      const storedApps = window.localStorage.getItem('archviz-apps');
      const storedRelatedApps = window.localStorage.getItem('archviz-related-apps');
      
      setComponents(storedComponents ? JSON.parse(storedComponents) : initialComponentData);
      setApplications(storedApps ? JSON.parse(storedApps) : initialApplicationData);
      setRelatedApps(storedRelatedApps ? JSON.parse(storedRelatedApps) : initialRelatedApps);
      
      const storedLocale = window.localStorage.getItem('archviz-locale');
      if (storedLocale) {
        setLocale(storedLocale as 'en' | 'es');
      }

    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [setLocale]);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('archviz-components', JSON.stringify(components));
        window.localStorage.setItem('archviz-apps', JSON.stringify(applications));
        window.localStorage.setItem('archviz-related-apps', JSON.stringify(relatedApps));
        window.localStorage.setItem('archviz-locale', locale);
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [components, applications, relatedApps, isMounted, locale]);

  const {
    paises,
    segmentos,
    dominios1,
    dominios2,
    dominios3,
    appIds,
    filteredApplications,
    selectedApplication,
    filteredComponentsForApp,
    filteredRelatedAppsForApp,
  } = useMemo(() => {
    let filteredApps = [...applications];

    if (filters.pais !== 'all') {
      filteredApps = filteredApps.filter(app => app.pais === filters.pais);
    }
    const uniqueSegmentos = Array.from(new Set(filteredApps.map(a => a.segmento)));

    if (filters.segmento !== 'all') {
      filteredApps = filteredApps.filter(app => app.segmento === filters.segmento);
    }
    const uniqueDominios1 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel1)));

    if (filters.dominio1 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel1 === filters.dominio1);
    }
    const uniqueDominios2 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel2)));

    if (filters.dominio2 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel2 === filters.dominio2);
    }
    const uniqueDominios3 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel3)));

    if (filters.dominio3 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel3 === filters.dominio3);
    }
    
    const filteredAppIds = new Set(filteredApps.map(app => app.id));
    const uniqueAppIds = Array.from(filteredAppIds);

    let finalFilteredComponents = filters.aplicacionId === 'all'
      ? components.filter(c => filteredAppIds.has(c.aplicacionId))
      : components.filter(c => c.aplicacionId === filters.aplicacionId);

    let finalFilteredRelatedApps = filters.aplicacionId === 'all'
      ? relatedApps.filter(ra => filteredAppIds.has(ra.aplicacionId))
      : relatedApps.filter(ra => ra.aplicacionId === filters.aplicacionId);

    const finalFilteredAppIds = new Set([...finalFilteredComponents.map(c => c.aplicacionId), ...finalFilteredRelatedApps.map(ra => ra.aplicacionId)]);
    
    let finalFilteredApps = applications.filter(app => finalFilteredAppIds.has(app.id));

    if(finalFilteredComponents.length === 0 && finalFilteredRelatedApps.length === 0 && filters.aplicacionId === 'all'){
      finalFilteredApps = filteredApps;
    }

    const selectedApp = filters.aplicacionId !== 'all'
        ? applications.find(app => app.id === filters.aplicacionId) || null
        : finalFilteredApps.length === 1 ? finalFilteredApps[0] : null;

    const createOptions = (uniqueValues: string[]) => {
      const options = ['all', ...uniqueValues];
      if (options.length > 2) return options;
      return uniqueValues.length === 1 ? uniqueValues : options;
    }

    return {
      paises: ['all', ...Array.from(new Set(applications.map(a => a.pais)))],
      segmentos: createOptions(uniqueSegmentos),
      dominios1: createOptions(uniqueDominios1),
      dominios2: createOptions(uniqueDominios2),
      dominios3: createOptions(uniqueDominios3),
      appIds: createOptions(uniqueAppIds),
      filteredApplications: finalFilteredApps,
      selectedApplication: selectedApp,
      filteredComponentsForApp: finalFilteredComponents,
      filteredRelatedAppsForApp: finalFilteredRelatedApps,
    };
  }, [applications, components, relatedApps, filters]);

  const diagramEntities = useMemo(() => {
    const combinedList = [...filteredComponentsForApp, ...filteredRelatedAppsForApp];
    return combinedList.filter(entity => visibleTypes.includes(entity.tipo));
  }, [filteredComponentsForApp, filteredRelatedAppsForApp, visibleTypes]);


  useEffect(() => {
    if (segmentos.length === 1 && filters.segmento !== segmentos[0]) {
      handleFilterChange('segmento', segmentos[0]);
    }
    if (dominios1.length === 1 && filters.dominio1 !== dominios1[0]) {
      handleFilterChange('dominio1', dominios1[0]);
    }
    if (dominios2.length === 1 && filters.dominio2 !== dominios2[0]) {
      handleFilterChange('dominio2', dominios2[0]);
    }
    if (dominios3.length === 1 && filters.dominio3 !== dominios3[0]) {
      handleFilterChange('dominio3', dominios3[0]);
    }
    if (appIds.length === 1 && filters.aplicacionId !== appIds[0]) {
      handleFilterChange('aplicacionId', appIds[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentos, dominios1, dominios2, dominios3, appIds]);


  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prevFilters => {
      const newFilters: Filters = { ...prevFilters, [filterName]: value };
      
      const resetCascadingFilters = (startIndex: number) => {
        const filterNames: (keyof Filters)[] = ['pais', 'segmento', 'dominio1', 'dominio2', 'dominio3', 'aplicacionId'];
        for (let i = startIndex; i < filterNames.length; i++) {
          newFilters[filterNames[i]] = 'all';
        }
      }

      const filterHierarchy: (keyof Filters)[] = ['pais', 'segmento', 'dominio1', 'dominio2', 'dominio3'];
      const currentIndex = filterHierarchy.indexOf(filterName);

      if(currentIndex !== -1) {
        resetCascadingFilters(currentIndex + 1);
      }
      
      return newFilters;
    });
  };
  
  const resetFilters = () => {
    setFilters({
      pais: 'all',
      segmento: 'all',
      dominio1: 'all',
      dominio2: 'all',
      dominio3: 'all',
      aplicacionId: 'all',
    });
    setVisibleTypes(allEntityTypes);
  }

  const handleTypeVisibilityChange = (type: string) => {
    setVisibleTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }

  const handleAddComponent = () => {
    if (filters.aplicacionId === 'all') {
      toast({
        variant: 'destructive',
        title: t('selectApplicationErrorTitle'),
        description: t('selectApplicationErrorDescription')
      });
      return;
    }
    setEditingComponent(null);
    setIsComponentFormOpen(true);
  };
  
  const handleAddRelatedApp = () => {
    if (filters.aplicacionId === 'all') {
      toast({
        variant: 'destructive',
        title: t('selectApplicationErrorTitle'),
        description: t('selectApplicationErrorDescription')
      });
      return;
    }
    setEditingRelatedApp(null);
    setIsRelatedAppFormOpen(true);
  }

  const handleEditComponent = (component: Componente) => {
    setEditingComponent(component);
    setIsComponentFormOpen(true);
  };

  const handleEditRelatedApp = (app: AplicacionRelacionada) => {
    setEditingRelatedApp(app);
    setIsRelatedAppFormOpen(true);
  }

  const handleDeleteItem = (item: Componente | AplicacionRelacionada, type: 'component' | 'relatedApp') => {
    setItemToDelete({item, type});
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const { item, type } = itemToDelete;
    if (type === 'component') {
      setComponents(prev => prev
        .filter(c => c.id !== item.id)
        .map(c => c.padreId === item.id ? { ...c, padreId: null } : c)
      );
      toast({
          title: t('deleteComponentToastTitle'),
          description: t('deleteComponentToastDescription', { componentName: item.nombre }),
      });
    } else if (type === 'relatedApp') {
      setRelatedApps(prev => prev.filter(app => app.id !== item.id));
      setComponents(prev => prev.map(c => c.padreId === item.id ? { ...c, padreId: null } : c));
      toast({
          title: t('deleteRelatedAppToastTitle'),
          description: t('deleteRelatedAppToastDescription', { appName: item.nombre }),
      });
    }

    setItemToDelete(null);
  };

  const handleComponentFormSubmit = (data: Componente) => {
    if (editingComponent) {
      setComponents(prev => prev.map(c => c.id === data.id ? data : c));
      toast({ title: t('updateComponentToastTitle'), description: t('updateComponentToastDescription', { componentName: data.nombre }) });
    } else {
      if (components.some(c => c.id === data.id) || relatedApps.some(app => app.id === data.id)) {
        toast({
          variant: "destructive",
          title: t('duplicateIdErrorToastTitle'),
          description: t('duplicateIdErrorToastDescription', { componentId: data.id }),
        });
        return;
      }
      setComponents(prev => [...prev, data]);
      toast({ title: t('addComponentToastTitle'), description: t('addComponentToastDescription', { componentName: data.nombre }) });
    }
  };

  const handleRelatedAppFormSubmit = (data: AplicacionRelacionada) => {
    if (editingRelatedApp) {
      setRelatedApps(prev => prev.map(app => app.id === data.id ? data : app));
      toast({ title: t('updateRelatedAppToastTitle'), description: t('updateRelatedAppToastDescription', { appName: data.nombre }) });
    } else {
      if (components.some(c => c.id === data.id) || relatedApps.some(app => app.id === data.id)) {
        toast({
          variant: "destructive",
          title: t('duplicateIdErrorToastTitle'),
          description: t('duplicateIdErrorToastDescription', { componentId: data.id }),
        });
        return;
      }
      setRelatedApps(prev => [...prev, data]);
      toast({ title: t('addRelatedAppToastTitle'), description: t('addRelatedAppToastDescription', { appName: data.nombre }) });
    }
  }
  
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
        <header className="flex items-center justify-between p-4 border-b shrink-0">
           <div className="flex items-center gap-3">
             <DraftingCompass className="h-8 w-8 text-primary"/>
            <h1 className="text-2xl font-headline font-bold">{t('appTitle')}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLocale('es')} disabled={locale === 'es'}>Español</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('en')} disabled={locale === 'en'}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Select onValueChange={(v) => handleFilterChange('pais', v)} value={filters.pais}>
                  <SelectTrigger><SelectValue placeholder={t('countryPlaceholder')} /></SelectTrigger>
                  <SelectContent>{paises.map(p => <SelectItem key={p} value={p}>{p === 'all' ? t('allCountries') : p}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('segmento', v)} value={filters.segmento}>
                  <SelectTrigger><SelectValue placeholder={t('segmentPlaceholder')} /></SelectTrigger>
                  <SelectContent>{segmentos.map(s => <SelectItem key={s} value={s}>{s === 'all' ? t('allSegments') : s}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('dominio1', v)} value={filters.dominio1}>
                  <SelectTrigger><SelectValue placeholder={t('domain1Placeholder')} /></SelectTrigger>
                  <SelectContent>{dominios1.map(d => <SelectItem key={d} value={d}>{d === 'all' ? t('allDomainsN1') : d}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('dominio2', v)} value={filters.dominio2}>
                  <SelectTrigger><SelectValue placeholder={t('domain2Placeholder')} /></SelectTrigger>
                  <SelectContent>{dominios2.map(d => <SelectItem key={d} value={d}>{d === 'all' ? t('allDomainsN2') : d}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('dominio3', v)} value={filters.dominio3}>
                  <SelectTrigger><SelectValue placeholder={t('domain3Placeholder')} /></SelectTrigger>
                  <SelectContent>{dominios3.map(d => <SelectItem key={d} value={d}>{d === 'all' ? t('allDomainsN3') : d}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => handleFilterChange('aplicacionId', v)} value={filters.aplicacionId}>
                  <SelectTrigger><SelectValue placeholder={t('applicationPlaceholder')} /></SelectTrigger>
                  <SelectContent>{appIds.map(id => <SelectItem key={id} value={id}>{id === 'all' ? t('allApplications') : id}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={resetFilters} variant="ghost"><FilterX className="mr-2 h-4 w-4" /> {t('clearFilters')}</Button>
          </div>
        </div>

         <div className="p-4 border-b flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t('filterByType')}:</span>
              </div>
              {allEntityTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={visibleTypes.includes(type)}
                    onCheckedChange={() => handleTypeVisibilityChange(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">{t(type, type)}</Label>
                </div>
              ))}
          </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
          <div className="flex flex-col gap-6 overflow-y-auto rounded-lg">
             <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-semibold">
                      {selectedApplication ? `${t('detailsFor')}: ${selectedApplication.nombre}` : (filteredApplications.length > 1 ? t('multipleApplications') : t('overview'))}
                    </h2>
                  </div>
                  {selectedApplication && (
                     <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                        <div><strong>{t('country')}:</strong> {selectedApplication.pais}</div>
                        <div><strong>{t('segment')}:</strong> {selectedApplication.segmento}</div>
                        <div><strong>{t('domainN1')}:</strong> {selectedApplication.dominio.nivel1}</div>
                        <div><strong>{t('domainN2')}:</strong> {selectedApplication.dominio.nivel2}</div>
                        <div><strong>{t('domainN3')}:</strong> {selectedApplication.dominio.nivel3}</div>
                     </div>
                  )}
                  {filteredApplications.length > 1 && <p className="mt-2 text-sm text-muted-foreground">{t('multipleApplicationsMatch', { count: filteredApplications.length })}</p>}
                   {filteredApplications.length === 0 && <p className="mt-2 text-sm text-muted-foreground">{t('noApplicationsMatch')}</p>}

                </CardContent>
             </Card>
              <Accordion type="single" collapsible defaultValue="components">
                  <AccordionItem value="components">
                      <AccordionTrigger className="text-base font-semibold">{t('componentManagerTitle')}</AccordionTrigger>
                      <AccordionContent>
                          <Button onClick={handleAddComponent} size="sm" className="mb-4">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              {t('addComponent')}
                          </Button>
                          <DataManager 
                              components={filteredComponentsForApp} 
                              onEdit={handleEditComponent} 
                              onDelete={(c) => handleDeleteItem(c, 'component')}
                          />
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="relatedApps">
                      <AccordionTrigger className="text-base font-semibold">{t('relatedAppManagerTitle')}</AccordionTrigger>
                      <AccordionContent>
                           <Button onClick={handleAddRelatedApp} size="sm" className="mb-4">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              {t('addRelatedApp')}
                          </Button>
                          <RelatedAppManager 
                              relatedApps={filteredRelatedAppsForApp}
                              onEdit={handleEditRelatedApp}
                              onDelete={(app) => handleDeleteItem(app, 'relatedApp')}
                          />
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </div>
          <div className="flex flex-col overflow-hidden rounded-lg">
             <DiagramViewer 
                entities={diagramEntities}
                application={selectedApplication} 
                filteredApplications={filteredApplications}
             />
          </div>
        </div>
      </main>

      <ComponentForm
        isOpen={isComponentFormOpen}
        onClose={() => setIsComponentFormOpen(false)}
        onSubmit={handleComponentFormSubmit}
        component={editingComponent}
        allComponents={components}
        allRelatedApps={relatedApps}
        applicationId={filters.aplicacionId}
      />
      
      <RelatedAppForm
        isOpen={isRelatedAppFormOpen}
        onClose={() => setIsRelatedAppFormOpen(false)}
        onSubmit={handleRelatedAppFormSubmit}
        app={editingRelatedApp}
        existingIds={[...components.map(c => c.id), ...relatedApps.map(a => a.id)]}
        applicationId={filters.aplicacionId}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'component' ? t('deleteWarning', { componentName: itemToDelete.item.nombre }) : t('deleteRelatedAppWarning', { appName: itemToDelete?.item.nombre })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
