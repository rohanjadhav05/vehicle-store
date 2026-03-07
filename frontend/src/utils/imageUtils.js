export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url || !url.trim()) {
      resolve(true);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
