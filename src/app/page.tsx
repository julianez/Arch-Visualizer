'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { initialComponentData, initialApplicationData } from '@/lib/data';
import type { Componente, Aplicacion, Dominio } from '@/lib/types';
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
import { PlusCircle, DraftingCompass, FilterX, Languages } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/context/i18n-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { dispositionTypes } from '@/lib/types';


type Filters = {
  pais: string | 'all';
  segmento: string | 'all';
  dominio1: string | 'all';
  dominio2: string | 'all';
  dominio3: string | 'all';
  disposition: string | 'all';
  currency_issues: string | 'all';
  aplicacionId: string | 'all';
};


export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [components, setComponents] = useState<Componente[]>(initialComponentData);
  const [applications, setApplications] = useState<Aplicacion[]>(initialApplicationData);
  
  const [filters, setFilters] = useState<Filters>({
    pais: 'all',
    segmento: 'all',
    dominio1: 'all',
    dominio2: 'all',
    dominio3: 'all',
    disposition: 'all',
    currency_issues: 'all',
    aplicacionId: 'all',
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Componente | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<Componente | null>(null);
  const { toast } = useToast();
  const { t, setLocale, locale } = useI18n();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedComponents = window.localStorage.getItem('archviz-components');
      const storedApps = window.localStorage.getItem('archviz-apps');
      if (storedComponents) {
        setComponents(JSON.parse(storedComponents));
      } else {
        window.localStorage.setItem('archviz-components', JSON.stringify(initialComponentData));
      }
      if (storedApps) {
        setApplications(JSON.parse(storedApps));
      } else {
        window.localStorage.setItem('archviz-apps', JSON.stringify(initialApplicationData));
      }
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
        window.localStorage.setItem('archviz-locale', locale);
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [components, applications, isMounted, locale]);

  const {
    paises,
    segmentos,
    dominios1,
    dominios2,
    dominios3,
    dispositions,
    currencyIssuesOptions,
    appIds,
    filteredApplications,
    selectedApplication,
    filteredComponents
  } = useMemo(() => {
    let filteredApps = [...applications];

    if (filters.pais !== 'all') {
      filteredApps = filteredApps.filter(app => app.pais === filters.pais);
    }
    const uniqueSegmentos = Array.from(new Set(filteredApps.map(a => a.segmento)));
    const availableSegmentos = ['all', ...uniqueSegmentos];

    if (filters.segmento !== 'all') {
      filteredApps = filteredApps.filter(app => app.segmento === filters.segmento);
    }
    const uniqueDominios1 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel1)));
    const availableDominios1 = ['all', ...uniqueDominios1];

    if (filters.dominio1 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel1 === filters.dominio1);
    }
    const uniqueDominios2 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel2)));
    const availableDominios2 = ['all', ...uniqueDominios2];

    if (filters.dominio2 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel2 === filters.dominio2);
    }
    const uniqueDominios3 = Array.from(new Set(filteredApps.map(a => a.dominio.nivel3)));
    const availableDominios3 = ['all', ...uniqueDominios3];

    if (filters.dominio3 !== 'all') {
      filteredApps = filteredApps.filter(app => app.dominio.nivel3 === filters.dominio3);
    }
    
    const uniqueDispositions = Array.from(new Set(filteredApps.map(a => a.disposition)));
    const availableDispositions = uniqueDispositions.length > 1 ? ['all', ...uniqueDispositions] : uniqueDispositions;

    if (filters.disposition !== 'all') {
        filteredApps = filteredApps.filter(app => app.disposition === filters.disposition);
    }

    const uniqueCurrencyIssues = Array.from(new Set(filteredApps.map(a => (a.currency_issues ?? false).toString())));
    const availableCurrencyIssues = uniqueCurrencyIssues.length > 1 ? ['all', ...uniqueCurrencyIssues] : uniqueCurrencyIssues;

    if (filters.currency_issues !== 'all') {
        filteredApps = filteredApps.filter(app => (app.currency_issues ?? false).toString() === filters.currency_issues);
    }

    const filteredAppIds = new Set(filteredApps.map(app => app.id));
    const uniqueAppIds = Array.from(filteredAppIds);
    const availableAppIds = ['all', ...uniqueAppIds];


    let finalFilteredComponents = filters.aplicacionId === 'all'
      ? components.filter(c => filteredAppIds.has(c.aplicacionId))
      : components.filter(c => c.aplicacionId === filters.aplicacionId);

    const finalFilteredAppIds = new Set(finalFilteredComponents.map(c => c.aplicacionId));
    const finalFilteredApps = applications.filter(app => finalFilteredAppIds.has(app.id));

    const selectedApp = filters.aplicacionId !== 'all'
        ? applications.find(app => app.id === filters.aplicacionId) || null
        : finalFilteredApps.length === 1 ? finalFilteredApps[0] : null;

    return {
      paises: ['all', ...Array.from(new Set(applications.map(a => a.pais)))],
      segmentos: availableSegmentos.length > 2 ? availableSegmentos : uniqueSegmentos,
      dominios1: availableDominios1.length > 2 ? availableDominios1 : uniqueDominios1,
      dominios2: availableDominios2.length > 2 ? availableDominios2 : uniqueDominios2,
      dominios3: availableDominios3.length > 2 ? availableDominios3 : uniqueDominios3,
      dispositions: availableDispositions,
      currencyIssuesOptions: availableCurrencyIssues,
      appIds: availableAppIds.length > 2 ? availableAppIds : uniqueAppIds,
      filteredApplications: finalFilteredApps,
      selectedApplication: selectedApp,
      filteredComponents: finalFilteredComponents,
    };
  }, [applications, components, filters]);

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
    if (dispositions.length === 1 && filters.disposition !== dispositions[0]) {
      handleFilterChange('disposition', dispositions[0]);
    }
    if (currencyIssuesOptions.length === 1 && filters.currency_issues !== currencyIssuesOptions[0]) {
      handleFilterChange('currency_issues', currencyIssuesOptions[0]);
    }
    if (appIds.length === 1 && filters.aplicacionId !== appIds[0]) {
      handleFilterChange('aplicacionId', appIds[0]);
    }
  }, [segmentos, dominios1, dominios2, dominios3, dispositions, currencyIssuesOptions, appIds, filters]);


  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prevFilters => {
      const newFilters: Filters = { ...prevFilters, [filterName]: value };
      
      const resetCascadingFilters = (startIndex: number) => {
        const filterNames: (keyof Filters)[] = ['pais', 'segmento', 'dominio1', 'dominio2', 'dominio3', 'disposition', 'currency_issues', 'aplicacionId'];
        for (let i = startIndex; i < filterNames.length; i++) {
          newFilters[filterNames[i]] = 'all';
        }
      }

      const filterHierarchy: (keyof Filters)[] = ['pais', 'segmento', 'dominio1', 'dominio2', 'dominio3', 'disposition', 'currency_issues'];
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
      disposition: 'all',
      currency_issues: 'all',
      aplicacionId: 'all',
    });
  }


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
      setComponents(prev => prev
        .filter(c => c.id !== componentToDelete.id)
        .map(c => c.padreId === componentToDelete.id ? { ...c, padreId: null } : c)
      );
      toast({
          title: t('deleteComponentToastTitle'),
          description: t('deleteComponentToastDescription', { componentName: componentToDelete.nombre }),
      });
      setComponentToDelete(null);
    }
  };

  const handleFormSubmit = (data: Componente) => {
    if (editingComponent) {
      setComponents(prev => prev.map(c => c.id === data.id ? data : c));
      toast({ title: t('updateComponentToastTitle'), description: t('updateComponentToastDescription', { componentName: data.nombre }) });
    } else {
      if (components.some(c => c.id === data.id)) {
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
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
                 <Select onValueChange={(v) => handleFilterChange('disposition', v)} value={filters.disposition}>
                    <SelectTrigger><SelectValue placeholder={t('dispositionPlaceholder')} /></SelectTrigger>
                    <SelectContent>{dispositions.map(d => <SelectItem key={d} value={d}>{d === 'all' ? t('allDispositions') : d}</SelectItem>)}</SelectContent>
                </Select>
                 <Select onValueChange={(v) => handleFilterChange('currency_issues', v)} value={filters.currency_issues}>
                    <SelectTrigger><SelectValue placeholder={t('currencyPlaceholder')} /></SelectTrigger>
                    <SelectContent>{currencyIssuesOptions.map(c => <SelectItem key={c} value={c}>{c === 'all' ? t('allCurrencies') : (c === 'true' ? t('yes') : t('no'))}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={(v) => handleFilterChange('aplicacionId', v)} value={filters.aplicacionId}>
                    <SelectTrigger><SelectValue placeholder={t('applicationPlaceholder')} /></SelectTrigger>
                    <SelectContent>{appIds.map(id => <SelectItem key={id} value={id}>{id === 'all' ? t('allApplications') : id}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={resetFilters} variant="ghost" className="w-full"><FilterX className="mr-2 h-4 w-4" /> {t('clearFilters')}</Button>
                </div>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
          <div className="flex flex-col gap-6 overflow-y-auto rounded-lg">
             <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-semibold">
                      {selectedApplication ? `${t('detailsFor')}: ${selectedApplication.nombre}` : (filteredApplications.length > 1 ? t('multipleApplications') : t('overview'))}
                    </h2>
                     <Button onClick={handleAddComponent} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('addComponent')}
                     </Button>
                  </div>
                  {selectedApplication && (
                     <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                        <div><strong>{t('country')}:</strong> {selectedApplication.pais}</div>
                        <div><strong>{t('segment')}:</strong> {selectedApplication.segmento}</div>
                        <div><strong>{t('domainN1')}:</strong> {selectedApplication.dominio.nivel1}</div>
                        <div><strong>{t('domainN2')}:</strong> {selectedApplication.dominio.nivel2}</div>
                        <div><strong>{t('domainN3')}:</strong> {selectedApplication.dominio.nivel3}</div>
                        <div><strong>{t('currency_issues')}:</strong> {selectedApplication.currency_issues ? t('yes') : t('no')}</div>
                        <div><strong>{t('disposition')}:</strong> {selectedApplication.disposition}</div>
                     </div>
                  )}
                  {filteredApplications.length > 1 && <p className="mt-2 text-sm text-muted-foreground">{t('multipleApplicationsMatch', { count: filteredApplications.length })}</p>}
                   {filteredApplications.length === 0 && <p className="mt-2 text-sm text-muted-foreground">{t('noApplicationsMatch')}</p>}

                </CardContent>
             </Card>
            <DataManager 
              components={filteredComponents} 
              onEdit={handleEditComponent} 
              onDelete={handleDeleteComponent}
            />
          </div>
          <div className="flex flex-col overflow-y-auto rounded-lg">
            <DiagramViewer 
                components={filteredComponents} 
                application={selectedApplication} 
                filteredApplications={filteredApplications}
            />
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
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteWarning', { componentName: componentToDelete?.nombre })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setComponentToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    