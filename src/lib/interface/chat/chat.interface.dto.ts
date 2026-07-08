import { LocationInterface } from "../location/location.interface";

export interface ChatResponseDto {
  /** Финальный текст ответа от ИИ (Логиста) */
  replyText: string;
  
  /** Сгенерированное название чата */
  chatTitle: string;
  
  /** Массив локаций для отрисовки карточек и пинов на карте */
  locations: LocationInterface[];
}