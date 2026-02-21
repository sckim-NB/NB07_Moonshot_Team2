'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { formatInTimeZone } from 'date-fns-tz';
import Input from '@/shared/components/Input';
import BlankProfile from '@/public/assets/blank-profile.svg';
import { Comment as EntityComment} from '@/types/entities';
import CommentMoreMenu from './CommentMoreMenu';
import styles from './CommentList.module.css';
import { createComment } from '../actions';

interface Author {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
interface LocalComment {
  id: string;
  content: string;
  author: Author;
  taskId: string;
  createdAt: string; 
  updatedAt: string;
}

interface CommentResponse {
  data: LocalComment[];
  total: number;
}
const cx = classNames.bind(styles);

const CommentItem = ({
  taskId,
  comment,
}: {
  taskId: string;
  comment: LocalComment;
}) => {
  const author = comment.author;
  console.log('개별 댓글 작성자 데이터:', author);
  return (
    <div className={cx('comment')}>
      {author?.profileImage ? (
        <Image
          className={cx('profileImage')}
          src={author.profileImage}
          alt="profile"
          width={50}
          height={50}
        />
      ) : (
        <BlankProfile className={cx('profileImage')} />
      )}
      <div className={cx('commentBody')}>
        <div className={cx('info')}>
          <span className={cx('author')}>{author?.name || '알 수 없는 사용자'}</span>
          <span className={cx('createdAt')}>
            {comment.createdAt ?formatInTimeZone(
              comment.createdAt,
              'Asia/Seoul',
              'yyyy. MM. dd. HH:mm:ss'
            ): '날짜 정보 없음'}
          </span>
        </div>
        <div className={cx('commentContent')}>{comment.content}</div>
      </div>
      <CommentMoreMenu
        className={cx('moreMenu')}
        taskId={taskId}
        comment={comment as unknown as EntityComment}
      />
    </div>
  );
};

const CommentList = ({
  comments,
  taskId,
}: {
  comments: LocalComment[] | CommentResponse;
  taskId: string;
}) => {
  const [state, dispatch, isPending] = useActionState(
    async (prevState: { content: string }, nextState: FormData) => {
      const values = {
        content: nextState.get('content') as string,
      };
      const { error, success } = await createComment(taskId, values);
      if (error) {
        toast.error(error);
      }
      if (success) {
        toast.success(success);
        return { content: '' };
      }
      return values;
    },
    { content: '' }
  );
  console.log('받아온 댓글 데이터:', comments);
  const commentItems: LocalComment[] = Array.isArray(comments) 
    ? comments 
    : (comments as CommentResponse)?.data || [];
  return (
    <>
      <form action={dispatch}>
        <Input
          className={cx('commentInput')}
          name="content"
          defaultValue={state.content}
          placeholder="댓글 입력하기"
          disabled={isPending}
        />
      </form>
      <div className={cx('commentList')}>
        {commentItems.map((comment: LocalComment) => (
  <CommentItem key={comment.id} taskId={taskId} comment={comment} />
))}
      </div>
    </>
  );
};

export default CommentList;
