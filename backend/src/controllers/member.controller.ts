import { RequestHandler } from 'express';
import { InvalidRequestError, LoginRequiredError } from '../lib/errors.js';
import { memberService } from '../services/member.service.js';

type Params = { projectId: string };

export const getProjectMembers: RequestHandler = async (req, res) => {
  const { projectId } = req.params as Params;

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
    throw new InvalidRequestError();
  }

const user = (req as { user?: unknown }).user;

if (!user || typeof user !== 'object' || !('id' in user)) {
  throw new LoginRequiredError();
}

const requesterId = (user as { id: string }).id;

  const result = await memberService.getProjectMembers({
    projectId,
    requesterId,
    page,
    limit,
  });

  res.status(200).json(result);
};
