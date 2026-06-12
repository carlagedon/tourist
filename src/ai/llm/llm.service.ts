import { ChatOllama } from "@langchain/ollama";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LlmService {
  constructor(
    private readonly config: ConfigService
  ) {}

  getChatModel(): ChatOllama {
    const isProd = String(this.config.getOrThrow('IS_PROD')) === 'true';
    
    if (isProd) {
      return new ChatOllama({
        baseUrl: this.config.getOrThrow<string>('PROD_LLM_BASE_URL'),
        model: this.config.getOrThrow<string>('PROD_LLM_MODEL'),
        temperature: 0.2
      })
    } else {
      return new ChatOllama({
        baseUrl: this.config.getOrThrow<string>('OLLAMA_BASE_URL'),
        model: this.config.getOrThrow<string>('LOCAL_OLLAMA_CHAT_MODEL'),
        temperature: 0.2
      })
    }
  }
}