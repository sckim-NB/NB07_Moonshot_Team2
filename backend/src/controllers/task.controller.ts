import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { createdTaskSchema, updateTaskSchema } from '../schemas/task.schema';

export async function createTask(req: Request, res: Response) {
  const { projectId } = req.params;
  const dataToValidate = {
    ...req.body,
    projectId: projectId,
  };
  const validatedData = createdTaskSchema.parse(dataToValidate);
  const newTask = await taskService.createTask(validatedData);
  res.status(200).send(newTask);
}

export async function listTasks(req: Request, res: Response) {
  const { projectId } = req.params;
  const { status, assignee, tags, page, limit, keyword } = req.query;

  const { data: tasks, total } = await taskService.listTask({
    projectId: projectId as string,
    status: status as 'todo' | 'in_progress' | 'done' | undefined,
    assignee: assignee as string | undefined,
    tags: tags ? (Array.isArray(tags) ? (tags as string[]) : [tags as string]) : undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    keyword: keyword as string | undefined,
  });

  res.status(200).send({ data: tasks, total });
}

export async function getTask(req: Request, res: Response) {
  const taskId = req.params.taskId;
  const task = await taskService.getTask(taskId as string);
  res.status(200).send(task);
}

export async function updateTask(req: Request, res: Response) {
  const taskId = req.params.taskId;
  const validatedData = updateTaskSchema.parse(req.body);
  const updatedTask = await taskService.updateTask(taskId as string, validatedData);
  res.status(200).send(updatedTask);
}

export async function deleteTask(req: Request, res: Response) {
  const taskId = req.params.taskId;
  await taskService.deleteTask(taskId as string);
  res.status(204).send();
}
