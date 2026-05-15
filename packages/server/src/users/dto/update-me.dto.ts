import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  correctnessThreshold?: number;
}
