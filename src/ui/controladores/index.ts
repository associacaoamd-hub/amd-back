import { Request, Response } from 'express';
import {
  NoticiaRepositorio, ProjetoRepositorio, GaleriaRepositorio,
  DocumentoRepositorio, ContatoRepositorio, MembroRepositorio
} from '@servicosTecnicos/repositorios';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

// ── TIPOS ──
type CategoriaNoticia = 'noticias' | 'eventos' | 'projetos' | 'comunicados';
type StatusProjeto = 'ativo' | 'concluido' | 'planejado';
type CategoriaProjeto = 'habitacao' | 'educacao' | 'saude' | 'cultura' | 'assistencia' | 'outros';
type CategoriaGaleria = 'eventos' | 'projetos' | 'comunidade' | 'institucional';
type CategoriaDocumento = 'outros' | 'estatuto' | 'ata' | 'relatorio' | 'prestacao_contas' | 'certificado';

// ── HELPERS ──
function qs(val: any): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val as string | undefined;
}

function ps(val: any): string {
  if (Array.isArray(val)) return val[0];
  return String(val);
}

// Validador seguro
function validarEnum<T>(valor: any, lista: readonly T[]): T | undefined {
  return lista.includes(valor) ? valor : undefined;
}

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
      const pagina = parseInt(qs(req.query.pagina) || '1');
      const limite = parseInt(qs(req.query.limite) || '10');

      const categoria = validarEnum<CategoriaNoticia>(
        qs(req.query.categoria),
        ['noticias', 'eventos', 'projetos', 'comunicados']
      );

      const destaque = qs(req.query.destaque);

      const resultado = await noticiaRepo.listar(
        { categoria, publicado: true, destaque: destaque === 'true' ? true : undefined },
        pagina, limite
      );

      res.json(resultado);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { titulo, subtitulo, conteudo, categoria, destaque, publicado, autor, tags } = req.body;

      const categoriaValida = validarEnum<CategoriaNoticia>(
        categoria,
        ['noticias', 'eventos', 'projetos', 'comunicados']
      ) || 'noticias';

      let imagemUrl, imagemPublicId;

      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        imagemUrl = r.urlPublica;
        imagemPublicId = r.publicId;
      }

      const noticia = await noticiaRepo.criar({
        titulo,
        subtitulo,
        conteudo,
        slug: gerarSlug(titulo),
        imagemUrl,
        imagemPublicId,
        categoria: categoriaValida,
        destaque: destaque === 'true',
        publicado: publicado === 'true',
        autor,
        tags: tags ? JSON.parse(tags) : [],
      });

      res.status(201).json(noticia);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }
}

// ── Projetos ──
const projetoRepo = new ProjetoRepositorio();

export class ProjetoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const status = validarEnum<StatusProjeto>(
        qs(req.query.status),
        ['ativo', 'concluido', 'planejado']
      );

      const categoria = validarEnum<CategoriaProjeto>(
        qs(req.query.categoria),
        ['habitacao', 'educacao', 'saude', 'cultura', 'assistencia', 'outros']
      );

      const destaque = qs(req.query.destaque);

      const projetos = await projetoRepo.listar({
        status,
        categoria,
        destaque: destaque === 'true' ? true : undefined,
      });

      res.json({ projetos, total: projetos.length });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}

// ── Galeria ──
const galeriaRepo = new GaleriaRepositorio();

export class GaleriaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const categoria = validarEnum<CategoriaGaleria>(
        qs(req.query.categoria),
        ['eventos', 'projetos', 'comunidade', 'institucional']
      );

      const destaque = qs(req.query.destaque);

      const fotos = await galeriaRepo.listar({
        categoria,
        destaque: destaque === 'true' ? true : undefined,
      });

      res.json({ fotos, total: fotos.length });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}

// ── Documentos ──
const documentoRepo = new DocumentoRepositorio();

export class DocumentoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const categoria = validarEnum<CategoriaDocumento>(
        qs(req.query.categoria),
        ['outros', 'estatuto', 'ata', 'relatorio', 'prestacao_contas', 'certificado']
      );

      const docs = await documentoRepo.listar({ categoria, publico: true });

      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}