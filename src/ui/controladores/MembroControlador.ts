import { Request, Response } from 'express';
import { MembroModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

// ✅ helper para garantir string
function ps(val: any): string {
  if (Array.isArray(val)) return val[0];
  return String(val);
}

export class MembroControlador {

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const membros = await MembroModel
        .find({ ativo: true } as any) // 🔥 FIX MONGOOSE
        .sort({ ordem: 1 });

      res.json({ membros, total: membros.length });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async listarAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const membros = await MembroModel
        .find({} as any) // 🔥 FIX
        .sort({ ordem: 1 });

      res.json({ membros, total: membros.length });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { nome, cargo, descricao, email, ordem, ativo } = req.body;

      if (!nome || !cargo) {
        res.status(400).json({ erro: 'Nome e cargo obrigatórios' });
        return;
      }

      let fotoUrl: string | undefined;
      let fotoPublicId: string | undefined;

      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        fotoUrl = r.urlPublica;
        fotoPublicId = r.publicId;
      }

      const membro = await MembroModel.create({
        nome,
        cargo,
        descricao,
        email,
        fotoUrl,
        fotoPublicId,
        ordem: Number(ordem) || 0,
        ativo: Boolean(ativo !== 'false'),
      } as any); // 🔥 FIX MONGOOSE

      res.status(201).json(membro);

    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };

      if (dados.ordem !== undefined) {
        dados.ordem = Number(dados.ordem);
      }

      if (dados.ativo !== undefined) {
        dados.ativo = Boolean(dados.ativo !== 'false');
      }

      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica;
        dados.fotoPublicId = r.publicId;
      }

      const membro = await MembroModel.findByIdAndUpdate(
        ps(req.params.id),
        { $set: dados } as any, // 🔥 FIX
        { new: true }
      );

      if (!membro) {
        res.status(404).json({ erro: 'Membro não encontrado' });
        return;
      }

      res.json(membro);

    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const membro = await MembroModel.findByIdAndDelete(
        ps(req.params.id) // 🔥 FIX string
      );

      if (!membro) {
        res.status(404).json({ erro: 'Membro não encontrado' });
        return;
      }

      if (membro.fotoPublicId) {
        await storage.deletar(membro.fotoPublicId);
      }

      res.json({ mensagem: 'Membro excluído' });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}