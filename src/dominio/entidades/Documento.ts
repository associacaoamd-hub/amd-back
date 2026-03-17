export interface Documento {
  id?: string;
  titulo: string;
  descricao?: string;
  categoria: 'estatuto' | 'ata' | 'relatorio' | 'prestacao_contas' | 'certificado' | 'outros';
  arquivoUrl: string;
  arquivoPublicId: string;
  nomeArquivo: string;
  tamanho: number;
  publico: boolean;
  criadoEm?: Date;
}
