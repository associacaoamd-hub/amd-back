import { Request, Response } from 'express';
import { NoticiaModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

function gerarSlug(titulo: string): string {
  return titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now();
}

export class NoticiaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, destaque, limite = '10', pagina = '1' } = req.query as any;
      const query: any = { publicado: true };
      if (categoria) query.categoria = categoria;
      if (destaque === 'true') query.destaque = true;
      const skip = (parseInt(pagina) - 1) * parseInt(limite);
      const [noticias, total] = await Promise.all([
        NoticiaModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(parseInt(limite)),
        NoticiaModel.countDocuments(query),
      ]);
      res.json({ noticias, total, pagina: parseInt(pagina), totalPaginas: Math.ceil(total / parseInt(limite)) });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorSlug(req: Request, res: Response): Promise<void> {
    try {
      const noticia = await NoticiaModel.findOne({ slug: req.params.slug, publicado: true });
      if (!noticia) { res.status(404).json({ erro: 'Notícia não encontrada' }); return; }
      res.json(noticia);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const noticias = await NoticiaModel.find().sort({ criadoEm: -1 });
      res.json({ noticias, total: noticias.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { titulo, subtitulo, conteudo, categoria, destaque, publicado, autor, tags } = req.body;
      if (!titulo || !conteudo) { res.status(400).json({ erro: 'Título e conteúdo obrigatórios' }); return; }
      let imagemUrl, imagemPublicId;
      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        imagemUrl = r.urlPublica; imagemPublicId = r.publicId;
      }
      const noticia = await NoticiaModel.create({
        titulo, subtitulo, conteudo, slug: gerarSlug(titulo), imagemUrl, imagemPublicId,
        categoria: categoria || 'noticias', destaque: destaque === 'true',
        publicado: publicado === 'true', autor, tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      });
      res.status(201).json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { titulo, subtitulo, conteudo, categoria, destaque, publicado, autor, tags } = req.body;
      const dados: any = { subtitulo, conteudo, categoria, autor };
      if (titulo) { dados.titulo = titulo; dados.slug = gerarSlug(titulo); }
      if (destaque !== undefined) dados.destaque = destaque === 'true';
      if (publicado !== undefined) dados.publicado = publicado === 'true';
      if (tags) dados.tags = tags.split(',').map((t: string) => t.trim());
      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const noticia = await NoticiaModel.findByIdAndUpdate(req.params.id, { $set: dados }, { new: true });
      if (!noticia) { res.status(404).json({ erro: 'Notícia não encontrada' }); return; }
      res.json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const noticia = await NoticiaModel.findByIdAndDelete(req.params.id);
      if (!noticia) { res.status(404).json({ erro: 'Notícia não encontrada' }); return; }
      if (noticia.imagemPublicId) await storage.deletar(noticia.imagemPublicId);
      res.json({ mensagem: 'Notícia excluída' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
