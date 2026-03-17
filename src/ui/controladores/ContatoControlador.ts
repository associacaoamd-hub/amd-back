import { Request, Response } from 'express';
import { ContatoModel } from '@servicosTecnicos/database/schemas/index';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

export class ContatoControlador {
  async enviar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, telefone, assunto, mensagem } = req.body;
      if (!nome || !email || !assunto || !mensagem) {
        res.status(400).json({ erro: 'Nome, email, assunto e mensagem são obrigatórios' }); return;
      }
      const contato = await ContatoModel.create({ nome, email, telefone, assunto, mensagem, lido: false, respondido: false });
      res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!', id: contato._id });
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const contatos = await ContatoModel.find().sort({ criadoEm: -1 });
      res.json({ contatos, total: contatos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async marcarLido(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const contato = await ContatoModel.findByIdAndUpdate(req.params.id, { lido: true }, { new: true });
      if (!contato) { res.status(404).json({ erro: 'Contato não encontrado' }); return; }
      res.json(contato);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      await ContatoModel.findByIdAndDelete(req.params.id);
      res.json({ mensagem: 'Excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
