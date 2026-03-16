export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface StorageService {
  upload(buffer: Buffer, key: string, contentType: string): Promise<string>;
}
