import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_STATUSES = [
  'NA_FILA',
  'EM_TRIAGEM',
  'EM_PROGRESSO',
  'CONCLUIDO',
  'NEGADO',
] as const;

export class UpdateStatusDto {
  @ApiProperty({
    enum: VALID_STATUSES,
    example: 'EM_TRIAGEM',
  })
  @IsIn(VALID_STATUSES)
  status: (typeof VALID_STATUSES)[number];
}
