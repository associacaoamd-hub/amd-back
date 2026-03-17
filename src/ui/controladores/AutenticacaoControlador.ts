import { Request, Response } from 'express';
import { UsuarioModel } from '@servicosTecnicos/database/schemas/index';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const autServico = new AutenticacaoServico();

export class AutenticacaoControlador {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, role } = req.body;
      if (!nome || !email || !senha) { res.status(400).json({ erro: 'Dados obrigatórios' }); return; }
      const existe = await UsuarioModel.findOne({ email });
      if (existe) { res.status(409).json({ erro: 'E-mail já cadastrado' }); return; }
      const senhaHash = await autServico.hashSenha(senha);
      const usuario = await UsuarioModel.create({ nome, email, senhaHash, role: role || 'editor', ativo: true });
      res.status(201).json({ id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role });
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) { res.status(400).json({ erro: 'Email e senha obrigatórios' }); return; }
      const usuario = await UsuarioModel.findOne({ email, ativo: true });
      if (!usuario) { res.status(401).json({ erro: 'Credenciais inválidas' }); return; }
      const valida = await autServico.compararSenha(senha, usuario.senhaHash);
      if (!valida) { res.status(401).json({ erro: 'Credenciais inválidas' }); return; }
      const token = autServico.gerarToken({ usuarioId: usuario._id.toString(), email: usuario.email, role: usuario.role });
      res.json({ token, usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role } });
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async perfil(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const usuario = await UsuarioModel.findById(req.usuario?.usuarioId);
      if (!usuario) { res.status(404).json({ erro: 'Usuário não encontrado' }); return; }
      res.json({ id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
