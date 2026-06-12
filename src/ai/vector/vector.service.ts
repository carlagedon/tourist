import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/ollama';

@Injectable()
export class VectorService {
  private embeddings: OllamaEmbeddings;

  constructor(private readonly config: ConfigService) {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: this.config.getOrThrow<string>('OLLAMA_BASE_URL'),
      model: this.config.getOrThrow<string>('OLLAMA_EMBED_MODEL'),
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
  const response = await this.embeddings.embedQuery(text)
  return response;
  }
}
