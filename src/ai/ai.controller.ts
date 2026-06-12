import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { VectorService } from './vector/vector.service';
import { CreateAskGuide } from './dto/create_ask_guide.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() payload: {text: string}) {
    const result = await this.aiService.generate(payload.text)
    return result;
  }

  @Post('ask')
  async askGuide(@Body() dto: CreateAskGuide) {
    return this.aiService.askGuideAboutLocation(dto.locationId, dto.question)    
  }
}
