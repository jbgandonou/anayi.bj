import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreateChildDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  approximateAge?: number;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsString()
  village: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  familyStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  siblingsCount?: number;

  // Scolarité
  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  currentGrade?: string;

  @IsOptional()
  @IsString()
  attendanceFrequency?: string;

  @IsOptional()
  @IsString()
  educationalNeeds?: string;

  // Santé
  @IsOptional()
  @IsString()
  generalHealth?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  vaccinationsUpToDate?: boolean;

  @IsOptional()
  @IsString()
  healthIssues?: string;

  // Conditions de vie
  @IsOptional()
  @IsString()
  housingType?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  accessToWater?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  accessToElectricity?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sufficientFood?: boolean;

  @IsOptional()
  @IsString()
  guardianActivity?: string;

  // Parrainage
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  wantsSponsorship?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  guardianConsent?: boolean;

  @IsOptional()
  @IsString()
  sponsorshipComments?: string;

  // Enquête
  @IsString()
  volunteerName: string;

  @IsString()
  volunteerPhone: string;

  @IsDateString()
  surveyDate: string;

  // Force la création même si doublon détecté
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  forceCreate?: boolean;
}
