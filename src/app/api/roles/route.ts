import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Role from '@/models/Role';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const roles = await Role.find().sort({ name: 1 }).lean();
  return apiSuccess(roles);
}