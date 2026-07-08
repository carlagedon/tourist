import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { TravelAgentState } from '../agent.state';
import { AIMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Узел-Логист (Logist Node)
 * Формирует красивый финальный ответ на основе собранных в стейте данных
 */
export async function logistNode(
  state: typeof TravelAgentState.State,
  model: ChatGoogleGenerativeAI,
) {
  try {
    const { proposedPlaces, userBudget, isBudgetValid, loopCount, totalCost } = state;

    const placesContext =
      proposedPlaces.length > 0
        ? proposedPlaces
            .map(
              (p, i) =>
                `${i + 1}. ${p.title} (${p.isFree ? 'Бесплатно' : p.priceValue + ' ₸'}) — ${p.shortContext}`,
            )
            .join('\n')
        : 'Подходящих мест в базе данных не найдено.';

    const budgetStatus = userBudget === 0
      ? 'Бюджет не указан — показываем все подходящие места.'
      : isBudgetValid
        ? `Бюджет соблюдён: итого ${totalCost} ₸ из ${userBudget} ₸.`
        : `ВНИМАНИЕ: бюджет превышен после ${loopCount} попыток оптимизации. Итого ${totalCost} ₸ при бюджете ${userBudget} ₸.`;

    const systemPrompt = `Ты — опытный гид-логист по курорту Боровое (Казахстан). 
Твоя задача — составить для туриста классный, живой ответ на основе локаций, которые отобрала наша система.

ДАННЫЕ ОТ НАШЕЙ СИСТЕМЫ:
- Выбранные места:
${placesContext}
- Статус бюджета: ${budgetStatus}

ЖЕСТКИЕ ПРАВИЛА:
1. Говори ТОЛЬКО про те места, которые переданы выше. Не выдумывай другие локации.
2. Если статус бюджета содержит "ВНИМАНИЕ: бюджет превышен" — вежливо предупреди туриста и предложи скорректировать бюджет или пожелания.
3. Если мест не найдено — посочувствуй и предложи попробовать с другими параметрами.
4. Отвечай дружелюбно, структурировано (используй эмодзи и списки), на языке последнего сообщения пользователя.`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage({ content: response.content })],
    };
  } catch (error) {
    console.error('Ошибка в работе logistNode:', error);
    return {
      messages: [
        new AIMessage({
          content: 'Извините, произошла техническая ошибка при сборке маршрута. Попробуйте перефразировать запрос.',
        }),
      ],
    };
  }
}