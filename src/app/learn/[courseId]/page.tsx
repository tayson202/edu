import CoursePlayerClient from './CoursePlayerClient';

export async function generateStaticParams() {
  return [
    { courseId: 'course-ai-agents' },
    { courseId: 'course-nextjs-ai' },
    { courseId: 'course-deep-learning' },
    { courseId: 'course-devops-k8s' },
    { courseId: 'course-ui-ux-figma' },
  ];
}

export default function CoursePlayerPage() {
  return <CoursePlayerClient />;
}
