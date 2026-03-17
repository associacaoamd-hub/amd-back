export interface Membro {
  id?: string;
  nome: string;
  cargo: string;
  descricao?: string;
  fotoUrl?: string;
  fotoPublicId?: string;
  email?: string;
  ordem: number;
  ativo: boolean;
  criadoEm?: Date;
}
