import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SponsorshipStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalChildren,
      pending,
      sponsored,
      notEligible,
      totalDocuments,
      totalSurveys,
      recentChildren,
      childrenByVillage,
    ] = await Promise.all([
      this.prisma.child.count(),
      this.prisma.child.count({ where: { sponsorshipStatus: SponsorshipStatus.PENDING } }),
      this.prisma.child.count({ where: { sponsorshipStatus: SponsorshipStatus.SPONSORED } }),
      this.prisma.child.count({ where: { sponsorshipStatus: SponsorshipStatus.NOT_ELIGIBLE } }),
      this.prisma.document.count(),
      this.prisma.survey.count(),
      this.prisma.child.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          firstName: true,
          lastName: true,
          village: true,
          sponsorshipStatus: true,
          createdAt: true,
        },
      }),
      this.prisma.child.groupBy({
        by: ['village'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalChildren,
      sponsorship: { pending, sponsored, notEligible },
      totalDocuments,
      totalSurveys,
      recentChildren,
      childrenByVillage: childrenByVillage.map((v) => ({
        village: v.village,
        count: v._count.id,
      })),
    };
  }
}
