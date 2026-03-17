export type RoleUsuario = 'admin' | 'editor';
export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: RoleUsuario;
  ativo: boolean;
  criadoEm?: Date;
}
