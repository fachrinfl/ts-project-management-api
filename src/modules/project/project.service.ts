import { Prisma, PrismaClient } from '@prisma/client';
import { differenceInCalendarDays, isBefore } from 'date-fns';

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
      orderBy: { endDate: 'asc' },
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
    data: projects.map((project) => {
      const today = new Date();
      const isOverdue = isBefore(project.endDate, today);
      const projectEndDate = new Date(project.endDate);
      const overdue = isBefore(new Date(project.endDate), today);
      const overdueDays = isOverdue
        ? Math.max(differenceInCalendarDays(today, projectEndDate), 1)
        : null;

      return {
        ...project,
        isOverdue: overdue,
        overdueDays,
      };
    }),
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

export const getProjectById = async (id: string) => {
  const projectById = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      teams: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  const today = new Date();
  const isOverdue = isBefore(projectById!.endDate, today);
  const projectEndDate = new Date(projectById!.endDate);
  const overdue = isBefore(new Date(projectById!.endDate), today);
  const overdueDays = isOverdue
    ? Math.max(differenceInCalendarDays(today, projectEndDate), 1)
    : null;
  const project = {
    ...projectById,
    isOverdue: overdue,
    overdueDays,
  };

  if (!projectById) {
    throw new Error('Project not found');
  }

  return project;
};

interface UpdateProjectInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: 'active' | 'on_hold' | 'completed';
  documents?: { name: string; url: string }[];
  teamEmails?: string[];
}

export const updateProjectById = async (
  id: string,
  data: UpdateProjectInput,
) => {
  let teamIds: string[] = [];

  if (data.teamEmails && data.teamEmails.length > 0) {
    const users = await prisma.user.findMany({
      where: { email: { in: data.teamEmails } },
      select: { id: true },
    });
    teamIds = users.map((u) => u.id);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      description: data.description,
      status: data.status,
      documents: data.documents as Prisma.InputJsonValue,
      teams: data.teamEmails
        ? {
            set: [],
            connect: teamIds.map((id) => ({ id })),
          }
        : undefined,
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

  return updatedProject;
};

export const deleteProjectById = async (id: string) => {
  const deleted = await prisma.project.delete({
    where: { id },
  });

  return deleted;
};
