import type { CnResumeData, JpResumeData, UploadAndExtractResponse } from '../types/resume';

const API_BASE = '/api';

export async function uploadAndExtract(file: File): Promise<UploadAndExtractResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload-and-extract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? `Upload failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<UploadAndExtractResponse>;
}

export async function translateResume(cnResume: CnResumeData): Promise<JpResumeData> {
  const response = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cn_resume: cnResume }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? `Translation failed (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.jp_resume as JpResumeData;
}

export async function previewDocument(
  docType: 'rirekisho' | 'shokumukeirekisho',
  jpResume: JpResumeData,
  photoBase64?: string | null,
): Promise<string> {
  const response = await fetch(`${API_BASE}/preview/${docType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jp_resume: jpResume,
      photo_base64: photoBase64 ?? null,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? `Preview failed (${response.status})`);
  }
  const data = await response.json();
  return data.html as string;
}

export async function downloadPdf(
  docType: 'rirekisho' | 'shokumukeirekisho',
  jpResume: JpResumeData,
  photoBase64?: string | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/download/${docType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jp_resume: jpResume,
      photo_base64: photoBase64 ?? null,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? `Download failed (${response.status})`);
  }
  return response.blob();
}
