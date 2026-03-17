export interface Galeria {
  id?: string;
  titulo: string;
  descricao?: string;
  imagemUrl: string;
  imagemPublicId: string;
  categoria: 'eventos' | 'projetos' | 'comunidade' | 'institucional';
  destaque: boolean;
  ordem: number;
  criadoEm?: Date;
}
