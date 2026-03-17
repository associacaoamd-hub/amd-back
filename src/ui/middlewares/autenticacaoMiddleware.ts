import { Request, Response, NextFunction } from 'express';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';

export interface RequestAutenticado extends Request {
  usuario?: { usuarioId: string; email: string; role: string };
}

const autServico = new AutenticacaoServico();

export function autenticar(req: RequestAutenticado, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : undefined;
  if (!token) { res.status(401).json({ erro: 'Token não fornecido' }); return; }
  try {
    const payload = autServico.verificarToken(token);
    req.usuario = { usuarioId: payload.usuarioId, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

export function autorizar(...roles: string[]) {
  return (req: RequestAutenticado, res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.role)) {
      res.status(403).json({ erro: 'Acesso negado' }); return;
    }
    next();
  };
}
