'use client';

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Componente } from "@/lib/types";
import { componentTypes } from "@/lib/types";
import { useI18n } from "@/context/i18n-context";

const formSchema = z.object({
  id: z.string().min(1, "ID es requerido."),
  nombre: z.string().min(1, "Nombre es requerido."),
  aplicacionId: z.string().min(1, "ID de Aplicación es requerido."),
  padreId: z.string().nullable(),
  tipo: z.string().min(1, "Tipo es requerido."),
  nivel: z.coerce.number().min(1, "Nivel debe ser al menos 1."),
});

interface ComponentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Componente) => void;
  component: Componente | null;
  allComponents: Componente[];
}

export function ComponentForm({ isOpen, onClose, onSubmit, component, allComponents }: ComponentFormProps) {
  const { t } = useI18n();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: component ? { ...component, padreId: component.padreId || '' } : {
      id: '',
      nombre: '',
      aplicacionId: '',
      padreId: '',
      tipo: 'Componente',
      nivel: 1,
    },
  });

  React.useEffect(() => {
    form.reset(component ? { ...component, padreId: component.padreId || '' } : {
      id: '',
      nombre: '',
      aplicacionId: '',
      padreId: '',
      tipo: 'Componente',
      nivel: 1,
    });
  }, [component, form, isOpen]);

  const aplicacionId = form.watch('aplicacionId');
  const currentId = form.getValues('id');

  const parentOptions = aplicacionId
    ? allComponents.filter(c => c.aplicacionId === aplicacionId && c.id !== currentId)
    : [];

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({ ...values, padreId: values.padreId || null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{component ? t('editComponent') : t('addComponent')}</DialogTitle>
          <DialogDescription>
            {component ? t('editComponentDescription') : t('addComponentDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input placeholder={t('idPlaceholder')} {...field} disabled={!!component} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aplicacionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('applicationId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('applicationIdPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="padreId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('parent')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('parentPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t('none')}</SelectItem>
                      {parentOptions.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre} ({p.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('type')}</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('typePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {componentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('level')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
