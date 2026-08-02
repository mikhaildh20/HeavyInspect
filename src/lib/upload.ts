export async function uploadFile(base64Data: string, folder: string = 'general'): Promise<string> {
  const res = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!res) throw new Error('Invalid base64 data');

  const mimeType = res[1];
  const base64 = res[2];
  const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const file = new File([blob], `upload.${ext}`, { type: mimeType });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Upload failed');
  }

  const { url } = await response.json();
  return url;
}
