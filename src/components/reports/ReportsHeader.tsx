import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, FileSpreadsheet, Printer, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportsHeaderProps {
  startDate?: string;
  endDate?: string;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

export function ReportsHeader({ 
  startDate, 
  endDate, 
  onExportPDF,
  onExportExcel,
  onPrint,
  onShare 
}: ReportsHeaderProps) {
  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    
    return `${format(new Date(startDate), "d 'de' MMMM", { locale: ptBR })} - ${format(new Date(endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Relatórios Financeiros
        </h1>
        {startDate && endDate && (
          <p className="text-muted-foreground mt-1">
            {formatDateRange()}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Print Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPrint}
          className="hidden sm:flex"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        
        {/* Share Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShare}
          className="hidden md:flex"
        >
          <Share className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}