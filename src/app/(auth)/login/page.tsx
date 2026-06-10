import { LoginForm } from '@/components/forms/LoginForm';

export const metadata = { title: 'Connexion — StockFlow' };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">StockFlow</h1>
          <p className="text-gray-400 mt-2 text-sm">Connectez-vous à votre espace</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}