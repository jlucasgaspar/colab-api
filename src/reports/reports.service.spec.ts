import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AiService } from '../ai/ai.service';
import { DATABASE_TOKEN } from '../db/database.module';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockDb: any;
  let mockAiService: Partial<Record<keyof AiService, jest.Mock>>;

  beforeEach(async () => {
    mockAiService = {
      triageReport: jest.fn().mockResolvedValue({
        category: 'Manutenção de Vias',
        priority: 'ALTA',
        technicalSummary: 'Dano na via pública.',
      }),
    };

    const mockReturning = jest.fn().mockResolvedValue([
      {
        id: 'report-1',
        title: 'Buraco',
        description: 'Buraco na rua',
        location: 'Rua A',
        category: 'Manutenção de Vias',
        priority: 'ALTA',
        technicalSummary: 'Dano na via pública.',
        status: 'NA_FILA',
        userId: 'user-1',
      },
    ]);

    const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
    const mockInsert = jest.fn().mockReturnValue({ values: mockValues });

    const mockOrderBy = jest.fn().mockResolvedValue([]);
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
    const mockFrom = jest.fn().mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

    const mockUpdateReturning = jest.fn().mockResolvedValue([
      { id: 'report-1', status: 'EM_TRIAGEM' },
    ]);
    const mockUpdateWhere = jest.fn().mockReturnValue({
      returning: mockUpdateReturning,
    });
    const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
    const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

    mockDb = {
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a report with AI triage', async () => {
    const result = await service.create(
      {
        title: 'Buraco',
        description: 'Buraco na rua',
        location: 'Rua A',
      },
      'user-1',
    );

    expect(mockAiService.triageReport).toHaveBeenCalledWith('Buraco', 'Buraco na rua');
    expect(result.category).toBe('Manutenção de Vias');
    expect(result.status).toBe('NA_FILA');
  });
});
