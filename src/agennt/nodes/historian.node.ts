import { TravelAgentState } from '../agent.state';
import { LocationService } from 'src/location/location.service';
import { VectorService } from 'src/ai/vector/vector.service';
import { toPgVectorString } from 'src/lib/utils/embedding_string';
import { LocationInterface } from 'src/lib/interface/location/location.interface';

export async function historianNode(
  state: typeof TravelAgentState.State,
  location: LocationService,
  vector: VectorService,
): Promise<Partial<typeof TravelAgentState.State>> {
  console.log('[Historian] rejectedKeywords:', state.rejectedKeywords);
  console.log('[Historian] rejectedPlaceIds:', state.rejectedPlaceIds);
  console.log('[Historian] loopCount:', state.loopCount);

  try {
    // Достаем requestedCount
    const {
      userBudget,
      rejectedKeywords,
      messages,
      loopCount = 0,
      requestedCount = 5,
      rejectedPlaceIds,
    } = state;

    // Высчитываем лимит мест
    let itemsLimit = requestedCount;
    if (loopCount > 0) {
      itemsLimit = Math.max(1, requestedCount - loopCount);
    }

    const dbFetchLimit = Math.max(10, itemsLimit * 3);
    console.log(
      `[Historian+AI] Запрашиваем из БД пул из ${dbFetchLimit} мест...`,
    );

    // Формируем векторный запрос
    let searchQuery = messages[messages.length - 1].content as string;
    if (loopCount > 0) {
      searchQuery = `${searchQuery}, найди альтернативы дешевле, бесплатные места`;
      console.log(
        `[Historian+AI] Повторный круг. Ищем дешевые альтернативы...`,
      );
    }

    console.log(
      `[Historian+AI] Отправляем запрос в локальную модель bge-m3...`,
    );
    const queryVector = await vector.getEmbedding(searchQuery);
    const vectorString = toPgVectorString(queryVector);

    // Считаем лимит по деньгам для базы данных
    let maxAllowedPrice = userBudget > 0 ? userBudget : 9999999;
    if (loopCount > 0) {
      maxAllowedPrice = userBudget * 0.5;
    }

    // Запрашиваем базу
    const nearestLocations = await location.nearestLocation(
      vectorString,
      maxAllowedPrice,
      dbFetchLimit,
    );

    // Фильтрация по Блэклисту
    const filteredLocations = nearestLocations.filter((place) => {
      // 1. Точное совпадение по ID — то, что турист явно отклонил из показанного списка
      if (rejectedPlaceIds && rejectedPlaceIds.includes(place.id)) {
        console.log(
          `[Historian+AI] Блэклист (ID) заблокировал место: ${place.title} (id=${place.id})`,
        );
        return false;
      }

      // Fallback по ключевым словам — для категорий, которых не было в прошлом списке
      if (rejectedKeywords && rejectedKeywords.length > 0) {
        const isRejected = rejectedKeywords.some((keyword) => {
          const lowerKeyword = keyword.toLowerCase();
          return (
            place.title.toLowerCase().includes(lowerKeyword) ||
            place.shortContext.toLowerCase().includes(lowerKeyword) ||
            place.loreContext.toLowerCase().includes(lowerKeyword)
          );
        });

        if (isRejected) {
          console.log(
            `[Historian+AI] Блэклист (keyword) заблокировал место: ${place.title}`,
          );
          return false;
        }
      }

      return true;
    });

    // Возвращаем жадный алгоритм, чтобы отсечь лишние места и посчитать сумму
    const finalPlaces: LocationInterface[] = [];
    let currentTotal = 0;

    for (const place of filteredLocations) {
      const price = place.isFree ? 0 : place.priceValue;

      const fitsInBudget =
        userBudget === 0 || currentTotal + price <= userBudget;
      if (fitsInBudget) {
        finalPlaces.push(place);
        currentTotal += price;
      }

      if (finalPlaces.length >= itemsLimit) {
        break;
      }
    }

    console.log(
      `[Historian+AI] Отобрано мест: ${finalPlaces.length}. Итоговая сумма: ${currentTotal} ₸`,
    );

    return {
      proposedPlaces: finalPlaces,
    };
  } catch (error) {
    console.error('Ошибка в работе historianNode:', error);
    return { proposedPlaces: [] };
  }
}
