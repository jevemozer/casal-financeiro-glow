import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountFormData, accountFormSchema } from "@/lib/validations/contas";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AccountFormProps {
  defaultValues?: Partial<AccountFormData>;
  onSuccess?: () => void;
  accountId?: string;
}

const tiposConta = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Conta Poupança" },
  { value: "cartao", label: "Cartão de Crédito" },
];

const cores = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB",
];

const icones = ["💳", "🏦", "💰", "💸", "🏧", "📊", "💵", "🪙"];

export default function AccountForm({ defaultValues, onSuccess, accountId }: AccountFormProps) {
  const { createConta, updateConta, loading } = useContas();
  const [selectedColor, setSelectedColor] = useState(defaultValues?.cor || cores[0]);
  const [selectedIcon, setSelectedIcon] = useState(defaultValues?.icone || icones[0]);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: defaultValues || {
      nome: "",
      tipo: "corrente",
      banco: "",
      saldo_inicial: 0,
      cor: cores[0],
      icone: icones[0],
    },
  });

  async function onSubmit(data: AccountFormData) {
    try {
      if (accountId) {
        await updateConta(accountId, { ...data, cor: selectedColor, icone: selectedIcon });
      } else {
        await createConta({ ...data, cor: selectedColor, icone: selectedIcon });
      }
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
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Conta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nubank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposConta.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
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
          name="banco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Banco do Brasil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="saldo_inicial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Inicial</FormLabel>
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

        <div className="space-y-2">
          <FormLabel>Cor</FormLabel>
          <div className="flex flex-wrap gap-2">
            {cores.map((cor) => (
              <button
                key={cor}
                type="button"
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === cor ? "scale-125 ring-2 ring-offset-2 ring-purple-500" : ""
                }`}
                style={{ backgroundColor: cor }}
                onClick={() => setSelectedColor(cor)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Ícone</FormLabel>
          <div className="flex flex-wrap gap-2">
            {icones.map((icone) => (
              <button
                key={icone}
                type="button"
                className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl transition-transform ${
                  selectedIcon === icone ? "scale-110 ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedIcon(icone)}
              >
                {icone}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{accountId ? "Atualizar" : "Criar"} Conta</>
          )}
        </Button>
      </form>
    </Form>
  );
}
