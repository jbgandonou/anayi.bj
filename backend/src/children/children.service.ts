import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';
import { SponsorshipStatus } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChildDto, volunteerId: string, files?: { photo?: string; birthCertificate?: string; schoolCertificate?: string }) {
    // Générer la référence unique
    const year = new Date().getFullYear();
    const count = await this.prisma.child.count();
    const reference = `ANI-${year}-${String(count + 1).padStart(4, '0')}`;

    // Détection de doublons
    if (!dto.forceCreate) {
      const duplicates = await this.findDuplicates(dto.firstName, dto.lastName, dto.dateOfBirth, dto.village);
      if (duplicates.length > 0) {
        return {
          warning: 'Doublon potentiel détecté',
          duplicates,
          confirmationRequired: true,
        };
      }
    }

    // Création en transaction
    return this.prisma.$transaction(async (tx) => {
      const child = await tx.child.create({
        data: {
          reference,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          approximateAge: dto.approximateAge,
          placeOfBirth: dto.placeOfBirth,
          village: dto.village,
          nationality: dto.nationality || 'Béninoise',
          familyStatus: dto.familyStatus,
          siblingsCount: dto.siblingsCount || 0,
          school: dto.school,
          currentGrade: dto.currentGrade,
          attendanceFrequency: dto.attendanceFrequency,
          educationalNeeds: dto.educationalNeeds,
          generalHealth: dto.generalHealth,
          vaccinationsUpToDate: dto.vaccinationsUpToDate || false,
          healthIssues: dto.healthIssues,
          housingType: dto.housingType,
          accessToWater: dto.accessToWater || false,
          accessToElectricity: dto.accessToElectricity || false,
          sufficientFood: dto.sufficientFood || false,
          guardianActivity: dto.guardianActivity,
          wantsSponsorship: dto.wantsSponsorship || false,
          guardianConsent: dto.guardianConsent || false,
          sponsorshipComments: dto.sponsorshipComments,
          photoUrl: files?.photo,
        },
      });

      // Créer les documents associés
      const documentsData: Array<{
        type: 'BIRTH_CERTIFICATE' | 'SCHOOL_CERTIFICATE' | 'RECENT_PHOTO';
        fileName: string;
        filePath: string;
        mimeType: string;
        fileSize: number;
        childId: string;
      }> = [];

      if (files?.photo) {
        documentsData.push({
          type: 'RECENT_PHOTO',
          fileName: 'photo.jpg',
          filePath: files.photo,
          mimeType: 'image/jpeg',
          fileSize: 0,
          childId: child.id,
        });
      }
      if (files?.birthCertificate) {
        documentsData.push({
          type: 'BIRTH_CERTIFICATE',
          fileName: 'acte-naissance',
          filePath: files.birthCertificate,
          mimeType: 'image/jpeg',
          fileSize: 0,
          childId: child.id,
        });
      }
      if (files?.schoolCertificate) {
        documentsData.push({
          type: 'SCHOOL_CERTIFICATE',
          fileName: 'certificat-scolarite',
          filePath: files.schoolCertificate,
          mimeType: 'image/jpeg',
          fileSize: 0,
          childId: child.id,
        });
      }

      if (documentsData.length > 0) {
        await tx.document.createMany({ data: documentsData });
      }

      // Créer l'enquête
      await tx.survey.create({
        data: {
          volunteerId,
          volunteerName: dto.volunteerName,
          volunteerPhone: dto.volunteerPhone,
          surveyDate: new Date(dto.surveyDate),
          childId: child.id,
        },
      });

      return child;
    });
  }

  async findAll(params: {
    cursor?: string;
    take?: number;
    search?: string;
    village?: string;
    school?: string;
    sponsorshipStatus?: string;
    gender?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const take = params.take || 50;
    const where: any = {};

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.village) where.village = { contains: params.village, mode: 'insensitive' };
    if (params.school) where.school = { contains: params.school, mode: 'insensitive' };
    if (params.sponsorshipStatus) where.sponsorshipStatus = params.sponsorshipStatus;
    if (params.gender) where.gender = params.gender;

    const orderField = params.orderBy || 'createdAt';
    const orderDir = params.order || 'desc';

    const queryArgs: any = {
      where,
      take: take + 1, // +1 pour savoir s'il y a plus de résultats
      orderBy: { [orderField]: orderDir },
      select: {
        id: true,
        reference: true,
        firstName: true,
        lastName: true,
        gender: true,
        village: true,
        school: true,
        sponsorshipStatus: true,
        photoUrl: true,
        createdAt: true,
      },
    };

    if (params.cursor) {
      queryArgs.cursor = { id: params.cursor };
      queryArgs.skip = 1;
    }

    const children = await this.prisma.child.findMany(queryArgs);

    const hasMore = children.length > take;
    const data = hasMore ? children.slice(0, take) : children;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    const total = await this.prisma.child.count({ where });

    return { data, nextCursor, total };
  }

  async findOne(id: string) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        surveys: {
          select: {
            id: true,
            volunteerName: true,
            volunteerPhone: true,
            surveyDate: true,
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Enfant non trouvé');
    }

    return child;
  }

  async updateSponsorshipStatus(id: string, status: SponsorshipStatus, userId: string) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Enfant non trouvé');
    }

    const oldStatus = child.sponsorshipStatus;

    const updated = await this.prisma.child.update({
      where: { id },
      data: {
        sponsorshipStatus: status,
        sponsorshipStatusDate: new Date(),
      },
    });

    // Historique
    await this.prisma.childHistory.create({
      data: {
        childId: id,
        field: 'sponsorshipStatus',
        oldValue: oldStatus,
        newValue: status,
        changedBy: userId,
      },
    });

    return updated;
  }

  private async findDuplicates(firstName: string, lastName: string, dateOfBirth?: string, village?: string) {
    const where: any = {
      lastName: { contains: lastName, mode: 'insensitive' },
      firstName: { contains: firstName, mode: 'insensitive' },
    };

    if (village) where.village = { contains: village, mode: 'insensitive' };
    if (dateOfBirth) where.dateOfBirth = new Date(dateOfBirth);

    return this.prisma.child.findMany({
      where,
      take: 5,
      select: {
        id: true,
        reference: true,
        firstName: true,
        lastName: true,
        village: true,
      },
    });
  }
}
