import { Request, Response } from 'express';
import { NoticiaModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

// ✅ helper para params (evita string | string[])
function ps(val: any): string {
  if (Array.isArray(val)) return val[0];
  return String(val);
}

// ✅ helper para query
function qs(val: any): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Date.now();
}

export class NoticiaControlador {

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const categoria = qs(req.query.categoria);
      const destaque = qs(req.query.destaque);
      const limite = parseInt(qs(req.query.limite) || '10');
      const pagina = parseInt(qs(req.query.pagina) || '1');

      const query: any = { publicado: true };

      if (categoria) query.categoria = categoria;
      if (destaque === 'true') query.destaque = true;

      const skip = (pagina - 1) * limite;

      const [noticias, total] = await Promise.all([
        NoticiaModel
          .find(query as any) // 🔥 FIX
          .sort({ criadoEm: -1 })
          .skip(skip)
          .limit(limite),

        NoticiaModel.countDocuments(query as any) // 🔥 FIX
      ]);

      res.json({
        noticias,
        total,
        pagina,
        totalPaginas: Math.ceil(total / limite)
      });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async buscarPorSlug(req: Request, res: Response): Promise<void> {
    try {
      const noticia = await NoticiaModel.findOne({
        slug: ps(req.params.slug),
        publicado: true
      } as any); // 🔥 FIX

      if (!noticia) {
        res.status(404).json({ erro: 'Notícia não encontrada' });
        return;
      }

      res.json(noticia);

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async listarAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const noticias = await NoticiaModel
        .find({} as any) // 🔥 FIX
        .sort({ criadoEm: -1 });

      res.json({ noticias, total: noticias.length });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const {
        titulo,
        subtitulo,
        conteudo,
        categoria,
        destaque,
        publicado,
        autor,
        tags
      } = req.body;

      if (!titulo || !conteudo) {
        res.status(400).json({ erro: 'Título e conteúdo obrigatórios' });
        return;
      }

      let imagemUrl: string | undefined;
      let imagemPublicId: string | undefined;

      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        imagemUrl = r.urlPublica;
        imagemPublicId = r.publicId;
      }

      const noticia = await NoticiaModel.create({
        titulo,
        subtitulo,
        conteudo,
        slug: gerarSlug(titulo),
        imagemUrl,
        imagemPublicId,
        categoria: categoria || 'noticias',
        destaque: Boolean(destaque === 'true'),
        publicado: Boolean(publicado === 'true'),
        autor,
        tags: tags
          ? tags.split(',').map((t: string) => t.trim())
          : [],
      } as any); // 🔥 FIX

      res.status(201).json(noticia);

    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const {
        titulo,
        subtitulo,
        conteudo,
        categoria,
        destaque,
        publicado,
        autor,
        tags
      } = req.body;

      const dados: any = {
        subtitulo,
        conteudo,
        categoria,
        autor
      };

      if (titulo) {
        dados.titulo = titulo;
        dados.slug = gerarSlug(titulo);
      }

      if (destaque !== undefined) {
        dados.destaque = Boolean(destaque === 'true');
      }

      if (publicado !== undefined) {
        dados.publicado = Boolean(publicado === 'true');
      }

      if (tags) {
        dados.tags = tags.split(',').map((t: string) => t.trim());
      }

      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        dados.imagemUrl = r.urlPublica;
        dados.imagemPublicId = r.publicId;
      }

      const noticia = await NoticiaModel.findByIdAndUpdate(
        ps(req.params.id),
        { $set: dados } as any, // 🔥 FIX
        { new: true }
      );

      if (!noticia) {
        res.status(404).json({ erro: 'Notícia não encontrada' });
        return;
      }

      res.json(noticia);

    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const noticia = await NoticiaModel.findByIdAndDelete(
        ps(req.params.id) // 🔥 FIX
      );

      if (!noticia) {
        res.status(404).json({ erro: 'Notícia não encontrada' });
        return;
      }

      if (noticia.imagemPublicId) {
        await storage.deletar(noticia.imagemPublicId);
      }

      res.json({ mensagem: 'Notícia excluída' });

    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}