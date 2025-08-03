import React, { useState } from 'react';
import {
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  LoadingButton,
  PageLoading,
} from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoadingExample() {
  const [showPageLoading, setShowPageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimulateLoading = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  const handleShowPageLoading = () => {
    setShowPageLoading(true);
    setTimeout(() => {
      setShowPageLoading(false);
    }, 3000);
  };

  if (showPageLoading) {
    return <PageLoading text="Carregando página..." size="lg" />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Exemplos de Loading</h1>

      {/* LoadingSpinner Examples */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingSpinner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner color="default" text="Carregando..." />
            <LoadingSpinner color="muted" text="Processando..." />
            <LoadingSpinner color="white" text="Aguarde..." />
          </div>
        </CardContent>
      </Card>

      {/* LoadingCard Examples */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingCard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LoadingCard size="sm" lines={2} />
            <LoadingCard size="md" lines={3} />
            <LoadingCard size="lg" lines={4} />
          </div>
        </CardContent>
      </Card>

      {/* LoadingTable Examples */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingTable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoadingTable rows={5} columns={4} size="md" />
        </CardContent>
      </Card>

      {/* LoadingButton Examples */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingButton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <LoadingButton
              loading={isSubmitting}
              loadingText="Salvando..."
              onClick={handleSimulateLoading}
            >
              Salvar Dados
            </LoadingButton>
            <LoadingButton
              loading={isSubmitting}
              loadingText="Processando..."
              variant="outline"
              onClick={handleSimulateLoading}
            >
              Processar
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* PageLoading Example */}
      <Card>
        <CardHeader>
          <CardTitle>PageLoading</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleShowPageLoading}>
            Simular Loading de Página
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
