export interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
}

export interface GenerateImageResponse {
  images: GeneratedImage[];
  error?: string;
}
