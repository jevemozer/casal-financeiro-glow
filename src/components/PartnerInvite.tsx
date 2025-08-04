import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Copy, Heart, Plus, UserPlus, Users2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface Casal {
  id: string;
  user1_id: string;
  user2_id: string | null;
  status: string;
  codigo_convite: string | null;
}

interface PartnerInviteProps {
  casal: Casal | null;
  onPartnerConnected: () => void;
}

export default function PartnerInvite({ casal, onPartnerConnected }: PartnerInviteProps) {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  const generateInviteCode = async () => {
    if (!user) return;
    
    setGeneratingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Primeiro verifica se já existe um casal pendente
      const { data: existingCasal, error: checkError } = await supabase
        .from('casais')
        .select('*')
        .eq('user1_id', user.id)
        .eq('status', 'pendente')
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 é o código para nenhum resultado
        throw checkError;
      }

      if (existingCasal) {
        // Atualiza o código de convite existente
        const { error } = await supabase
          .from('casais')
          .update({ 
            codigo_convite: code,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCasal.id)
          .select('*')
          .single();

        if (error) throw error;
      } else {
        // Cria um novo registro de casal
        const { error } = await supabase
          .from('casais')
          .insert({
            user1_id: user.id,
            codigo_convite: code,
            status: 'pendente'
          })
          .select('*')
          .single();

        if (error) throw error;
      }

      // Força uma atualização dos dados
      onPartnerConnected();
      toast.success('Código de convite gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast.error('Erro ao gerar código. Tente novamente.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const acceptInvite = async () => {
    if (!user || !inviteCode.trim()) return;
    
    setLoading(true);
    try {
      // Primeiro verifica se já não está em um casal ativo
      const { data: existingActive, error: activeError } = await supabase
        .from('casais')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'ativo')
        .maybeSingle();

      if (activeError) throw activeError;

      if (existingActive) {
        toast.error('Você já está em um casal ativo');
        return;
      }

      // Verifica se o convite existe e é válido
      const { data: casais, error: checkError } = await supabase
        .from('casais')
        .select('*')
        .filter('codigo_convite', 'eq', inviteCode.toUpperCase())
        .filter('status', 'eq', 'pendente')
        .filter('user2_id', 'is', null);

      if (checkError) throw checkError;

      const casal = casais?.[0];

      if (!casal) {
        toast.error('Código inválido ou já utilizado');
        return;
      }

      if (checkError) {
        if (checkError.code === 'PGRST116') { // Nenhum resultado
          toast.error('Código inválido ou já utilizado');
        } else {
          throw checkError;
        }
        return;
      }

      // Verifica se não está tentando se conectar ao próprio convite
      if (casal.user1_id === user.id) {
        toast.error('Você não pode aceitar seu próprio convite');
        return;
      }

      // Atualiza o casal com o novo parceiro
      const { error: updateError } = await supabase
        .from('casais')
        .update({
          user2_id: user.id,
          status: 'ativo',
          codigo_convite: null, // Limpa o código após uso
          updated_at: new Date().toISOString()
        })
        .eq('id', casal.id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Convite aceito! Vocês agora estão conectados.');
      onPartnerConnected();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(`Erro ao aceitar convite: ${error.message}`);
      } else {
        toast.error('Erro ao aceitar convite. Tente novamente.');
      }
    } finally {
      setLoading(false);
      setInviteCode(''); // Limpa o código
    }
  };

  const copyInviteCode = () => {
    if (casal?.codigo_convite) {
      navigator.clipboard.writeText(casal.codigo_convite);
      toast.success('Código copiado!');
    }
  };

  // If user already has an active couple
  if (casal?.status === 'ativo' && casal.user2_id) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 animate-in fade-in duration-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Parceiro Conectado
              </span>
            </CardTitle>
            <HoverCard>
              <HoverCardTrigger>
                <Users2 className="h-5 w-5 text-purple-500 hover:text-purple-600 transition-colors cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Gestão Compartilhada Ativa</h4>
                  <p className="text-sm text-muted-foreground">
                    Vocês já estão conectados e podem gerenciar suas finanças juntos.
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={100} className="h-2" />
                    <span className="text-xs text-purple-600">100%</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <CardDescription>
            Compartilhando objetivos e conquistas financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-purple-100/50 rounded-lg p-3 group hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-full">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Casal Ativo</p>
                <p className="text-xs text-muted-foreground">Gerenciando finanças juntos</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has pending invite
  if (casal?.status === 'pendente' && casal.user1_id === user?.id) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 via-white to-yellow-50 animate-in fade-in duration-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-600 to-yellow-600 bg-clip-text text-transparent">
                Aguardando Parceiro
              </span>
            </CardTitle>
            <HoverCard>
              <HoverCardTrigger>
                <Users2 className="h-5 w-5 text-purple-500 hover:text-purple-600 transition-colors cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Convite Pendente</h4>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe o código com seu parceiro para começarem a jornada financeira juntos.
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={50} className="h-2" />
                    <span className="text-xs text-purple-600">50%</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <CardDescription>
            Compartilhe o código abaixo para iniciar a gestão compartilhada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative group">
            <div className="flex items-center gap-2">
              <code className="w-full bg-gradient-to-r from-purple-500/10 to-yellow-500/10 px-4 py-3 rounded-lg text-xl font-mono text-center tracking-wider text-purple-700 transition-colors group-hover:from-purple-500/20 group-hover:to-yellow-500/20">
                {casal.codigo_convite}
              </code>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyInviteCode}
                className="bg-white hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-yellow-500 opacity-0 blur-xl group-hover:opacity-10 transition-opacity -z-10" />
          </div>
          <p className="text-sm text-muted-foreground text-center animate-pulse">
            Aguardando seu parceiro inserir o código...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 animate-in fade-in duration-700 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Conectar Parceiro
            </span>
          </CardTitle>
          <HoverCard>
            <HoverCardTrigger>
              <Users2 className="h-5 w-5 text-purple-500 hover:text-purple-600 transition-colors cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Comece sua Jornada Financeira</h4>
                <p className="text-sm text-muted-foreground">
                  Gere um código para convidar seu parceiro ou aceite um convite existente.
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={0} className="h-2" />
                  <span className="text-xs text-purple-600">0%</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <CardDescription>
          Comece sua jornada financeira compartilhada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform" />
              Gerar Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-500" />
                Gerar Código de Convite
              </DialogTitle>
              <DialogDescription>
                Crie um código único para conectar-se com seu parceiro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-purple-700">
                  Ao gerar o código, você poderá compartilhá-lo com seu parceiro para iniciar a gestão financeira conjunta.
                </p>
              </div>
              <Button 
                onClick={generateInviteCode} 
                disabled={generatingCode}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              >
                {generatingCode ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </span>
                ) : 'Gerar Código'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <UserPlus className="h-4 w-4 mr-2 text-purple-500 group-hover:scale-110 transition-transform" />
              Aceitar Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-500" />
                Aceitar Convite
              </DialogTitle>
              <DialogDescription>
                Digite o código de convite do seu parceiro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative group">
                <Input
                  placeholder="Digite o código"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-wider bg-purple-50/50 border-purple-200 focus:border-purple-300 transition-colors"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 blur-xl group-hover:opacity-10 transition-opacity -z-10" />
              </div>
              <Button 
                onClick={acceptInvite} 
                disabled={loading || !inviteCode.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Conectando...
                  </span>
                ) : 'Aceitar Convite'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}