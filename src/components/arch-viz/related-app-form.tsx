
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
import type { AplicacionRelacionada } from "@/lib/types";
import { useI18n } from "@/context/i18n-context";

const formSchema = z.object({
  id: z.string().min(1, "ID es requerido."),
  codigo: z.string().min(1, "Código es requerido."),
  nombre: z.string().min(1, "Nombre es requerido."),
  tipo: z.literal('AplicacionExterna'),
  aplicacionId: z.string().min(1, "ID de Aplicación es requerido."),
});

interface RelatedAppFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AplicacionRelacionada) => void;
  app: AplicacionRelacionada | null;
  existingIds: string[];
  applicationId: string;
}

export function RelatedAppForm({ isOpen, onClose, onSubmit, app, existingIds, applicationId }: RelatedAppFormProps) {
  const { t } = useI18n();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: app ? app : {
      id: '',
      codigo: '',
      nombre: '',
      tipo: 'AplicacionExterna',
      aplicacionId: applicationId,
    },
  });

  React.useEffect(() => {
    form.reset(app ? app : {
      id: '',
      codigo: '',
      nombre: '',
      tipo: 'AplicacionExterna',
      aplicacionId: applicationId,
    });
  }, [app, form, isOpen, applicationId]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    if (!app && existingIds.includes(values.id)) {
        form.setError('id', { type: 'manual', message: t('duplicateIdErrorToastDescription', { componentId: values.id }) });
        return;
    }
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{app ? t('editRelatedApp') : t('addRelatedApp')}</DialogTitle>
          <DialogDescription>
            {app ? t('editRelatedAppDescription') : t('addRelatedAppDescription')}
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
                    <Input placeholder={t('idPlaceholder')} {...field} disabled={!!app} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('code')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('codePlaceholder')} {...field} />
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
                    <Input placeholder={t('applicationIdPlaceholder')} {...field} disabled={true} />
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

    