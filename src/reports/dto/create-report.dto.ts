import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'Buraco na calçada' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Tem um buraco enorme na calçada da Rua das Flores, alguém pode se machucar.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - Centro' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: 'https://bucket.s3.amazonaws.com/reports/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
