import { httpClient } from './base';
import { ApiResponse } from '../../types';

export interface BackgroundImage {
  filename: string;
  display_name: string;
}

export interface BackgroundListData {
  backgrounds: BackgroundImage[];
}

export interface BackgroundUploadData {
  filename: string;
  display_name: string;
}

export const backgroundsApi = {
  getBackgrounds: async (): Promise<ApiResponse<BackgroundListData>> => {
    return httpClient.get<BackgroundListData>('/backgrounds');
  },

  uploadBackground: async (file: File): Promise<ApiResponse<BackgroundUploadData>> => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<BackgroundUploadData>('/backgrounds/upload', formData);
  },
};
