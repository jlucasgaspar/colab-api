import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../db/database.module';
import { Database } from '../db';
import { reports } from '../db/schema';
import { AiService } from '../ai/ai.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DATABASE_TOKEN) private db: Database,
    private aiService: AiService,
  ) {}

  async create(dto: CreateReportDto, userId: string) {
    const triage = await this.aiService.triageReport(dto.title, dto.description);

    const result = await this.db
      .insert(reports)
      .values({
        title: dto.title,
        description: dto.description,
        location: dto.location,
        imageUrl: dto.imageUrl ?? null,
        category: triage.category,
        priority: triage.priority,
        technicalSummary: triage.technicalSummary,
        userId,
      })
      .returning();

    return result[0];
  }

  async findMyReports(userId: string) {
    return this.db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async findAll() {
    return this.db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async updateStatus(
    id: string,
    status: 'NA_FILA' | 'EM_TRIAGEM' | 'EM_PROGRESSO' | 'CONCLUIDO' | 'NEGADO',
  ) {
    const result = await this.db
      .update(reports)
      .set({ status, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return result[0];
  }
}
