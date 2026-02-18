import { supabase } from '../supabaseClient';

const BUCKET_NAME = 'note-files';

const extensionFromMime = (mime: string): string | null => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/markdown': 'md',
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'application/json': 'json',
    'audio/mpeg': 'mp3',
    'video/mp4': 'mp4',
  };

  return map[mime] || null;
};

const getFileExtension = (file: File): string => {
  const nameParts = file.name.split('.');
  const fromName = nameParts.length > 1 ? nameParts.pop() : null;
  if (fromName && fromName.trim().length > 0) return fromName.toLowerCase();

  const fromMime = file.type ? extensionFromMime(file.type) : null;
  return fromMime || 'bin';
};

const generateUuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildUserPath = (userId: string, featureName: string, itemId: string, file: File): string => {
  const safeFeature = featureName.replace(/[^a-zA-Z0-9_-]/g, '-');
  const safeItemId = itemId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const extension = getFileExtension(file);
  const fileName = `${generateUuid()}.${extension}`;

  return `${userId}/${safeFeature}/${safeItemId}/${fileName}`;
};

export const storageService = {
  // Since bucket is private, we must use signed URLs
  async getSignedUrl(path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path; // Already a URL
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600); // 1 hour validity
      
    if (error) {
      console.error('Error getting signed URL:', error);
      return '';
    }
    return data.signedUrl;
  },

  async uploadFile(file: File, userId: string, folder: string, customName?: string): Promise<string> {
    // Sanitize filename and ensure uniqueness
    const fileName = customName || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const path = `${userId}/${folder}/${fileName}`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { 
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream'
      });

    if (error) throw error;
    return path;
  },

  async uploadUserFile(userId: string, featureName: string, itemId: string, file: File): Promise<string> {
    const path = buildUserPath(userId, featureName, itemId, file);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream'
      });

    if (error) throw error;
    return path;
  },

  async deleteFile(path: string): Promise<void> {
    if (!path || path.startsWith('http')) return;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
      
    if (error) console.error('Error deleting file:', error);
  },

  async deleteFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const validPaths = paths.filter(p => p && !p.startsWith('http'));
    if (!validPaths.length) return;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(validPaths);
      
    if (error) console.error('Error deleting files:', error);
  }
};