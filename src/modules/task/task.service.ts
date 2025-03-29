import { PrismaClient } from '@prisma/client';
import { differenceInCalendarDays, isBefore } from 'date-fns';

const prisma = new PrismaClient();

interface CreateTaskInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  assigneeId: string;
  projectId: string;
}

export const createTask = async (
  data: CreateTaskInput & { createdById: string },
) => {
  const task = await prisma.task.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
      projectId: data.projectId,
      createdById: data.createdById,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return task;
};

export const getTaskById = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      project: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
};

interface UpdateTaskInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'high' | 'medium' | 'low';
  assigneeId?: string;
}

export const updateTaskById = async (taskId: string, data: UpdateTaskInput) => {
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updated;
};

interface GetAllTasksInput {
  userId?: string;
  projectId?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'high' | 'medium' | 'low';
  page: number;
  perPage: number;
}

export const getAllTasks = async ({
  userId,
  projectId,
  status,
  priority,
  page,
  perPage,
}: GetAllTasksInput) => {
  const skip = (page - 1) * perPage;

  const where: any = {
    ...(userId && { assigneeId: userId }),
    ...(projectId && { projectId }),
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [tasks, totalItems] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: perPage,
      orderBy: {
        endDate: 'asc',
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);
  const totalPages = Math.ceil(totalItems / perPage);
  const today = new Date();
  return {
    data: tasks.map((task) => {
      const isOverdue = isBefore(task.endDate, today) && task.status !== 'done';
      const projectEndDate = new Date(task.endDate);
      const overdue = isBefore(new Date(task.endDate), today);
      const overdueDays = isOverdue
        ? Math.max(differenceInCalendarDays(today, projectEndDate), 1)
        : null;
      return {
        ...task,
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

export const deleteTask = async ({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
}) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (task.createdById !== userId) {
    throw new Error('You are not authorized to delete this task');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { message: 'Task deleted successfully' };
};

interface GetTasksByProjectParams {
  projectId: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'high' | 'medium' | 'low';
  page: number;
  perPage: number;
}

export const getTasksByProjectId = async ({
  projectId,
  status,
  priority,
  page,
  perPage,
}: GetTasksByProjectParams) => {
  const skip = (page - 1) * perPage;

  const where = {
    projectId,
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [tasks, totalItems] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: perPage,
      orderBy: {
        endDate: 'asc',
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    meta: {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
      },
    },
  };
};
