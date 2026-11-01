import CourseDetailClient from './CourseDetailClient';

export async function generateStaticParams() {
  return [
    { id: 'course-ai-agents' },
    { id: 'course-nextjs-ai' },
    { id: 'course-deep-learning' },
  ];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
