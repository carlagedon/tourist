import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { TravelAgentState } from './agent.state';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { extractorNode } from './nodes/extractor.node';
import { LocationService } from 'src/location/location.service';
import { historianNode } from './nodes/historian.node';
import { financierNode } from './nodes/financier.node';
import { VectorService } from 'src/ai/vector/vector.service';
import { logistNode } from './nodes/logist.node';
import { MessageRole } from '@prisma/client';
import { ChatResponseDto } from 'src/lib/interface/chat/chat.interface.dto';
import { RouteService } from 'src/route/route.service';

@Injectable()
export class AgenntService implements OnModuleInit {
  private graph;
  private model: ChatGoogleGenerativeAI;
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly location: LocationService,
    private readonly vector: VectorService,
    private readonly route: RouteService,
  ) {}

  onModuleInit() {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-3.1-flash-lite',
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
      temperature: 0.1,
      maxOutputTokens: 4096,
    });

    this.initializeGraph();
  }

  /**
   * Сборка архитектуры и компиляция графа
   */
  private initializeGraph() {
    const workflow = new StateGraph(TravelAgentState)
      // Регестрация узлов
      .addNode('extractor', (state) => extractorNode(state, this.model))
      .addNode('historian', (state) =>
        historianNode(state, this.location, this.vector),
      )
      .addNode('financier', financierNode)
      .addNode('logist', (state) => logistNode(state, this.model))

      // Ребра - связи или "стрелочки" или графы
      .addEdge(START, 'extractor')
      .addEdge('extractor', 'historian')
      .addEdge('historian', 'financier')
      .addConditionalEdges(
        'financier',
        (state) => {
          const { isBudgetValid, loopCount } = state;

          if (isBudgetValid) {
            console.log('[Router] Бюджет валиден. Идем на выход.');
            return 'to_logist';
          }
          if (loopCount >= 4) {
            console.log(
              '[Router] Бюджет невалиден. Достигнут лимит попыток. Завершаем.',
            );
            return 'to_logist';
          }

          console.log(
            '[Router] Бюджет превышен! Отправляем граф назад к Историку на перерасчет.',
          );
          return 'back_to_historian';
        },
        {
          to_logist: 'logist',
          back_to_historian: 'historian',
        },
      )
      .addEdge('logist', END);

    this.graph = workflow.compile({ checkpointer: new MemorySaver() });
  }

  /**
   * Точка входа: Сюда Контроллер будет передавать сообщения пользователя
   * @param chatId - ID сессии чата (UUID), он же thread_id для памяти LangGraph
   * @param userText - Текст, который написал турист
   */
  async runChat(chatId: string, userText: string) {
    try {
      const config = { configurable: { thread_id: chatId } };

      const currentChat = await this.prisma.chatSession.findUnique({
        where: { id: chatId },
      });
      if (!currentChat) {
        throw new Error(`Чат-сессия ${chatId} не найдена в базе данных.`);
      }

      await this.prisma.message.create({
        data: { chatId, role: MessageRole.USER, text: userText },
      });

      const finalState: typeof TravelAgentState.State = await this.graph.invoke(
        {
          messages: [new HumanMessage(userText)],
          loopCount: 0,
        },
        config,
      );

      const lastMessage = finalState.messages.at(-1);
      const replyText =
        (lastMessage?.content as string) ??
        'Извините, произошла системная ошибка';

      await this.prisma.message.create({
        data: { chatId, role: MessageRole.ASSISTANT, text: replyText },
      });

      const savedRoute = await this.route.saveFromAgent(
        chatId,
        finalState.proposedPlaces,
        finalState.chatTitle || 'Новый чат',
        'Кокшетау',
        finalState.totalCost
      );

      const response: ChatResponseDto = {
        replyText: replyText,
        chatTitle: finalState.chatTitle || 'Новый чат',
        locations: finalState.proposedPlaces,
      };

      return response;
    } catch (error) {
      console.error('[runChat] Ошибка:', error);
      throw error;
    }
  }
}
