import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const VALID_CATEGORIES = [
  'Iluminação Pública',
  'Manutenção de Vias',
  'Saneamento',
  'Limpeza Urbana',
  'Arborização',
  'Transporte Público',
  'Sinalização de Trânsito',
  'Acessibilidade',
  'Poluição Sonora',
  'Drenagem',
  'Outros',
] as const;

const aiResponseSchema = z.object({
  category: z.string(),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA']),
  technicalSummary: z.string(),
});

export type AiTriageResult = z.infer<typeof aiResponseSchema>;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.config.getOrThrow<string>('GEMINI_API_KEY'),
    );
  }

  async triageReport(title: string, description: string): Promise<AiTriageResult> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = this.buildPrompt(title, description);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);
        return aiResponseSchema.parse(parsed);
      } catch (error) {
        this.logger.warn(`AI triage attempt ${attempt + 1} failed: ${error}`);
        if (attempt === 2) {
          this.logger.error('All AI triage attempts failed, using fallback');
          return this.fallback(title, description);
        }
      }
    }

    return this.fallback(title, description);
  }

  private buildPrompt(title: string, description: string): string {
    return `Você é um sistema de triagem urbana de uma prefeitura brasileira.
Analise a solicitação do cidadão e retorne SOMENTE um JSON com os seguintes campos:

- "category": uma das categorias válidas: ${VALID_CATEGORIES.join(', ')}
- "priority": classificação da gravidade, sendo "BAIXA", "MEDIA" ou "ALTA"
- "technicalSummary": reescrita formal e impessoal do problema para o gestor público (máximo 3 frases)

Solicitação do cidadão:
Título: ${title}
Descrição: ${description}

Responda SOMENTE com o JSON, sem explicações ou markdown.`;
  }

  private fallback(title: string, description: string): AiTriageResult {
    return {
      category: 'Outros',
      priority: 'MEDIA',
      technicalSummary: `Solicitação recebida: ${title}. ${description}`.slice(0, 200),
    };
  }
}
