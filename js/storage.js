// ── ARMAZENAMENTO EXTERNO DE IMAGENS (Cloudinary) ─────────────
export const CONFIG_ARMAZENAMENTO = {
  nomeNuvem:           'duy1qntos',
  predefinicaoUpload:  'ppsiupload',
};

// Envia o arquivo para o Cloudinary e retorna a URL pública da imagem.
export async function enviarImagem(arquivo) {
  const fd = new FormData();
  fd.append('file', arquivo);
  fd.append('upload_preset', CONFIG_ARMAZENAMENTO.predefinicaoUpload);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG_ARMAZENAMENTO.nomeNuvem}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  const dados = await res.json();

  if (!res.ok) {
    throw new Error(dados?.error?.message || 'Falha ao enviar imagem para o armazenamento.');
  }

  return dados.secure_url;
}
