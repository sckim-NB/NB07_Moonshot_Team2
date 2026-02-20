'use client';
import { startTransition, useActionState } from 'react';
import Dropdown from '@/shared/components/Dropdown';
import { TaskStatus } from '@/types/TaskStatus';
import { updateTask } from '../actions';
import { toast } from 'react-toastify';
import { Task } from '@/types/entities';

const TaskDropdown = ({
  taskId,
  task,
}: {
  taskId: string;
  task: Task;
}) => {
  const [state, dispatch, isPending] = useActionState(
    async (prevState: TaskStatus, nextState: TaskStatus) => {
      const {
        error,
        success,
      } = await updateTask(taskId, { 
        status: nextState,
        projectId: task.projectId, 
        title: task.title,
        description: task.description,
        startYear: task.startYear,
        startMonth: task.startMonth,
        startDay: task.startDay,
        endYear: task.endYear,
        endMonth: task.endMonth,
        endDay: task.endDay,
        assignee: task.assignee?.id?.toString(), 
        tags: task.tags.map(tag => tag.name),
        attachments: task.attachments});
      if (error) {
        toast.error(error);
        return prevState;
      }
      if (success) {
        toast.success(success);
        return nextState;
      }
      return prevState;
    },
    task.status
  );

  return (
    <Dropdown
      options={[
        { label: '진행 전', value: 'todo' },
        { label: '진행 중', value: 'in_progress' },
        { label: '완료', value: 'done' },
      ]}
      value={state}
      onChange={(value) => {
        startTransition(() => {
          dispatch(value as TaskStatus);
        });
      }}
      placeholder="상태"
      disabled={isPending}
    />
  );
};

export default TaskDropdown;
