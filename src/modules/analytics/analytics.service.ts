import { PrismaClient } from '@prisma/client';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { getCurrentWeekDates } from '../../utils/date';
const prisma = new PrismaClient();

export const getProjectAnalytics = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      teams: true,
      Task: true,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const now = new Date();
  const totalTasks = project.Task.length;

  const statusCount = {
    todo: 0,
    in_progress: 0,
    done: 0,
    overdue: 0,
  };

  project.Task.forEach((task) => {
    statusCount[task.status]++;
    if (isBefore(new Date(task.endDate), now) && task.status !== 'done') {
      statusCount.overdue++;
    }
  });

  const completionRate =
    totalTasks > 0 ? Math.round((statusCount.done / totalTasks) * 100) : 0;

  return {
    projectId: project.id,
    projectName: project.name,
    totalTasks,
    teamMembers: project.teams.length,
    taskBreakdown: statusCount,
    completionRate: `${completionRate}%`,
  };
};

export const getWeeklyProjectStatus = async (projectId: string) => {
  const weekDays = getCurrentWeekDates();

  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: {
      endDate: true,
      status: true,
    },
  });

  const result = weekDays.map(({ date, label }) => {
    const complete = tasks.filter(
      (task) =>
        task.status === 'done' && isSameDay(new Date(task.endDate), date),
    ).length;

    const ongoing = tasks.filter(
      (task) =>
        task.status !== 'done' &&
        (isAfter(new Date(task.endDate), date) ||
          isSameDay(new Date(task.endDate), date)),
    ).length;

    return {
      day: label,
      complete,
      ongoing,
    };
  });

  return result;
};

export const getTopProjectsByUserId = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      status: 'active',
      OR: [{ createdById: userId }, { teams: { some: { id: userId } } }],
    },
    orderBy: {
      endDate: 'asc',
    },
    take: 5,
    include: {
      Task: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      teams: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return projects.map((project) => {
    const totalTasks = project.Task.length;
    const completedTasks = project.Task.filter(
      (t) => t.status === 'done',
    ).length;
    const completionRate =
      totalTasks === 0
        ? '0%'
        : `${Math.round((completedTasks / totalTasks) * 100)}%`;

    return {
      projectId: project.id,
      projectName: project.name,
      endDate: project.endDate,
      status: project.status,
      createdBy: project.createdBy,
      teams: project.teams,
      totalTasks,
      completionRate,
    };
  });
};
