/**
 * Converts a Google Drive share link to a direct image URL
 * Input: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://drive.google.com/uc?export=view&id=FILE_ID
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  
  // Check if it's a Google Drive share link
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Check if it's already a direct link format
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }
  
  // Check for open?id= format
  const openIdMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) {
    const fileId = openIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets a safe image URL with fallback
 */
export function getSafeImageUrl(url: string | undefined, fallback: string = '/placeholder.jpg'): string {
  if (!url) return fallback;
  
  const convertedUrl = convertGoogleDriveUrl(url);
  return isValidImageUrl(convertedUrl) ? convertedUrl : fallback;
}
