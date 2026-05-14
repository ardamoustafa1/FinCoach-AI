/**
 * FinCoach AI - Güvenlik Yardımcıları
 * Kullanıcı girdilerini temizlemek ve XSS/Injection saldırılarını önlemek için kullanılır.
 */

export function sanitize(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

/**
 * HTML içeriği render edilirken tehlikeli olabilecek script ve iframe etiketlerini temizler.
 * React-Markdown zaten çoğu XSS'i engeller ama bu ek bir korumadır.
 */
export function cleanHtml(html) {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gmi, '')
    .replace(/on\w+="[^"]*"/gmi, '') // onmouseover, onclick gibi inline handlerları siler
    .trim();
}
