import CourseDetailClient from './CourseDetailClient';

export async function generateStaticParams() {
  return [
    { id: 'course-ai-agents' },
    { id: 'course-nextjs-ai' },
    { id: 'course-deep-learning' },
    { id: 'course-devops-k8s' },
    { id: 'course-ui-ux-figma' },
  ];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
