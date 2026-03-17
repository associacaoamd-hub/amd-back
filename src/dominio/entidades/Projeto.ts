export interface Projeto {
  id?: string;
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  imagemUrl?: string;
  imagemPublicId?: string;
  status: 'ativo' | 'concluido' | 'planejado';
  categoria: 'habitacao' | 'educacao' | 'saude' | 'cultura' | 'assistencia' | 'outros';
  beneficiados?: number;
  dataInicio?: string;
  dataFim?: string;
  destaque: boolean;
  criadoEm?: Date;
}
