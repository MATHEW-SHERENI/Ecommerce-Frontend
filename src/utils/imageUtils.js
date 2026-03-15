export const getImageUrl = (image) => {
  const backendBaseUrl = import.meta.env.VITE_BACK_END_URL || 'http://localhost:5000';
  const placeholder = 'https://placehold.co/300x200?text=No+Image';

  if (!image || image === 'default.png') {
    return placeholder;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    try {
      const parsedUrl = new URL(image);

      if (parsedUrl.pathname.startsWith('/images/')) {
        return `${backendBaseUrl}${parsedUrl.pathname}`;
      }

      return image;
    } catch {
      return placeholder;
    }
  }

  return `${backendBaseUrl}/images/${image}`;
};
