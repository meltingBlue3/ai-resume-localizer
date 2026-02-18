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
