export const formatDate = (date, format = 'MMMM DD, YYYY') => {
  if (!date) return 'Invalid Date';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    if (format === 'MM/DD/YYYY') {
      return dateObj.toLocaleDateString('en-US');
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  const value = amount || 0;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Return exactly maxLength characters with ellipsis
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};