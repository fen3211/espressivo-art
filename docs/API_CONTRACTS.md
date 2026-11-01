# espressivo ART — API Contracts & Endpoints Specification

Базовый путь: `/api`
Формат: `application/json`
Аутентификация: `HttpOnly` Cookie `token` (JWT payload: `{ userId, email, role, fullName }`)

---

## 1. Аутентификация (`/api/auth`)

### `POST /api/auth/register`
Регистрация нового пользователя (Participant или Teacher).
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
    fullName: string;
    role: "PARTICIPANT" | "TEACHER";
    phone?: string;
    referralCode?: string; // Если регистрация по ссылке преподавателя
    organization?: string; // Для преподавателя
  }
  ```
- **Response 201**:
  ```typescript
  {
    user: { id: string; email: string; fullName: string; role: string; referralCode?: string };
    message: string;
  }
  ```
- **Errors**: `400` (Validation), `409` (Email already exists).

### `POST /api/auth/login`
Авторизация по email и паролю.
- **Request Body**: `{ email: string; password: string }`
- **Response 200**:
  ```typescript
  {
    user: { id: string; email: string; fullName: string; role: string };
    redirectUrl: string; // /dashboard | /teacher | /jury/dashboard | /admin
  }
  ```
- **Errors**: `401` (Invalid credentials).

### `POST /api/auth/logout`
Очистка сессионного cookie.
- **Response 200**: `{ success: true }`

### `GET /api/auth/me`
Получение данных текущего авторизованного пользователя.
- **Response 200**: `{ user: UserSessionDTO | null }`

---

## 2. Публичные эндпоинты (`/api/public`)

### `GET /api/public/competitions`
Список активных и прошедших конкурсов.
- **Response 200**:
  ```typescript
  Array<{
    id: string;
    slug: string;
    titleRu: string;
    titleEn: string;
    descriptionRu: string;
    descriptionEn: string;
    heroImageUrl: string;
    status: "OPEN" | "UPCOMING" | "JUDGING" | "COMPLETED";
    entryFee: number;
    currency: string;
    startDate: string;
    endDate: string;
    nominationsCount: number;
  }>
  ```

### `GET /api/public/competitions/:slug`
Полная информация о конкурсе, включая список номинаций, возрастных категорий и жюри.
- **Response 200**:
  ```typescript
  {
    id: string;
    slug: string;
    titleRu: string;
    titleEn: string;
    descriptionRu: string;
    descriptionEn: string;
    heroImageUrl: string;
    status: string;
    entryFee: number;
    currency: string;
    startDate: string;
    endDate: string;
    judgingEndDate: string;
    nominations: Array<{ id: string; code: string; titleRu: string; titleEn: string }>;
    ageCategories: Array<{ id: string; code: string; titleRu: string; titleEn: string; minAge: number; maxAge: number }>;
    jury: Array<{ id: string; fullName: string; avatarUrl: string; title: string }>;
  }
  ```

### `GET /api/public/verify-certificate/:token`
Публичная верификация подлинности диплома по QR-коду / токену.
- **Response 200**:
  ```typescript
  {
    isValid: boolean;
    certificateNumber: string;
    participantName: string;
    competitionTitle: string;
    nominationTitle: string;
    awardDegree: string;
    totalScore: number;
    issuedDate: string;
  }
  ```

---

## 3. Заявки участника (`/api/applications`)

### `GET /api/applications`
Список заявок текущего пользователя (или всех для админа).
- **Access**: `PARTICIPANT`, `ADMIN`
- **Response 200**: `Array<ApplicationDTO>`

### `POST /api/applications`
Создание новой заявки (черновик или отправка).
- **Access**: `PARTICIPANT`
- **Request Body**:
  ```typescript
  {
    competitionId: string;
    nominationId: string;
    ageCategoryId: string;
    participantName: string;
    birthDate: string; // ISO
    teacherName?: string;
    institution?: string;
    repertoire: string;
    videoUrl: string;
    videoProvider?: "YOUTUBE" | "RUTUBE" | "VK" | "CLOUD";
    parentFullName: string;
    parentEmail: string;
    parentPhone: string;
    consentDataProcess: boolean;
    consentPublicStream: boolean;
    referralCode?: string;
    isSubmit?: boolean; // false = DRAFT, true = SUBMITTED
  }
  ```
- **Response 201**: `{ application: ApplicationDTO; paymentUrl?: string }`

### `GET /api/applications/:id`
Получение данных конкретной заявки.
- **Access**: Владелец заявки, Назначенный член жюри (с сокрытием ПДн), Администратор.
- **Response 200**: `ApplicationDTO | JuryApplicationDTO`

### `PUT /api/applications/:id`
Редактирование черновика заявки.
- **Access**: Владелец заявки (только если статус `DRAFT`).

---

## 4. Кабинет преподавателя (`/api/teacher`)

### `GET /api/teacher/dashboard`
Сводка для преподавателя: реферальный код, баланс, список учеников, начисленные комиссии.
- **Access**: `TEACHER`
- **Response 200**:
  ```typescript
  {
    referralCode: string;
    referralLink: string;
    commissionRate: number; // 0.20
    balance: number;
    totalEarned: number;
    paidApplicationsCount: number;
    participants: Array<{
      id: string;
      participantName: string;
      applicationCode: string;
      competitionTitle: string;
      entryFee: number;
      commissionAmount: number;
      paymentDate: string;
      status: string;
    }>;
    recentTransactions: Array<{
      id: string;
      type: "COMMISSION_ACCRUAL" | "PAYOUT";
      amount: number;
      description: string;
      createdAt: string;
    }>;
  }
  ```

### `POST /api/teacher/payouts`
Запрос на вывод средств.
- **Access**: `TEACHER`
- **Request Body**: `{ amount: number; bankDetails: string }`
- **Response 201**: `{ payoutRequest: PayoutRequestDTO }`
- **Errors**: `400` (Insufficient balance or minimum amount).

---

## 5. Кабинет жюри (`/api/jury`)

### `GET /api/jury/applications`
Список заявок, назначенных текущему члену жюри (с сокрытием контактов ребенка).
- **Access**: `JURY`
- **Response 200**:
  ```typescript
  Array<{
    applicationId: string;
    code: string;
    nominationTitle: string;
    ageCategoryTitle: string;
    repertoire: string;
    videoUrl: string;
    hasEvaluation: boolean;
    evaluationDraft?: {
      scoreTechnique: number;
      scoreMusicality: number;
      scoreArtistry: number;
      scoreRepertoire: number;
      totalScore: number;
      comment: string;
      isDraft: boolean;
    };
  }>
  ```

### `POST /api/jury/evaluations`
Сохранение черновика или финальная отправка оценки.
- **Access**: `JURY`
- **Request Body**:
  ```typescript
  {
    applicationId: string;
    scoreTechnique: number; // 0-25
    scoreMusicality: number; // 0-25
    scoreArtistry: number; // 0-25
    scoreRepertoire: number; // 0-25
    comment: string;
    isFinalSubmit: boolean; // true = фиксация и блокировка
  }
  ```
- **Response 200**: `{ success: true; totalScore: number; isLocked: boolean }`
- **Errors**: `403` (Evaluation already finalized).

---

## 6. Платежи и вебхуки (`/api/payments`)

### `POST /api/payments/create-session`
Создание платежной сессии для заявки.
- **Request Body**: `{ applicationId: string }`
- **Response 200**: `{ paymentUrl: string; transactionId: string }`

### `POST /api/payments/webhook`
Обработчик платежного вебхука (Mock / Провайдер) с защитой от повторных списаний.
- **Header**: `x-signature: string`
- **Request Body**:
  ```typescript
  {
    transactionId: string;
    applicationId: string;
    amount: number;
    status: "CONFIRMED" | "FAILED";
    signature: string;
  }
  ```
- **Response 200**: `{ received: true; status: "PROCESSED" | "ALREADY_PROCESSED" }`
- **Идемпотентность**: Проверка транзакции в `PaymentTransaction`, начисление 20% в `LedgerTransaction` строго 1 раз.

---

## 7. Админ-панель (`/api/admin`)

- `GET /api/admin/overview`: Статистика пользователей, заявок, выручки, комиссий.
- `GET /api/admin/users`: Управление пользователями и смена ролей.
- `GET/POST /api/admin/competitions`: CRUD конкурсов и номинаций.
- `GET /api/admin/applications`: Полный реестр заявок с фильтрами и назначением жюри.
- `POST /api/admin/applications/:id/assign-jury`: Назначение эксперта жюри на заявку.
- `POST /api/admin/calculate-results`: Подсчет средних баллов, распределение лауреатов.
- `POST /api/admin/certificates/generate-all`: Пакетная генерация PDF-дипломов.
- `GET /api/admin/finance`: Сводка платежей, реестр комиссий преподавателей.
- `POST /api/admin/payouts/:id/confirm`: Подтверждение и выплата средств преподавателю.

---

## 8. Дипломы (`/api/certificates`)

### `GET /api/certificates/:applicationId/download`
Генерация и скачивание PDF-диплома высокой печати (Art+Commerce эстетика).
- **Access**: Владелец заявки, Преподаватель (если указан в заявке), Администратор.
- **Response 200**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="espressivo-diploma-[CODE].pdf"`
