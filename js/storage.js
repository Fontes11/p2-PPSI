// ── STORAGE EXTERNO DE IMAGENS ────────────────────────────────
// Configure aqui o endpoint e as credenciais do serviço de storage
// (ex: S3, Cloudinary, ImgBB, Supabase Storage, etc).
//
// O endpoint deve aceitar um POST multipart/form-data com o arquivo
// no campo "file" e responder em JSON com a URL pública da imagem.
export const STORAGE_CONFIG = {
  uploadUrl: '',   // ex: 'https://api.meuservico.com/upload'
  apiKey:    '',   // ex: 'minha-chave-secreta' (enviada como Bearer token, se preenchida)
};

// Envia o arquivo para o storage externo e retorna a URL pública da imagem.
export async function uploadImage(file) {
  if (!STORAGE_CONFIG.uploadUrl) {
    throw new Error('Storage de imagens não configurado.');
  }

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(STORAGE_CONFIG.uploadUrl, {
    method: 'POST',
    headers: STORAGE_CONFIG.apiKey ? { Authorization: `Bearer ${STORAGE_CONFIG.apiKey}` } : {},
    body: fd,
  });

  if (!res.ok) throw new Error('Falha ao enviar imagem para o storage.');

  const data = await res.json();
  return data.url || data.imageUrl || data.imagemUrl || data.secure_url || data.link;
}
