import CoursePlayerClient from './CoursePlayerClient';

export async function generateStaticParams() {
  return [
    { courseId: 'course-ai-agents' },
    { courseId: 'course-nextjs-ai' },
    { courseId: 'course-deep-learning' },
  ];
}

export default function CoursePlayerPage() {
  return <CoursePlayerClient />;
}
