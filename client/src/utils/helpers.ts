export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getImageUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  // In development Vite proxy handles /uploads, or fallback to absolute
  return pathOrUrl;
};

export const generateShareText = (memoryId: string, caption?: string, year?: number): string => {
  const url = `${window.location.origin}/memories/${memoryId}`;
  const yearText = year ? ` [वर्ष ${year}]` : '';
  const snippet = caption ? `"${caption.slice(0, 100)}${caption.length > 100 ? '...' : ''}"\n\n` : '';
  return `यादों में बसी दुर्गा पूजा ❤️\nकपूरिपुर की पावन दुर्गा पूजा स्मृति${yearText}:\n\n${snippet}देखिए इस खूबसूरत याद को:\n${url}`;
};
