import classNames from 'classnames/bind';
import ProjectIcon from '@/shared/components/ProjectIcon';
import styles from './page.module.css';
import SortButton from './components/SortButton';
import CreateProject from './components/CreateProject';
import { ProjectWithCounts } from '@/types/entities';
import Link from 'next/link';
import { getMyProjectsWithCounts } from './actions';
import { setAuthCookies } from '@/shared/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
const cx = classNames.bind(styles);

const ProjectListItem = ({ project }: { project: ProjectWithCounts }) => {
  return (
    <div className={cx(styles.projectListItem)}>
      <div className={cx(styles.projectHeader)}>
        <ProjectIcon
          className={cx(styles.projectIcon)}
          projectId={project.id}
          name={project.name}
        />
        <div>
          <Link
            href={`/projects/${project.id}`}
            className={cx(styles.projectName)}
          >
            {project.name}
          </Link>
          <div className={cx(styles.projectMemberCount)}>
            {project.memberCount} 명
          </div>
        </div>
      </div>
      <div className={cx(styles.projectCounts)}>
        <div className={cx(styles.projectCount, styles.todo)}>
          <div className={cx(styles.projectCountLabel)}>진행 전</div>
          <span className={cx(styles.projectCountMetric)}>
            {project.todoCount}
          </span>
        </div>
        <div className={cx(styles.projectCount, styles.inProgress)}>
          <div className={cx(styles.projectCountLabel)}>진행 중</div>
          <span className={cx(styles.projectCountMetric)}>
            {project.inProgressCount}
          </span>
        </div>
        <div className={cx(styles.projectCount, styles.done)}>
          <div className={cx(styles.projectCountLabel)}>완료</div>
          <span className={cx(styles.projectCountMetric)}>
            {project.doneCount}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProjectList = ({ projects = [] }: { projects: ProjectWithCounts[] }) => {
  return (
    <div className={cx(styles.projectList)}>
      {projects.map((project) => (
        <ProjectListItem key={project.id} project={project} />
      ))}
      <CreateProject />
    </div>
  );
};

const MyProjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    sort: 'latest' | 'name';
    accessToken?: string;
    refreshToken?: string;
  }>;
}) => {
  const { sort, accessToken, refreshToken } = await searchParams;
  // 1. URL에 토큰이 들어왔을 때 (구글 로그인 직후)
  if (accessToken && refreshToken) {
    // 서버 사이드에서 즉시 쿠키를 설정 (httpOnly 적용됨)
    await setAuthCookies(accessToken, refreshToken);
    
    // 쿠키를 구웠으니 깔끔한 URL로 리다이렉트
    // 이렇게 하면 다시 이 페이지로 들어올 때 accessToken이 없으므로 아래 로직을 탑니다.
    redirect('/projects'); 
  }
  try {
    const { data: projectsWithCounts } = await getMyProjectsWithCounts({
      sort: sort || 'latest',
    });

  return (
    <div className={cx(styles.container)}>
      <div className={cx(styles.header)}>
        <h1 className={cx(styles.title)}>프로젝트 목록</h1>
        <SortButton />
      </div>
      <ProjectList projects={projectsWithCounts ?? []} />
    </div>
  );
} catch (error) {
    console.error("인증 실패:", error);
    redirect('/login');
  }
};

export default MyProjectListPage;
