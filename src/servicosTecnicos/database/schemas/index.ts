import mongoose, { Schema } from 'mongoose';

// ── Usuario ──
export const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senhaHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  ativo: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Noticia ──
export const NoticiaSchema = new Schema({
  titulo: { type: String, required: true },
  subtitulo: String,
  conteudo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imagemUrl: String,
  imagemPublicId: String,
  categoria: { type: String, enum: ['noticias', 'eventos', 'projetos', 'comunicados'], default: 'noticias' },
  destaque: { type: Boolean, default: false },
  publicado: { type: Boolean, default: false },
  autor: String,
  tags: [String],
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

// ── Projeto ──
export const ProjetoSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  descricaoCompleta: String,
  imagemUrl: String,
  imagemPublicId: String,
  status: { type: String, enum: ['ativo', 'concluido', 'planejado'], default: 'ativo' },
  categoria: { type: String, enum: ['habitacao', 'educacao', 'saude', 'cultura', 'assistencia', 'outros'], default: 'outros' },
  beneficiados: Number,
  dataInicio: String,
  dataFim: String,
  destaque: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Galeria ──
export const GaleriaSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: String,
  imagemUrl: { type: String, required: true },
  imagemPublicId: { type: String, required: true },
  categoria: { type: String, enum: ['eventos', 'projetos', 'comunidade', 'institucional'], default: 'eventos' },
  destaque: { type: Boolean, default: false },
  ordem: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Documento ──
export const DocumentoSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: String,
  categoria: { type: String, enum: ['estatuto', 'ata', 'relatorio', 'prestacao_contas', 'certificado', 'outros'], default: 'outros' },
  arquivoUrl: { type: String, required: true },
  arquivoPublicId: { type: String, required: true },
  nomeArquivo: String,
  tamanho: { type: Number, default: 0 },
  publico: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Contato ──
export const ContatoSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: String,
  assunto: { type: String, required: true },
  mensagem: { type: String, required: true },
  lido: { type: Boolean, default: false },
  respondido: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Membro ──
export const MembroSchema = new Schema({
  nome: { type: String, required: true },
  cargo: { type: String, required: true },
  descricao: String,
  fotoUrl: String,
  fotoPublicId: String,
  email: String,
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

export const UsuarioModel = mongoose.model('Usuario', UsuarioSchema);
export const NoticiaModel = mongoose.model('Noticia', NoticiaSchema);
export const ProjetoModel = mongoose.model('Projeto', ProjetoSchema);
export const GaleriaModel = mongoose.model('Galeria', GaleriaSchema);
export const DocumentoModel = mongoose.model('Documento', DocumentoSchema);
export const ContatoModel = mongoose.model('Contato', ContatoSchema);
export const MembroModel = mongoose.model('Membro', MembroSchema);
