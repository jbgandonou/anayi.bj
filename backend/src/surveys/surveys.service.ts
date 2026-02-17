import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    volunteerId: string;
    volunteerName: string;
    volunteerPhone: string;
    surveyDate: Date;
    childId: string;
  }) {
    return this.prisma.survey.create({ data });
  }

  async findByChild(childId: string) {
    return this.prisma.survey.findMany({
      where: { childId },
      orderBy: { surveyDate: 'desc' },
    });
  }
}
