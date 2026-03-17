import { Request, Response } from 'express';
import { DocumentoModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

export class DocumentoControlador {
  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const docs = await DocumentoModel.find({ publico: true }).sort({ criadoEm: -1 });
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const docs = await DocumentoModel.find().sort({ criadoEm: -1 });
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Arquivo obrigatório' }); return; }
      const r = await storage.upload(req.file, 'documentos');
      const doc = await DocumentoModel.create({
        titulo: req.body.titulo || req.file.originalname,
        descricao: req.body.descricao,
        categoria: req.body.categoria || 'outros',
        arquivoUrl: r.urlPublica,
        arquivoPublicId: r.publicId,
        nomeArquivo: req.file.originalname,
        tamanho: req.file.size,
        publico: req.body.publico !== 'false',
      });
      res.status(201).json(doc);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const doc = await DocumentoModel.findByIdAndDelete(req.params.id);
      if (!doc) { res.status(404).json({ erro: 'Documento não encontrado' }); return; }
      await storage.deletar(doc.arquivoPublicId, 'raw');
      res.json({ mensagem: 'Documento excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
