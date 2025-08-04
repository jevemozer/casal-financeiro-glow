import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContas } from "@/hooks/useContas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ArrowLeftRight 
} from "lucide-react";
import AccountForm from "@/components/forms/AccountForm";
import TransferForm from "@/components/forms/TransferForm";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Wallet,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingButton, LoadingCard } from '@/components/ui/loading';
import { contaSchema, type ContaFormData } from '@/lib/validations/conta';
import { cn } from '@/lib/utils';

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  banco?: string;
  saldo: number;
  limite_credito?: number;
}

export default function Contas() {
  const { user } = useAuth();
  const { contas, deleteConta, loading } = useContas();
  const [selectedConta, setSelectedConta] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDelete = async () => {
    if (selectedConta) {
      await deleteConta(selectedConta);
      setIsDeleteDialogOpen(false);
      setSelectedConta(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e cartões
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isTransferFormOpen} onOpenChange={setIsTransferFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transferir
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Transferência entre Contas</DialogTitle>
                <DialogDescription>
                  Realize transferências entre suas contas
                </DialogDescription>
              </DialogHeader>
              <TransferForm onSuccess={() => setIsTransferFormOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isAccountFormOpen} onOpenChange={setIsAccountFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Conta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta bancária ou cartão
                </DialogDescription>
              </DialogHeader>
              <AccountForm onSuccess={() => setIsAccountFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100 rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contas.map((conta) => (
            <Card key={conta.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: conta.cor }}
                    >
                      {conta.icone}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conta.nome}</CardTitle>
                      <CardDescription>{conta.banco}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Conta</DialogTitle>
                            <DialogDescription>
                              Modifique os detalhes da sua conta
                            </DialogDescription>
                          </DialogHeader>
                          <AccountForm
                            accountId={conta.id}
                            defaultValues={{
                              nome: conta.nome,
                              tipo: conta.tipo as 'corrente' | 'poupanca' | 'cartao',
                              banco: conta.banco,
                              saldo_inicial: conta.saldo_inicial,
                              cor: conta.cor,
                              icone: conta.icone,
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedConta(conta.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(conta.saldo_atual)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conta.tipo === "cartao"
                      ? "Fatura Atual"
                      : "Saldo Disponível"}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" className="w-full text-sm" onClick={() => {}}>
                  Ver Extrato
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta será permanentemente
              excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedConta(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
