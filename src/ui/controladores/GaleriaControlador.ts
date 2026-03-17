import { Request, Response } from 'express';
import { GaleriaModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

export class GaleriaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, destaque } = req.query as any;
      const query: any = {};
      if (categoria) query.categoria = categoria;
      if (destaque === 'true') query.destaque = true;
      const imagens = await GaleriaModel.find(query).sort({ ordem: 1, criadoEm: -1 });
      res.json({ imagens, total: imagens.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Imagem obrigatória' }); return; }
      const r = await storage.upload(req.file, 'galeria');
      const imagem = await GaleriaModel.create({
        titulo: req.body.titulo || req.file.originalname,
        descricao: req.body.descricao,
        imagemUrl: r.urlPublica,
        imagemPublicId: r.publicId,
        categoria: req.body.categoria || 'eventos',
        destaque: req.body.destaque === 'true',
        ordem: Number(req.body.ordem) || 0,
      });
      res.status(201).json(imagem);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque !== undefined) dados.destaque = dados.destaque === 'true';
      const imagem = await GaleriaModel.findByIdAndUpdate(req.params.id, { $set: dados }, { new: true });
      if (!imagem) { res.status(404).json({ erro: 'Imagem não encontrada' }); return; }
      res.json(imagem);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const imagem = await GaleriaModel.findByIdAndDelete(req.params.id);
      if (!imagem) { res.status(404).json({ erro: 'Imagem não encontrada' }); return; }
      await storage.deletar(imagem.imagemPublicId);
      res.json({ mensagem: 'Imagem excluída' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
