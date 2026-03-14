import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerateContent,
    }),
  })),
}));

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'fake-api-key' },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse valid AI response', async () => {
    const mockResponse = {
      category: 'Manutenção de Vias',
      priority: 'ALTA',
      technicalSummary:
        'Identificado dano estrutural na via pública, com risco de acidentes a pedestres.',
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(mockResponse) },
    });

    const result = await service.triageReport(
      'Buraco na rua',
      'Tem um buraco enorme na frente da minha casa',
    );

    expect(result.category).toBe('Manutenção de Vias');
    expect(result.priority).toBe('ALTA');
    expect(result.technicalSummary).toBeDefined();
  });

  it('should fallback on invalid AI response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'invalid json' },
    });

    const result = await service.triageReport(
      'Problema de iluminação',
      'A luz do poste apagou',
    );

    expect(result.category).toBe('Outros');
    expect(result.priority).toBe('MEDIA');
  });
});
