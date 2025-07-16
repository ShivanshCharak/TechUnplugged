export const createSlug = (title: string, id: string): string => {
  if (!title) return id;
  return `${id}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
};

export const calculateWordCount = (content: string): number => {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const formatDate = (date: string | undefined): string => {
  if (!date) return new Date().toLocaleDateString();
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return date;
  }
};

export const createExcerpt = (content: string, maxLength: number = 150): string => {
  if (!content) return "";
  
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + "...";
};

export const getReadingTime = (content: string): string => {
  const words = calculateWordCount(content);
  const minutes = Math.ceil(words / 200); // Average reading speed
  return `${minutes} min read`;
};