import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Copy, Heart, Plus, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      
      const { error } = await supabase
        .from('casais')
        .insert({
          user1_id: user.id,
          codigo_convite: code,
          status: 'pendente'
        });

      if (error) throw error;

      toast.success('Código de convite gerado!');
      onPartnerConnected();
    } catch (error: any) {
      toast.error('Erro ao gerar código: ' + error.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const acceptInvite = async () => {
    if (!user || !inviteCode.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('casais')
        .update({
          user2_id: user.id,
          status: 'ativo'
        })
        .eq('codigo_convite', inviteCode.toUpperCase())
        .eq('status', 'pendente')
        .is('user2_id', null);

      if (error) throw error;

      toast.success('Convite aceito! Vocês agora estão conectados.');
      onPartnerConnected();
    } catch (error: any) {
      toast.error('Código inválido ou já utilizado');
    } finally {
      setLoading(false);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Parceiro Conectado
          </CardTitle>
          <CardDescription>
            Vocês estão gerenciando as finanças juntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="h-4 w-4" />
            Casal ativo
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has pending invite
  if (casal?.status === 'pendente' && casal.user1_id === user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Aguardando Parceiro
          </CardTitle>
          <CardDescription>
            Compartilhe o código abaixo com seu parceiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-2 rounded text-lg font-mono flex-1 text-center">
                {casal.codigo_convite}
              </code>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu parceiro deve inserir este código para se conectar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Conectar Parceiro
        </CardTitle>
        <CardDescription>
          Convide seu parceiro para gerenciar as finanças juntos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Gerar Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Código de Convite</DialogTitle>
              <DialogDescription>
                Crie um código para que seu parceiro possa se conectar às suas finanças
              </DialogDescription>
            </DialogHeader>
            <Button 
              onClick={generateInviteCode} 
              disabled={generatingCode}
              className="w-full"
            >
              {generatingCode ? 'Gerando...' : 'Gerar Código'}
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Aceitar Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aceitar Convite</DialogTitle>
              <DialogDescription>
                Digite o código de convite que seu parceiro compartilhou
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Digite o código"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="text-center font-mono"
              />
              <Button 
                onClick={acceptInvite} 
                disabled={loading || !inviteCode.trim()}
                className="w-full"
              >
                {loading ? 'Conectando...' : 'Aceitar Convite'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}