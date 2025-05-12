export const generateTrackingId = (): string => {
  return 'TRK-' + 
    Date.now().toString(36).toUpperCase() + 
    Math.random().toString(36).substring(2, 6).toUpperCase();
};