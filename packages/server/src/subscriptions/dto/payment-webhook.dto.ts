import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumberString, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ProductDataDto {
  @IsNumberString()
  product_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  catalog_number?: string;

  @IsNumberString()
  vat: string;

  @IsNumberString()
  quantity: string;

  @IsNumberString()
  price: string;

  @IsNumberString()
  sum: string;

  @IsNumberString()
  price_mark: string;
}

// Added DTO for dynamicFields items
export class DynamicFieldDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsString()
  label: 'מייל';

  @IsOptional()
  @IsString()
  option_label?: string;

  @IsOptional()
  @IsString()
  option_key?: string;

  @IsString()
  field_value: string;
}

export class PaymentDataDto {
  @IsNumberString()
  asmachta: string;

  @IsString()
  cardSuffix: string;

  @IsString()
  cardType: string;

  @IsNumberString()
  cardTypeCode: string;

  @IsString()
  cardBrand: string;

  @IsNumberString()
  cardBrandCode: string;

  @IsString() // Format MMYY
  cardExp: string;

  @IsNumberString()
  firstPaymentSum: string;

  @IsNumberString()
  periodicalPaymentSum: string;

  @IsOptional()
  @IsString()
  payerBankAccountDetails?: string;

  @IsString()
  status: string;

  @IsNumberString()
  statusCode: string;

  @IsNumberString()
  transactionTypeId: string;

  @IsNumberString()
  paymentType: string;

  @IsNumberString()
  sum: string;

  @IsNumberString()
  paymentsNum: string;

  @IsNumberString()
  allPaymentsNum: string;

  @IsString() // Format DD/MM/YY
  paymentDate: string;

  @IsString()
  description: string;

  @IsString()
  fullName: string;

  @IsString()
  payerPhone: string;

  @IsOptional()
  @IsString()
  payerEmail?: string;

  @IsNumberString()
  transactionId: string;

  @IsString()
  transactionToken: string;

  @IsNumberString()
  paymentLinkProcessId: string;

  @IsString()
  paymentLinkProcessToken: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDataDto)
  productData: ProductDataDto[];

  // Added dynamicFields property
  @IsOptional() // Marking as optional in case it's not always present
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DynamicFieldDto)
  dynamicFields?: DynamicFieldDto[];

  @IsNumberString()
  processId: string;

  @IsString()
  processToken: string;
}

export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  err?: string;

  @IsNotEmpty()
  @IsNumberString()
  status: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaymentDataDto)
  data: PaymentDataDto;
} 