import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import AlertRule from '@/models/AlertRule';
import AlertLog from '@/models/AlertLog';
import StockLevel from '@/models/StockLevel';
import ProductVariant from '@/models/ProductVariant';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendAlertEmail(emails: string[], subject: string, message: string) {
  if (!emails.length || !process.env.SMTP_USER) return;

  await transporter.sendMail({
    from:    process.env.SMTP_USER,
    to:      emails.join(', '),
    subject,
    text:    message,
    html:    `<p>${message}</p>`,
  });
}

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return apiError('Non autorisé', 401);
  }

  await connectDB();

  const rules = await AlertRule.find({ isActive: true })
    .populate('product',   'name sku')
    .populate('warehouse', 'name')
    .lean();

  let triggered = 0;

  for (const rule of rules) {
    const variants = await ProductVariant.find({
      product:  rule.product,
      isActive: true,
    }).lean();

    if (!variants.length) continue;

    const variantIds = variants.map((v) => v._id);

    const stockFilter: Record<string, unknown> = { variant: { $in: variantIds } };

    if (rule.warehouse) {
    const WarehouseLocation = (await import('@/models/WarehouseLocation')).default;
    const locations = await WarehouseLocation.find({ warehouse: rule.warehouse }).lean();
    const locationIds = locations.map((l) => l._id);
    stockFilter.location = { $in: locationIds };
    }

    const stockLevels = await StockLevel.find(stockFilter).lean();
    const totalQty    = stockLevels.reduce((sum, l) => sum + l.quantity, 0);

    let shouldAlert = false;
    let message     = '';

    if (rule.metric === 'low_stock' && totalQty <= rule.threshold) {
      shouldAlert = true;
      message     = `Stock bas pour ${(rule.product as any).name} : ${totalQty} unités (seuil : ${rule.threshold})`;
    }

    if (rule.metric === 'overstock' && totalQty >= rule.threshold) {
      shouldAlert = true;
      message     = `Surstock détecté pour ${(rule.product as any).name} : ${totalQty} unités (seuil : ${rule.threshold})`;
    }

    if (!shouldAlert) continue;

    const recentLog = await AlertLog.findOne({
      rule:        rule._id,
      resolved:    false,
      triggeredAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentLog) continue;

    await AlertLog.create({
      rule:        rule._id,
      message,
      triggeredAt: new Date(),
    });

    if (rule.notifyEmails?.length) {
      await sendAlertEmail(
        rule.notifyEmails,
        `[StockFlow] Alerte : ${(rule.product as any).name}`,
        message
      );
    }

    triggered++;
  }

  return apiSuccess({ ok: true, triggered });
}