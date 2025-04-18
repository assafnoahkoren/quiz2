import { IsDate, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  govExamId: string;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
