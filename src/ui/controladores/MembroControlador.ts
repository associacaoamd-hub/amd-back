import { Request, Response } from 'express';
import { MembroModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

export class MembroControlador {
  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const membros = await MembroModel.find({ ativo: true }).sort({ ordem: 1 });
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const membros = await MembroModel.find().sort({ ordem: 1 });
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { nome, cargo, descricao, email, ordem, ativo } = req.body;
      if (!nome || !cargo) { res.status(400).json({ erro: 'Nome e cargo obrigatórios' }); return; }
      let fotoUrl, fotoPublicId;
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        fotoUrl = r.urlPublica; fotoPublicId = r.publicId;
      }
      const membro = await MembroModel.create({
        nome, cargo, descricao, email, fotoUrl, fotoPublicId,
        ordem: Number(ordem) || 0, ativo: ativo !== 'false',
      });
      res.status(201).json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.ordem) dados.ordem = Number(dados.ordem);
      if (dados.ativo !== undefined) dados.ativo = dados.ativo !== 'false';
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica; dados.fotoPublicId = r.publicId;
      }
      const membro = await MembroModel.findByIdAndUpdate(req.params.id, { $set: dados }, { new: true });
      if (!membro) { res.status(404).json({ erro: 'Membro não encontrado' }); return; }
      res.json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const membro = await MembroModel.findByIdAndDelete(req.params.id);
      if (!membro) { res.status(404).json({ erro: 'Membro não encontrado' }); return; }
      if (membro.fotoPublicId) await storage.deletar(membro.fotoPublicId);
      res.json({ mensagem: 'Membro excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
