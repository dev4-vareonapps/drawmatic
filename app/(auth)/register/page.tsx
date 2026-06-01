import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <RegisterForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
