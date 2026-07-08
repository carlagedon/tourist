import z from 'zod/v3';
import { TravelAgentState } from '../agent.state';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LocationTag } from '@prisma/client';

// Описание JSON схемы
const extractionSchema = z.object({
  userBudget: z
    .number()
    .describe('Бюджет поездки в тенге (число). Если не указан, верни 0.'),
  wishes: z
    .array(z.enum(Object.values(LocationTag) as [string, ...string[]]))
    .describe('Массив тегов-пожеланий на основе категорий мест.'),
  rejectedPlaceIds: z
    .array(z.number())
    .describe(
      'Массив ID мест из списка "ТЕКУЩИЕ ПРЕДЛОЖЕННЫЕ МЕСТА" ниже, которые турист просит убрать или заменить из уже показанного маршрута. Сопоставляй по смыслу — пользователь может не называть место дословно.',
    ),
  chatTitle: z
    .string()
    .describe(
      'Короткое красивое название для этого чата (до 4 слов) на основе контекста. Если это НЕ первое сообщение, верни пустую строку "".',
    ),
  rejectedKeywords: z
    .array(z.string())
    .describe(
      'Массив слов или названий, которые турист ПРЯМО просит убрать (например, "квадроциклы", "кафе Лесное").',
    ),
  requestedCount: z
    .number()
    .describe(
      'Сколько конкретно мест просит показать турист (например, "дай 3 места" -> 3). Если не указывает, верни 0.',
    ),
});

/**
 * Узел-Парсер (Extractor Node)
 * @param state Текущее состояние графа
 * @param model Экземпляр модели Gemini, переданный из сервиса
 */
export async function extractorNode(
  state: typeof TravelAgentState.State,
  model: ChatGoogleGenerativeAI,
): Promise<Partial<typeof TravelAgentState.State>> {
  // Определяем, первое ли это сообщение в чате
  const isFirstMessage = state.messages.length <= 1;
  const lastUserMessage = state.messages[state.messages.length - 1]
    .content as string;

  // Список мест, показанных туристу в прошлом ответе — даём модели с ID,
  // чтобы она могла сослаться на конкретное место по смыслу
  const placesListForPrompt =
    state.proposedPlaces.length > 0
      ? state.proposedPlaces.map((p) => `ID ${p.id}: ${p.title}`).join('\n')
      : 'Список пуст (это первое сообщение или маршрут ещё не составлен).';

  const systemPrompt = `Ты — высокоточный ИИ-парсер параметров для путешествия в Боровое (Казахстан). 
  Твоя задача — проанализировать последнее сообщение туриста и обновить параметры поездки.
  
  ТЕКУЩИЕ ПАРАМЕТРЫ (из прошлых сообщений):
  - Сохраненный бюджет: ${state.userBudget} ₸
  - Сохраненные теги: [${state.wishes.join(', ')}]

  ТЕКУЩИЕ ПРЕДЛОЖЕННЫЕ МЕСТА (показаны туристу в прошлом ответе):
  ${placesListForPrompt}
  
  ЖЕСТКАЯ ИНСТРУКЦИЯ ПО ТЕГАМ (wishes):
  1. НАКАПЛИВАЙ ТЕГИ. Если турист пишет "а еще", "потом", "также" или просто добавляет новые идеи — ОЯБЗАТЕЛЬНО верни массив, где будут [СТАРЫЕ ТЕГИ + НОВЫЕ ТЕГИ].
  2. НИКОГДА не удаляй старые теги, если турист ПРЯМО не попросил об этом (например, слова "мы передумали", "отменяется", "не хотим"). Свидание с девушкой и поездка с родителями могут быть в одном маршруте!

  ИНСТРУКЦИЯ ПО БЮДЖЕТУ:
  - Если бюджет изменился, верни новую сумму. Если турист не упоминал деньги в последнем сообщении, всегда возвращай старую сумму (${state.userBudget}).
  
  ИНСТРУКЦИЯ ПО ОТКЛОНЁННЫМ МЕСТАМ:
    - ШАГ 1: Проверь — есть ли упомянутое туристом место в списке "ТЕКУЩИЕ ПРЕДЛОЖЕННЫЕ МЕСТА" выше?
    - ЕСЛИ ДА — верни его ID в rejectedPlaceIds (например "не хочу на квадроциклах" → найди в списке "ID 6: Прокат квадроциклов «Экстрим»" → rejectedPlaceIds: [6]).
    - ЕСЛИ НЕТ (места нет в текущем списке, это общая категория на будущее) — положи слово в rejectedKeywords.
    - НЕ дублируй: если ID уже в rejectedPlaceIds, не добавляй то же самое слово в rejectedKeywords.

  ПРАВИЛО ДЛЯ НАЗВАНИЯ ЧАТА (chatTitle):
  ${
    isFirstMessage
      ? 'Это первое сообщение! Придумай яркое, емкое название для чата.'
      : 'Это повторное сообщение. Верни пустую строку "".'
  }`;

  const structuredModel = model.withStructuredOutput(extractionSchema, {
    name: 'extractor',
  });

  try {
    const result = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(lastUserMessage),
    ]);

    console.log(
      '[Extractor] rejectedKeywords:',
      result.rejectedKeywords,
      '| rejectedPlaceIds:',
      result.rejectedPlaceIds,
    );

    return {
      userBudget: result.userBudget > 0 ? result.userBudget : state.userBudget,
      wishes: result.wishes.length > 0 ? result.wishes : state.wishes,
      rejectedKeywords: result.rejectedKeywords ?? [],
      chatTitle: isFirstMessage ? result.chatTitle : state.chatTitle,
      rejectedPlaceIds: result.rejectedPlaceIds ?? [],
      requestedCount:
        result.requestedCount > 0
          ? result.requestedCount
          : state.requestedCount,
    };
  } catch (error) {
    console.error('Ошибка парсинга в ExtractorNode:', error);
    return {
      userBudget: 0,
      wishes: [],
      chatTitle: '',
    };
  }
}
