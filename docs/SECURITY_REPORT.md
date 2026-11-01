# espressivo ART — Security Architecture & Threat Audit Report
**Статус аудита:** `PASSED / HARDENED`  
**Дата аудита:** Ноябрь 2026 г.  
**Объект аудита:** API, авторизация (RBAC), финансовый шлюз, защита несовершеннолетних (152-ФЗ / GDPR)  
**Ведущий специалист:** Lead Security & QA Automation Engineer  

---

## 1. Резюме аудита безопасности

Платформа **espressivo ART** предназначена для проведения международных детско-юношеских творческих конкурсов. Архитектура безопасности платформы спроектирована с учетом строжайших регуляторных требований:
1. Защита прав и персональных данных несовершеннолетних участников в соответствии с Федеральным законом № 152-ФЗ «О персональных данных», ст. 152.1 ГК РФ (охрана изображения гражданина) и нормами GDPR.
2. Принцип «Слепого прослушивания» (Blind Audition) для исключения коррупции, предвзятости жюри и раскрытия личности детей.
3. Финансовая целостность и идемпотентность начислений преподавателям по реферальной программе (20% комиссионных от фактической оплаты).
4. Защита от горизонтальной (IDOR) и вертикальной эскалации привилегий (RBAC).

Все 23 автоматизированных сценария аудита безопасности в наборе `tests/backend/security-audit.test.ts` успешно пройдены (Pass Rate 100%).

---

## 2. Анализ по стандарту OWASP Top 10 (2021)

```mermaid
flowchart TD
    subgraph ClientReq[Входящий HTTP-запрос]
        CookieOrHeader[Cookie: token ИЛИ Bearer JWT]
    end

    subgraph AuthLayer[Слой аутентификации & RBAC: lib/auth.ts]
        VerifyToken[verifySessionToken: Jose HS256]
        CheckRole{requireRole: Разрешенная роль?}
    end

    subgraph DataIsolation[Контроль владения & Анонимизация]
        TenantCheck{Владелец ресурса?}
        BlindFilter[Фильтр Слепого Прослушивания: Удаление ПДн]
    end

    subgraph CoreBusiness[Защищенные бизнес-операции]
        JuryGrading[Оценивание выступления]
        TeacherPayout[Атомарная выплата & Ledger]
        AdminControl[Панель супер-администратора]
    end

    ClientReq --> VerifyToken
    VerifyToken -->|Валиден| CheckRole
    VerifyToken -->|Невалиден / Отсутствует| Reject401[401 Unauthorized]
    CheckRole -->|Роль совпадает| TenantCheck
    CheckRole -->|Роль не совпадает| Reject403[403 Forbidden]
    TenantCheck -->|Jury| BlindFilter --> JuryGrading
    TenantCheck -->|Teacher/Admin| TeacherPayout
    TenantCheck -->|Admin Only| AdminControl
    TenantCheck -->|Чужой ID| Reject403
```

### A01: Broken Access Control (Нарушение контроля доступа)
- **Изоляция арендаторов (Tenant Isolation):**
  * Участник A не имеет доступа к просмотру (`GET`), редактированию (`PUT`) или удалению (`DELETE`) заявок Участника B (`app/api/applications/[id]/route.ts`). Попытки вызывают немедленный ответ `403 Forbidden`.
- **Изоляция экспертов жюри:**
  * Эксперт жюри видит в `/api/jury/applications` исключительно те заявки, на которые он официально назначен администратором (`juryUserId: session.userId`).
  * Незакрепленный член жюри не может открыть карточку заявки или выставить оценку (`403 Forbidden`).
- **Защита административных маршрутов:**
  * Маршруты `/api/admin/**` защищены декларативным шлюзом `await requireRole(req, ["ADMIN"])`. Попытки обращения участником, преподавателем или неавторизованным клиентом отклоняются с кодами `403` и `401`.

### A02: Cryptographic Failures (Сбои криптографии)
- **Пароли:** Все пароли пользователей хешируются с использованием `bcryptjs` с фактором стоимости 10 раундов (`saltRounds = 10`). Открытый текст паролей нигде не логируется и не сохраняется.
- **JWT-токены:** Токены сессий подписываются алгоритмом `HS256` библиотекой `jose` с валидацией времени жизни (`exp: 7d`).
- **Платежные вебхуки:** Используется криптографический дайджест HMAC-SHA256 (`crypto.createHmac`) с проверкой через `crypto.timingSafeEqual` для предотвращения атак по времени (timing attacks).

### A03: Injection (Инъекции)
- **SQL / NoSQL инъекции:** Полностью исключены благодаря использованию типизированного ORM Prisma с параметризованными подготовленными выражениями (Prepared Statements). Прямой вызов `raw query` отсутствует.
- **XSS (межсайтовый скриптинг):** Next.js / React автоматически экранирует рендеринг строк. В заголовках PDF-дипломов данные санитизируются перед отправкой в поток pdf-lib.

### A04: Insecure Design (Небезопасная архитектура)
- **Протокол «Слепого прослушивания»:** Жюри принципиально не получает идентификаторов несовершеннолетнего ребенка (ФИО, школа, регион, педагог, контакты).
- **Двухфакторный финансовый реестр:** Любое начисление комиссии преподавателю фиксируется отдельной неизменяемой транзакцией в таблице `LedgerTransaction` с указанием источника (`type = "COMMISSION_ACCRUAL"`).

### A05: Security Misconfiguration (Неверная конфигурация безопасности)
- Авторизационные токены устанавливаются в `HttpOnly: true`, `SameSite: "lax"`, а в производственной среде активируется флаг `secure: true`.
- Отсутствуют открытые debug-эндпоинты или тестовые бэкдоры.

### A06: Vulnerable and Outdated Components (Уязвимые компоненты)
- Зависимости платформы (`jose`, `bcryptjs`, `prisma`, `next`, `vitest`) используют актуальные стабильные версии без известных уязвимостей (RCE, Prototype Pollution).

### A07: Identification and Authentication Failures (Сбои идентификации)
- Защита от подделки сессии: сессионные токены проверяются криптографически на каждом обращении. При изменении хотя бы одного байта токена библиотека `jose` отбрасывает его и возвращает `null`.

### A08: Software and Data Integrity Failures (Нарушение целостности данных)
- Проверка вебхуков платежей защищена секретным ключом `MOCK_PAYMENT_SECRET`. Вебхук с поддельной или пустой подписью гарантированно отвергается с ошибкой `400 Bad Request`.

### A09: Security Logging and Monitoring Failures (Недостаточное логирование)
- Все критические бизнес-события регистрируются в аудит-логе `AuditLog`:
  * Финализация оценки жюри (`EVALUATION_FINALIZED`)
  * Назначение жюри администратором (`JURY_ASSIGNED`)
  * Подтверждение платежа (`PAYMENT_CONFIRMED`)
  * Подтверждение выплаты средств (`PAYOUT_CONFIRMED`)
  * Массовый расчет наград (`RESULTS_CALCULATED`)

### A10: Server-Side Request Forgery (SSRF)
- Сервер не выполняет произвольных сетевых запросов по переданным пользователем URL. Ссылки на видеозаписи (YouTube / Rutube / VK) парсятся строго по регулярным выражениям идентификаторов видео на клиенте в компоненте `ProtectedVideoPlayer`.

---

## 3. Защита несовершеннолетних и персональных данных (152-ФЗ / GDPR)

```mermaid
classDiagram
    class ApplicationEntity {
        +String participantName [PII]
        +DateTime birthDate [PII]
        +String parentFullName [PII]
        +String parentPhone [PII]
        +String parentEmail [PII]
        +String schoolName [PII]
        +String teacherName [PII]
        +String repertoire [Public]
        +String videoUrl [Protected]
        +String code [Public]
    }

    class JuryViewProjection {
        +String applicationId
        +String code
        +String nominationTitle
        +String ageCategoryTitle
        +String repertoire
        +String videoUrl
        +Boolean hasEvaluation
        +EvaluationDraft evaluationDraft
    }

    ApplicationEntity ..> JuryViewProjection : Sanitized via Blind Audition Layer
```

### 3.1. Дифференциация и независимость родительских согласий
В соответствии с нормами 152-ФЗ, ст. 152.1 ГК РФ и GDPR произведено строгое разграничение:
1. `consentDataProcess: true` — **Обязательное согласие** законного представителя на сбор и обработку персональных данных ребенка для судейства и выдачи дипломов. При отсутствии или значении `false` сервер возвращает `400 Bad Request`.
2. `consentPublicStream: boolean` — **Отдельное необязательное согласие** на открытую трансляцию выступления в публичном стриме. Отказ от публичного стрима (`consentPublicStream: false`) **не препятствует** подаче заявки и закрытой оценке членами жюри.

### 3.2. Архитектура «Слепого прослушивания»
- В эндпоинтах `GET /api/jury/applications` и `GET /api/applications/[id]` (при роли `JURY`):
  * Поля `participantName`, `parentFullName`, `parentEmail`, `parentPhone`, `birthDate`, `teacherName`, `institution` **физически исключены** из JSON-объекта ответа.
  * Член жюри видит только: уникальный шифр (например, `EXP-2026-1004`), номинацию, возрастную категорию, исполняемый репертуар и защищенный видеопоток.

### 3.3. Безопасность видеоматериалов
- Ссылки на конкурсные видео не отдаются в открытом неавторизованном виде.
- Публичный эндпоинт верификации дипломов `/api/public/verify-certificate/[token]` отдает только подтверждение подлинности награды и не раскрывает исходные видеозаписи, телефоны или email родителей.
- Видеопроигрыватель `ProtectedVideoPlayer`:
  * Блокирует контекстное скачивание (`controlsList="nodownload"`).
  * Накладывает динамический полупрозрачный водяной знак с кодом заявки.
  * Оснащен кнопкой «Слепое прослушивание» (`isBlindMode`), позволяющей жюри оценивать чистоту интонирования и вокала без визуального восприятия участника.

---

## 4. Финансовая безопасность, идемпотентность и Ledger

### 4.1. Идемпотентность вебхуков (Anti-Replay Protection)
- При поступлении вебхука от платежного шлюза система проверяет статус исходной транзакции:
  ```typescript
  if (existingTx.status === "CONFIRMED") {
    return {
      received: true,
      status: "ALREADY_PROCESSED",
      message: "Transaction has already been processed and confirmed",
    };
  }
  ```
- Даже при повторных сетевых вызовах (retry delivery шлюза) комиссия преподавателю **никогда не начисляется повторно**.
- Дополнительно встроен защитный барьер от повторного начисления по нескольким транзакциям одной заявки:
  ```typescript
  const existingCommission = await tx.ledgerTransaction.findFirst({
    where: {
      applicationId: existingTx.applicationId,
      type: "COMMISSION_ACCRUAL",
      status: "CONFIRMED",
    },
  });
  if (teacherProfile && !existingCommission) { ... }
  ```

### 4.2. Расчет партнерской комиссии
- Комиссия рассчитывается строго по фиксированной ставке 20% (`commissionRate = 0.20`) от фактически поступившей суммы оргвзноса:
  $$\text{Commission} = \text{round}(\text{Amount} \times 0.20)$$
- Начисление комиссии сопровождается записью в финансовый гроссбух `LedgerTransaction` со статусом `CONFIRMED`.

### 4.3. Защита баланса от овердрафта и состояние выплат
- При создании заявки на вывод средств (`POST /api/teacher/payouts`):
  * Проверяется минимальный порог вывода (не менее 1 000 ₽).
  * Внутри атомарной транзакции `prisma.$transaction` выполняется повторное чтение баланса (`tx.teacherProfile.findUnique`) для предотвращения состояния гонки (Race Condition) при параллельных запросах.
  * Если `currentTeacher.balance < payoutAmount`, транзакция прерывается с ошибкой и статус 400.
  * Списание баланса происходит атомарно с созданием запроса на выплату (`payoutRequest`) и проводкой со знаком минус (`amount: -payoutAmount`) в `LedgerTransaction`.
- Повторное подтверждение выплаты администратором заблокировано проверкой `payout.status === "COMPLETED"` (400 Bad Request).

---

## 5. Матрица ролевого разграничения доступа (RBAC Matrix)

| Эндпоинт / Действие | Anonymous | PARTICIPANT | TEACHER | JURY | ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| `POST /api/auth/register` | ✅ 201 | ❌ 400 | ❌ 400 | ❌ 400 | ❌ 400 |
| `POST /api/auth/login` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `GET /api/public/competitions` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `GET /api/public/verify-certificate/*` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `POST /api/applications` | ❌ 401 | ✅ 201 | ❌ 403 | ❌ 403 | ✅ 201 |
| `GET /api/applications` | ❌ 401 | Свои заявки | Заявки учеников | Назначенные (без ПДн) | Все заявки |
| `GET /api/applications/[id]` | ❌ 401 | Своя заявка | Своя заявка | Назначенная (без ПДн) | Любая |
| `PUT /api/applications/[id]` | ❌ 401 | Своя (DRAFT) | ❌ 403 | ❌ 403 | Любая |
| `DELETE /api/applications/[id]` | ❌ 401 | Своя (DRAFT) | ❌ 403 | ❌ 403 | Любая |
| `GET /api/jury/applications` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Назначенные | ✅ 200 |
| `POST /api/jury/evaluations` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Только назначенная | ✅ 200 |
| `POST /api/teacher/payouts` | ❌ 401 | ❌ 403 | ✅ Свой баланс | ❌ 403 | ✅ 201 |
| `GET /api/admin/overview` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `POST /api/admin/calculate-results` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `POST /api/admin/applications/*/assign-jury` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| `POST /api/admin/payouts/*/confirm` | ❌ 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |

---

## 6. Журнал устраненных уязвимостей и доработок

1. **Elimination of Fallback JWT Secret & Strict Validation:**
   - *Проблема:* В `lib/auth.ts` присутствовал статический ключ `DEFAULT_JWT_SECRET`.
   - *Решение:* Фоллбэк-секрет полностью удален. Реализована строгая валидация `validateJwtSecret()` с проверкой наличия, длины ≥ 32 символов и fail-fast при старте в `NODE_ENV === "production"`. Обновлен `.env.example`.
2. **Elimination of Client-Side Auth Bypass:**
   - *Проблема:* На `app/(public)/login/page.tsx` при ошибках API или сети срабатывал редирект через `setTimeout`, а демо-вход работал без сессии.
   - *Решение:* Удален клиентский обход; при 401 выводится ошибка без редиректа. Демо-вход переведен на реальный `POST /api/auth/login`.
3. **Teacher PII & Financial Isolation:**
   - *Проблема:* В `GET /api/applications/[id]` объект `referralTeacher` раскрывал участнику `bankDetails`, `balance` и `userId` педагога.
   - *Решение:* Внедрен строгий DTO `select` (`id`, `referralCode`, `organization`); финансовые и системные данны не запрашиваются и не отдаются.
4. **Webhook Amount & Currency Verification (Anti-Tampering):**
   - *Проблема:* В `lib/payment-gateway.ts` не проверялась сумма и валюта вебхука с исходной транзакцией.
   - *Решение:* Реализована жесткая сверка `amount`, `currency` и `applicationId`. При несовпадении вебхук отклоняется с 400 Bad Request, комиссия не начисляется.
5. **Parental Consent Differentiation (152-ФЗ vs Public Stream):**
   - *Проблема:* Отказ от публичного стрима блокировал подачу заявки.
   - *Решение:* `consentDataProcess` (152-ФЗ) сделано обязательным, `consentPublicStream` — опциональным. Закрытая оценка жюри не блокируется.
6. **Automated Security Test Suite Expansion:**
   - *Решение:* В `tests/backend/security-audit.test.ts` и `tests/backend/auth.test.ts` добавлены тесты на изоляцию реквизитов педагога, отказ при неверной сумме вебхука, дифференциацию согласий и длину `JWT_SECRET` (60 из 60 тестов успешны).

---

## 7. Заключение аудита

Архитектура платформы **espressivo ART** соответствует строгим стандартам корпоративной и правовой безопасности. Риски утечки ПДн несовершеннолетних, финансовых коллизий, несанкционированного изменения оценок и эскалации привилегий надежно локализованы и полностью защищены автоматизированными регрессионными тестами.
