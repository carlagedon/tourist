import { Injectable, NotFoundException } from '@nestjs/common';
import { VectorService } from './vector/vector.service';
import { LlmService } from './llm/llm.service';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { PrismaService } from 'src/db/prisma.service';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

@Injectable()
export class AiService {
  constructor(
    private readonly vector: VectorService,
    private readonly llm: LlmService,
    // private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // Первая генерация
  async generate(legend: string) {
    const model = this.llm.getChatModel();

    // Шаблон промта
    const promtTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Ты — ИИ-экскурсовод, который прямо сейчас стоит с туристом на локации "{locationTitle}".
        Отвечай на вопросы туриста вежливо и кратко, как живой гид.
        Для ответа используй ТОЛЬКО предоставленный ниже контекст. 
        Если в контексте нет ответа на вопрос, вежливо скажи: "Хм, об этом история умалчивает. Напиши мне в общий чат-ассистент, возможно там я смогу найти ответ!".
        Не придумывай факты и цены из головы.
        
        КОНТЕКСТ ДЛЯ ОТВЕТА:
        {context}`,
      ],
      [
        'user',
        `Вот место "{title}":\n{context}\n\nРасскажи из этого красивую легенду.`,
      ],
    ]);

    const formatedPromt = await promtTemplate.formatMessages({
      context: legend,
      locationTitle: 'Бурабай',
      title: 'Бурабай',
    });

    const response = await model.invoke(formatedPromt);
    console.log(response);
    return response.content as string;
  }

  async askGuideAboutLocation(
    locationId: number,
    question: string,
    history: { role: 'user' | 'assistant'; context: string }[] = [],
  ): Promise<string> {
    interface LocationContextResult {
      historyContext: string;
    }
    const location = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      throw new NotFoundException(`Локация с ID ${locationId} не найдена`);
    }

    const queryVector = await this.vector.getEmbedding(question);

    const vectorString = `[${queryVector.join(',')}]`;
    const matchedContext = await this.prisma.$queryRaw<LocationContextResult[]>`
      SELECT "historyContext"
      FROM "Location" 
      WHERE id = ${locationId}
      ORDER BY embedding <=> ${vectorString}::vector ASC
      LIMIT 1;
    `;

    const contextText =
      matchedContext.length && matchedContext[0].historyContext
        ? matchedContext[0].historyContext
        : '';
    const limitedHistory = history.slice(-4);

    const parsedHistory = limitedHistory.map((msg) => {
      return msg.role === 'user'
        ? new HumanMessage(msg.context)
        : new AIMessage(msg.context);
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Ты — ИИ-экскурсовод на локации "{locationTitle}". Отвечай туристу кратко и строго по контексту.\n\nКОНТЕКСТ:\n{context}',
      ],
      new MessagesPlaceholder('chat_history'),
      ['user', '{question}'],
    ]);

    const model = this.llm.getChatModel();
    const chain = promptTemplate.pipe(model);

    const response = await chain.invoke({
      locationTitle: location.title,
      context: contextText,
      chat_history: parsedHistory,
      question: question,
    });

    return response.content as string;
  }
}
