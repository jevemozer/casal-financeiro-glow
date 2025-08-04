import { Database as BaseDatabase } from './types';

export type Database = BaseDatabase & {
  public: {
    Functions: BaseDatabase['public']['Functions'] & {
      realizar_transferencia: {
        Args: {
          p_conta_origem_id: string;
          p_conta_destino_id: string;
          p_valor: number;
          p_descricao: string;
          p_casal_id: string;
        };
        Returns: void;
      };
    };
  };
};
