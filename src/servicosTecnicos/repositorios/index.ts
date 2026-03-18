import {
  UsuarioModel, NoticiaModel, ProjetoModel,
  GaleriaModel, DocumentoModel, ContatoModel, MembroModel
} from '@servicosTecnicos/database/schemas';

import {
  IUsuario, INoticia, IProjeto,
  IGaleria, IDocumento, IContato, IMembro
} from '@servicosTecnicos/database/schemas';

// ✅ função corrigida (sem conflito com map)
function mapear<T>(doc: T & { _id: any; toObject: () => any }) {
  const base = { ...doc.toObject(), id: doc._id.toString() };
  delete base._id;
  delete base.__v;
  return base;
}

//
// ─────────── USUÁRIO ───────────
//
export class UsuarioRepositorio {
  async criar(dados: Partial<IUsuario>) {
    return mapear(await UsuarioModel.create(dados));
  }

  async buscarPorEmail(email: string) {
    const d = await UsuarioModel.findOne({ email });
    return d ? mapear(d) : null;
  }

  async buscarPorId(id: string) {
    const d = await UsuarioModel.findById(id);
    return d ? mapear(d) : null;
  }

  async listar() {
    const docs = await UsuarioModel.find();
    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IUsuario>) {
    const d = await UsuarioModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }
}

//
// ─────────── NOTÍCIA ───────────
//
export class NoticiaRepositorio {
  async criar(dados: Partial<INoticia>) {
    return mapear(await NoticiaModel.create(dados));
  }

  async buscarPorId(id: string) {
    const d = await NoticiaModel.findById(id);
    return d ? mapear(d) : null;
  }

  async buscarPorSlug(slug: string) {
    const d = await NoticiaModel.findOne({ slug });
    return d ? mapear(d) : null;
  }

  async listar(filtros: Partial<INoticia> = {}, pagina = 1, limite = 10) {
    const query: any = {};

    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publicado !== undefined) query.publicado = filtros.publicado;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;

    const skip = (pagina - 1) * limite;

    const [noticias, total] = await Promise.all([
      NoticiaModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      NoticiaModel.countDocuments(query),
    ]);

    return {
      noticias: noticias.map(doc => mapear(doc)),
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async atualizar(id: string, dados: Partial<INoticia>) {
    const d = await NoticiaModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await NoticiaModel.findByIdAndDelete(id);
  }
}

//
// ─────────── PROJETO ───────────
//
export class ProjetoRepositorio {
  async criar(dados: Partial<IProjeto>) {
    return mapear(await ProjetoModel.create(dados));
  }

  async buscarPorId(id: string) {
    const d = await ProjetoModel.findById(id);
    return d ? mapear(d) : null;
  }

  async listar(filtros: Partial<IProjeto> = {}) {
    const query: any = {};

    if (filtros.status) query.status = filtros.status;
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;

    const docs = await ProjetoModel.find(query).sort({ criadoEm: -1 });

    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IProjeto>) {
    const d = await ProjetoModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await ProjetoModel.findByIdAndDelete(id);
  }
}

//
// ─────────── GALERIA ───────────
//
export class GaleriaRepositorio {
  async criar(dados: Partial<IGaleria>) {
    return mapear(await GaleriaModel.create(dados));
  }

  async buscarPorId(id: string) {
    const d = await GaleriaModel.findById(id);
    return d ? mapear(d) : null;
  }

  async listar(filtros: Partial<IGaleria> = {}) {
    const query: any = {};

    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;

    const docs = await GaleriaModel.find(query).sort({ ordem: 1, criadoEm: -1 });

    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IGaleria>) {
    const d = await GaleriaModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await GaleriaModel.findByIdAndDelete(id);
  }
}

//
// ─────────── DOCUMENTO ───────────
//
export class DocumentoRepositorio {
  async criar(dados: Partial<IDocumento>) {
    return mapear(await DocumentoModel.create(dados));
  }

  async buscarPorId(id: string) {
    const d = await DocumentoModel.findById(id);
    return d ? mapear(d) : null;
  }

  async listar(filtros: Partial<IDocumento> = {}) {
    const query: any = {};

    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publico !== undefined) query.publico = filtros.publico;

    const docs = await DocumentoModel.find(query).sort({ criadoEm: -1 });

    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IDocumento>) {
    const d = await DocumentoModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await DocumentoModel.findByIdAndDelete(id);
  }
}

//
// ─────────── CONTATO ───────────
//
export class ContatoRepositorio {
  async criar(dados: Partial<IContato>) {
    return mapear(await ContatoModel.create(dados));
  }

  async listar(filtros: Partial<IContato> = {}) {
    const query: any = {};

    if (filtros.lido !== undefined) query.lido = filtros.lido;

    const docs = await ContatoModel.find(query).sort({ criadoEm: -1 });

    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IContato>) {
    const d = await ContatoModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await ContatoModel.findByIdAndDelete(id);
  }
}

//
// ─────────── MEMBRO ───────────
//
export class MembroRepositorio {
  async criar(dados: Partial<IMembro>) {
    return mapear(await MembroModel.create(dados));
  }

  async buscarPorId(id: string) {
    const d = await MembroModel.findById(id);
    return d ? mapear(d) : null;
  }

  async listar(filtros: Partial<IMembro> = {}) {
    const query: any = {};

    if (filtros.ativo !== undefined) query.ativo = filtros.ativo;

    const docs = await MembroModel.find(query).sort({ ordem: 1 });

    return docs.map(doc => mapear(doc));
  }

  async atualizar(id: string, dados: Partial<IMembro>) {
    const d = await MembroModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return d ? mapear(d) : null;
  }

  async deletar(id: string) {
    await MembroModel.findByIdAndDelete(id);
  }
}