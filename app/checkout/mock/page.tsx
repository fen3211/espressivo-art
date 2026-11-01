import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { paymentGateway } from '@/lib/payment-gateway';
import { MockCheckoutClient, MockCheckoutData } from './MockCheckoutClient';

interface PageProps {
  searchParams: Promise<{
    tx?: string;
    appId?: string;
  }>;
}

export default async function MockCheckoutPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const tx = searchParams.tx?.trim();
  const appId = searchParams.appId?.trim();

  let checkoutData: MockCheckoutData | null = null;
  let errorMessage: string | undefined = undefined;

  try {
    let txRecord = null;

    if (tx) {
      txRecord = await prisma.paymentTransaction.findUnique({
        where: { transactionId: tx },
        include: {
          application: {
            include: {
              competition: true,
            },
          },
        },
      });
    } else if (appId) {
      txRecord = await prisma.paymentTransaction.findFirst({
        where: { applicationId: appId },
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              competition: true,
            },
          },
        },
      });
    }

    if (txRecord && txRecord.application) {
      const signature = paymentGateway.generateSignature({
        transactionId: txRecord.transactionId,
        applicationId: txRecord.applicationId,
        amount: txRecord.amount,
        status: 'CONFIRMED',
      });

      checkoutData = {
        transaction: {
          transactionId: txRecord.transactionId,
          applicationId: txRecord.applicationId,
          amount: txRecord.amount,
          currency: txRecord.currency,
          status: txRecord.status,
          provider: txRecord.provider,
        },
        application: {
          id: txRecord.application.id,
          code: txRecord.application.code,
          participantName: txRecord.application.participantName,
          competitionTitle: txRecord.application.competition.titleRu,
          status: txRecord.application.status,
          paymentStatus: txRecord.application.paymentStatus,
        },
        signature,
      };
    } else {
      errorMessage = 'Транзакция или заявка не найдены в базе данных.';
    }
  } catch (err: unknown) {
    console.error('Error loading mock checkout page:', err);
    errorMessage = 'Внутренняя ошибка загрузки данных платежа.';
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070b] flex items-center justify-center text-sm text-[#8f8fa3]">
          Загрузка платежной сессии...
        </div>
      }
    >
      <MockCheckoutClient
        data={checkoutData}
        errorMessage={errorMessage}
        txParam={tx}
        appIdParam={appId}
      />
    </Suspense>
  );
}
