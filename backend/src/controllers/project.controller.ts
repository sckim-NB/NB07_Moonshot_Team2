import { Request, Response } from 'express';
import { createdProjectSchema } from '../schemas/project.schema';
import * as projectService from '../services/project.service';

export async function createProject(req: Request, res: Response) {
  const validatedData = createdProjectSchema.parse(req.body);
  const newProject = await projectService.createProject({
    ...validatedData,
    ownerId: req.user!.id as string,
  });
  res.status(200).send(newProject);
}

export async function getProject(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const project = await projectService.getProject(projectId as string);
  res.status(200).send(project);
}

export async function updateProject(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const validatedData = createdProjectSchema.parse(req.body);
  const updatedProject = await projectService.updateProject(projectId as string, validatedData);
  res.status(200).send(updatedProject);
}

export async function deleteProject(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const deletedProject = await projectService.deleteProject(projectId as string);
  res.status(204).send(deletedProject);
}
