export const getFromStorage = (key, parseJSON = false) => {
  try {
    const item = localStorage.getItem(key);
    if (parseJSON && item) {
      return JSON.parse(item);
    }
    return item;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
};

export const setToStorage = (key, value, stringify = false) => {
  try {
    const valueToStore = stringify ? JSON.stringify(value) : value;
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error('Error writing to storage:', error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};