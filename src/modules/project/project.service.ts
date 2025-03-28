import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProjectInput {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: 'active' | 'on_hold' | 'completed';
  documents?: { name: string; url: string }[];
  teamEmails?: string[];
}

export const createProject = async (
  data: CreateProjectInput & { createdById: string },
) => {
  let teamIds: string[] = [];

  if (data.teamEmails && data.teamEmails.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        email: { in: data.teamEmails },
      },
      select: { id: true },
    });

    teamIds = users.map((u) => u.id);
  }

  const newProject = await prisma.project.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      description: data.description,
      status: data.status,
      documents: data.documents ? (data.documents as any) : undefined,
      createdById: data.createdById,
      teams: {
        connect: teamIds.map((id) => ({ id })),
      },
    },
    include: {
      teams: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return newProject;
};

interface GetProjectsInput {
  userId: string;
  name?: string;
  status?: 'active' | 'on_hold' | 'completed';
  page: number;
  perPage: number;
}

export const getProjects = async ({
  userId,
  name,
  status,
  page,
  perPage,
}: GetProjectsInput) => {
  const skip = (page - 1) * perPage;

  const where: Prisma.ProjectWhereInput = {
    OR: [{ createdById: userId }, { teams: { some: { id: userId } } }],
    ...(name && {
      name: {
        contains: name,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(status && { status }),
  };

  const [projects, totalItems] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      include: {
        teams: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: projects,
    meta: {
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        perPage,
      },
    },
  };
};
