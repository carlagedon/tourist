/**
 * Преобразует массив чисел (эмбеддинг) от ИИ-модели 
 * в строку формата '[x,y,z...]', которую понимает расширение pgvector в PostgreSQL.
 */
export function toPgVectorString(embedding: number[]): string {
  if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Невалидный эмбеддинг: ожидался массив чисел.');
  }
  
  return `[${embedding.join(',')}]`;
}