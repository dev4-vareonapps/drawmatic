import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <LoginForm />
      <p className="mt-4 text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
