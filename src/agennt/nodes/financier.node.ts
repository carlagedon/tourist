/**
 * Узел-Финансист (Financier Node)
 * Считает общую стоимость выбранных локаций и проверяет, укладываемся ли мы в бюджет.
 */
import { TravelAgentState } from '../agent.state';

export async function financierNode(
  state: typeof TravelAgentState.State,
): Promise<Partial<typeof TravelAgentState.State>> {
  try {
    const { proposedPlaces, userBudget, loopCount } = state;

    if (userBudget === 0 || proposedPlaces.length === 0) {
      return {
        isBudgetValid: true,
      };
    }
    const totalCost = proposedPlaces.reduce((sum, place) => {
      // Если место бесплатное, прибавляем 0
      return sum + (place.isFree ? 0 : place.priceValue);
    }, 0);
    const isValid = totalCost <= userBudget;

    return {
      isBudgetValid: isValid,
      loopCount: loopCount + 1,
      totalCost,
    };
  } catch (error) {
    console.error('Ошибка в работе financierNode:', error);
    return {
      isBudgetValid: false,
      loopCount: (state.loopCount ?? 0) + 1,
      totalCost: 0,
    };
  }
}
