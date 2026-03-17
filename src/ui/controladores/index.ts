import { Request, Response } from 'express';
import {
  NoticiaRepositorio, ProjetoRepositorio, GaleriaRepositorio,
  DocumentoRepositorio, ContatoRepositorio, MembroRepositorio
} from '@servicosTecnicos/repositorios';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

// ── Notícias ──
const noticiaRepo = new NoticiaRepositorio();

function gerarSlug(titulo: string): string {
  return titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    + '-' + Date.now();
}

export class NoticiaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, destaque, pagina = '1', limite = '10' } = req.query as any;
      const resultado = await noticiaRepo.listar(
        { categoria, publicado: true, destaque: destaque === 'true' ? true : undefined },
        parseInt(pagina), parseInt(limite)
      );
      res.json(resultado);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { pagina = '1', limite = '20' } = req.query as any;
      const resultado = await noticiaRepo.listar({}, parseInt(pagina), parseInt(limite));
      res.json(resultado);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorSlug(req: Request, res: Response): Promise<void> {
    try {
      const noticia = await noticiaRepo.buscarPorSlug(req.params.slug);
      if (!noticia || !noticia.publicado) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(noticia);
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
      const noticia = await noticiaRepo.criar({
        titulo, subtitulo, conteudo, slug: gerarSlug(titulo),
        imagemUrl, imagemPublicId, categoria: categoria || 'noticias',
        destaque: destaque === 'true', publicado: publicado === 'true',
        autor, tags: tags ? JSON.parse(tags) : [],
      });
      res.status(201).json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque) dados.destaque = dados.destaque === 'true';
      if (dados.publicado) dados.publicado = dados.publicado === 'true';
      if (dados.tags && typeof dados.tags === 'string') dados.tags = JSON.parse(dados.tags);
      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const noticia = await noticiaRepo.atualizar(req.params.id, dados);
      if (!noticia) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      await noticiaRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Projetos ──
const projetoRepo = new ProjetoRepositorio();

export class ProjetoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { status, categoria, destaque } = req.query as any;
      const projetos = await projetoRepo.listar({
        status, categoria,
        destaque: destaque === 'true' ? true : undefined,
      });
      res.json({ projetos, total: projetos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const projeto = await projetoRepo.buscarPorId(req.params.id);
      if (!projeto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque) dados.destaque = dados.destaque === 'true';
      if (dados.beneficiados) dados.beneficiados = Number(dados.beneficiados);
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const projeto = await projetoRepo.criar(dados);
      res.status(201).json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque) dados.destaque = dados.destaque === 'true';
      if (dados.beneficiados) dados.beneficiados = Number(dados.beneficiados);
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const projeto = await projetoRepo.atualizar(req.params.id, dados);
      if (!projeto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      await projetoRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Galeria ──
const galeriaRepo = new GaleriaRepositorio();

export class GaleriaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, destaque } = req.query as any;
      const fotos = await galeriaRepo.listar({ categoria, destaque: destaque === 'true' ? true : undefined });
      res.json({ fotos, total: fotos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Imagem obrigatória' }); return; }
      const r = await storage.upload(req.file, 'galeria');
      const dados: any = { ...req.body, imagemUrl: r.urlPublica, imagemPublicId: r.publicId };
      if (dados.destaque) dados.destaque = dados.destaque === 'true';
      if (dados.ordem) dados.ordem = Number(dados.ordem);
      const foto = await galeriaRepo.criar(dados);
      res.status(201).json(foto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque) dados.destaque = dados.destaque === 'true';
      if (dados.ordem) dados.ordem = Number(dados.ordem);
      const foto = await galeriaRepo.atualizar(req.params.id, dados);
      if (!foto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(foto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const foto = await galeriaRepo.buscarPorId(req.params.id);
      if (foto?.imagemPublicId) await storage.deletar(foto.imagemPublicId, 'image');
      await galeriaRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Documentos ──
const documentoRepo = new DocumentoRepositorio();

export class DocumentoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.query as any;
      const docs = await documentoRepo.listar({ categoria, publico: true });
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const docs = await documentoRepo.listar({});
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Arquivo obrigatório' }); return; }
      const r = await storage.upload(req.file, 'documentos');
      const dados: any = {
        ...req.body,
        arquivoUrl: r.urlPublica,
        arquivoPublicId: r.publicId,
        nomeArquivo: req.file.originalname,
        tamanho: req.file.size,
      };
      if (dados.publico) dados.publico = dados.publico === 'true';
      const doc = await documentoRepo.criar(dados);
      res.status(201).json(doc);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.publico) dados.publico = dados.publico === 'true';
      const doc = await documentoRepo.atualizar(req.params.id, dados);
      if (!doc) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(doc);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const doc = await documentoRepo.buscarPorId(req.params.id);
      if (doc?.arquivoPublicId) await storage.deletar(doc.arquivoPublicId, 'raw');
      await documentoRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Contato ──
const contatoRepo = new ContatoRepositorio();

export class ContatoControlador {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, telefone, assunto, mensagem } = req.body;
      if (!nome || !email || !assunto || !mensagem) {
        res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' }); return;
      }
      const contato = await contatoRepo.criar({ nome, email, telefone, assunto, mensagem, lido: false, respondido: false });
      res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!', id: contato.id });
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { lido } = req.query as any;
      const contatos = await contatoRepo.listar({ lido: lido === 'true' ? true : lido === 'false' ? false : undefined });
      res.json({ contatos, total: contatos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async marcarLido(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const contato = await contatoRepo.atualizar(req.params.id, { lido: true });
      res.json(contato);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      await contatoRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Membros ──
const membroRepo = new MembroRepositorio();

export class MembroControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const membros = await membroRepo.listar({ ativo: true });
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const membros = await membroRepo.listar({});
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.ordem) dados.ordem = Number(dados.ordem);
      if (dados.ativo) dados.ativo = dados.ativo === 'true';
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica; dados.fotoPublicId = r.publicId;
      }
      const membro = await membroRepo.criar(dados);
      res.status(201).json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.ordem) dados.ordem = Number(dados.ordem);
      if (dados.ativo !== undefined) dados.ativo = dados.ativo === 'true';
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica; dados.fotoPublicId = r.publicId;
      }
      const membro = await membroRepo.atualizar(req.params.id, dados);
      if (!membro) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      await membroRepo.deletar(req.params.id);
      res.json({ mensagem: 'Excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}
