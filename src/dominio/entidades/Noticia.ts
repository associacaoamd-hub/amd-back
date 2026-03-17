export interface Noticia {
  id?: string;
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  slug: string;
  imagemUrl?: string;
  imagemPublicId?: string;
  categoria: 'noticias' | 'eventos' | 'projetos' | 'comunicados';
  destaque: boolean;
  publicado: boolean;
  autor?: string;
  tags?: string[];
  criadoEm?: Date;
  atualizadoEm?: Date;
}
