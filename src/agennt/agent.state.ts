import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import {
  Location,
  LocationInterface,
} from 'src/lib/interface/location/location.interface';

export const TravelAgentState = Annotation.Root({
  // История сообщений: новые сообщения всегда дописываются в массив (concat)
  messages: Annotation<BaseMessage[]>({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),

  // Вытащенный из промпта бюджет: новая итерация просто заменяет старый
  userBudget: Annotation<number>({
    reducer: (state, update) => update,
    default: () => 0,
  }),

  // Вытащенные теги и хотелки пользователя
  wishes: Annotation<string[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),

  // Массив локаций, которые Краевед найдет в Prisma через pgvector
  proposedPlaces: Annotation<LocationInterface[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),

  // Флаг валидности бюджета (нужен для Финансиста)
  isBudgetValid: Annotation<boolean>({
    reducer: (state, update) => update,
    default: () => true,
  }),

  // Сгенерированный ИИ заголовок для чата
  chatTitle: Annotation<string>({
    reducer: (state, update) => update,
    default: () => '',
  }),

  // Блэклист
  rejectedKeywords: Annotation<string[]>({
    reducer: (state, update) => Array.from(new Set([...state, ...update])),
    default: () => [],
  }),

  // Счетчик итераций
  loopCount: Annotation<number>({
    reducer: (state, update) => update ?? state ?? 0,
    default: () => 0,
  }),

  requestedCount: Annotation<number>({
    reducer: (state, update) => (update > 0 ? update : state),
    default: () => 5,
  }),

  rejectedPlaceIds: Annotation<number[]>({
    reducer: (state, update) =>
      Array.from(new Set([...(state ?? []), ...(update ?? [])])),
    default: () => [],
  }),

  totalCost: Annotation<number>({
    reducer: (state, update) => update,
    default: () => 0,
  }),
});
