import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize the Supabase client only if the credentials exist
// This prevents crashes if the user hasn't set up Supabase yet
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Uploads a file to a specific Supabase storage bucket and path
 * @param bucket The name of the Supabase storage bucket (e.g., 'user-documents')
 * @param path The path inside the bucket (e.g., 'user_id/resume/filename.pdf')
 * @param file The File object from an input element
 * @returns The public URL of the uploaded file, or null if it failed
 */
export async function uploadFileToSupabase(bucket: string, path: string, file: File): Promise<string | null> {
  if (!supabase) {
    console.error("Supabase client not initialized. Check your environment variables.");
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if it already exists
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("Failed to upload to Supabase:", err);
    return null;
  }
}
