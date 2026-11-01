import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
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
  let isProductionBlocked = false;
  let isAlreadyPaid = false;

  // 1. Production guard: Mock payments strictly disabled in production
  if (!paymentGateway.isMockAllowed()) {
    isProductionBlocked = true;
    errorMessage = 'MOCK_CHECKOUT_DISABLED_IN_PRODUCTION';
  } else {
    try {
      // 2. Authentication check: Session is mandatory
      const session = await getSession();
      if (!session) {
        errorMessage = 'UNAUTHORIZED';
      } else if (!tx) {
        // 3. Reject lookup solely by appId (prevents unauthorized scanning of applications)
        errorMessage = 'TRANSACTION_ID_REQUIRED';
      } else {
        // 4. Look up transaction strictly by transactionId
        const txRecord = await prisma.paymentTransaction.findUnique({
          where: { transactionId: tx },
          include: {
            application: {
              include: {
                competition: true,
              },
            },
          },
        });

        if (!txRecord || !txRecord.application) {
          errorMessage = 'TRANSACTION_NOT_FOUND';
        } else if (
          session.role !== 'ADMIN' &&
          txRecord.userId !== session.userId &&
          txRecord.application.userId !== session.userId
        ) {
          // 5. Tenant isolation & ownership check
          errorMessage = 'ACCESS_FORBIDDEN';
        } else if (appId && txRecord.applicationId !== appId) {
          // 6. Application mismatch guard
          errorMessage = 'APPLICATION_MISMATCH';
        } else if (
          txRecord.status === 'CONFIRMED' ||
          txRecord.application.paymentStatus === 'PAID'
        ) {
          // 7. Prevent re-paying settled transaction
          isAlreadyPaid = true;
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
              competitionTitleRu: txRecord.application.competition.titleRu,
              competitionTitleEn: txRecord.application.competition.titleEn,
              status: txRecord.application.status,
              paymentStatus: txRecord.application.paymentStatus,
            },
            signature: '',
          };
        } else {
          // 8. Generate HMAC signature on server side
          const signature = paymentGateway.generateSignature({
            transactionId: txRecord.transactionId,
            applicationId: txRecord.applicationId,
            amount: txRecord.amount,
            currency: txRecord.currency,
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
              competitionTitleRu: txRecord.application.competition.titleRu,
              competitionTitleEn: txRecord.application.competition.titleEn,
              status: txRecord.application.status,
              paymentStatus: txRecord.application.paymentStatus,
            },
            signature,
          };
        }
      }
    } catch (err: unknown) {
      console.error('Error loading mock checkout page:', err);
      errorMessage = 'INTERNAL_ERROR';
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070b] flex items-center justify-center text-sm text-[#8f8fa3]">
          Loading payment gateway...
        </div>
      }
    >
      <MockCheckoutClient
        data={checkoutData}
        errorCode={errorMessage}
        isProductionBlocked={isProductionBlocked}
        isAlreadyPaid={isAlreadyPaid}
        txParam={tx}
        appIdParam={appId}
      />
    </Suspense>
  );
}
