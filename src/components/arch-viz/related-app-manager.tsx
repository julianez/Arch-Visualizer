
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
import type { AplicacionRelacionada } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";
import { TypeIcon } from "./type-icon";
import { useI18n } from "@/context/i18n-context";

interface RelatedAppManagerProps {
  relatedApps: AplicacionRelacionada[];
  onEdit: (app: AplicacionRelacionada) => void;
  onDelete: (app: AplicacionRelacionada) => void;
}

export function RelatedAppManager({ relatedApps, onEdit, onDelete }: RelatedAppManagerProps) {
  const { t } = useI18n();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('code')}</TableHead>
             <TableHead className="hidden md:table-cell">{t('applicationId')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatedApps.length > 0 ? relatedApps.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <TypeIcon type={app.tipo} className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{app.nombre}</span>
                    <span className="text-xs text-muted-foreground">{app.id}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{app.codigo}</TableCell>
              <TableCell className="hidden md:table-cell">{app.aplicacionId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(app)} aria-label={`Edit ${app.nombre}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(app)} aria-label={`Delete ${app.nombre}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t('noRelatedApps')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

    