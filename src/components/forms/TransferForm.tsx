import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransferFormData, transferFormSchema } from "@/lib/validations/contas";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContas } from "@/hooks/useContas";
import { Loader2 } from "lucide-react";

interface TransferFormProps {
  onSuccess?: () => void;
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
  const { contas, transferirEntreContas, loadingTransfer } = useContas();

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      valor: 0,
      descricao: "",
    },
  });

  async function onSubmit(data: TransferFormData) {
    try {
      await transferirEntreContas(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="conta_origem_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de Origem</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de origem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: conta.cor }}>{conta.icone}</span>
                        {conta.nome} - {conta.banco}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conta_destino_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de Destino</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de destino" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contas
                    .filter((conta) => conta.id !== form.getValues("conta_origem_id"))
                    .map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: conta.cor }}>{conta.icone}</span>
                          {conta.nome} - {conta.banco}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Transferência</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Transferência para poupança"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loadingTransfer}>
          {loadingTransfer ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferindo...
            </>
          ) : (
            "Realizar Transferência"
          )}
        </Button>
      </form>
    </Form>
  );
}
