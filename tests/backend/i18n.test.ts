import { describe, it, expect } from "vitest";
import { dictionaries, Locale, Dictionary } from "@/lib/i18n/dictionaries";

describe("i18n Dictionaries Hardening & Parity Suite", () => {
  const MANDATORY_SECTIONS = [
    "common",
    "nav",
    "statuses",
    "awards",
    "auth",
    "public",
    "dashboard",
    "teacher",
    "jury",
    "admin",
    "validation",
    "errors",
    "checkout",
  ] as const;

  it("should contain exactly ru and en locales", () => {
    const locales = Object.keys(dictionaries);
    expect(locales).toContain("ru");
    expect(locales).toContain("en");
    expect(locales.length).toBe(2);
  });

  it("should contain all 13 mandatory sections in both locales", () => {
    for (const section of MANDATORY_SECTIONS) {
      expect(dictionaries.ru).toHaveProperty(section);
      expect(dictionaries.en).toHaveProperty(section);
    }
  });

  // Recursive validator for structural key parity and non-empty strings
  function validateParity(
    ruObj: Record<string, unknown>,
    enObj: Record<string, unknown>,
    path = ""
  ) {
    const ruKeys = Object.keys(ruObj).sort();
    const enKeys = Object.keys(enObj).sort();

    // Check exact key match
    expect(enKeys, `Keys mismatch at path "${path}"`).toEqual(ruKeys);

    for (const key of ruKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const ruVal = ruObj[key];
      const enVal = enObj[key];

      expect(typeof ruVal, `Type mismatch at "${currentPath}"`).toBe(typeof enVal);

      if (typeof ruVal === "object" && ruVal !== null) {
        validateParity(
          ruVal as Record<string, unknown>,
          enVal as Record<string, unknown>,
          currentPath
        );
      } else {
        expect(typeof ruVal).toBe("string");
        expect(typeof enVal).toBe("string");

        const ruStr = (ruVal as string).trim();
        const enStr = (enVal as string).trim();

        expect(ruStr.length, `Empty RU string at "${currentPath}"`).toBeGreaterThan(0);
        expect(enStr.length, `Empty EN string at "${currentPath}"`).toBeGreaterThan(0);
      }
    }
  }

  it("should achieve 100% recursive key parity between RU and EN without empty strings", () => {
    validateParity(
      dictionaries.ru as unknown as Record<string, unknown>,
      dictionaries.en as unknown as Record<string, unknown>
    );
  });

  it("should not contain untranslated Cyrillic fallback text anywhere in EN dictionary", () => {
    const cyrillicRegex = /[А-Яа-яЁё]/;
    const cyrillicMatches: string[] = [];

    function findCyrillic(node: unknown, path = "") {
      if (typeof node === "object" && node !== null) {
        for (const [key, val] of Object.entries(node)) {
          findCyrillic(val, path ? `${path}.${key}` : key);
        }
      } else if (typeof node === "string") {
        if (cyrillicRegex.test(node)) {
          cyrillicMatches.push(`${path}: "${node}"`);
        }
      }
    }

    findCyrillic(dictionaries.en);

    expect(
      cyrillicMatches,
      `Found untranslated Cyrillic strings in EN dictionary:\n${cyrillicMatches.join("\n")}`
    ).toEqual([]);
  });

  it("should verify total leaf key counts are identical and substantial (>500 keys)", () => {
    function countLeaves(node: unknown): number {
      if (typeof node === "object" && node !== null) {
        return Object.values(node).reduce(
          (acc: number, child) => acc + countLeaves(child),
          0
        );
      }
      return 1;
    }

    const ruCount = countLeaves(dictionaries.ru);
    const enCount = countLeaves(dictionaries.en);

    expect(ruCount).toBe(enCount);
    expect(ruCount).toBeGreaterThan(500);
  });

  describe("5-Role UI & Vocabulary Matrix (RU / EN Parity)", () => {
    it("Role 1: GUEST — Public, auth, regulations, and checkout terms exist in RU and EN", () => {
      for (const loc of ["ru", "en"] as const) {
        const d = dictionaries[loc];
        expect(d.common.siteTitle).toBeTruthy();
        expect(d.common.vocalTitle).toBeTruthy();
        expect(d.common.login).toBeTruthy();
        expect(d.common.register).toBeTruthy();
        expect(d.common.applyNow).toBeTruthy();
        expect(d.nav.competitions).toBeTruthy();
        expect(d.nav.nominations).toBeTruthy();
        expect(d.nav.rules).toBeTruthy();
        expect(d.nav.jury).toBeTruthy();
        expect(d.nav.about).toBeTruthy();
        expect(d.public.hero.ctaApply).toBeTruthy();
        expect(d.checkout.title).toBeTruthy();
        expect(d.checkout.payNowBtn).toBeTruthy();
      }
    });

    it("Role 2: PARTICIPANT — Dashboard, my applications, statuses, and awards exist in RU and EN", () => {
      for (const loc of ["ru", "en"] as const) {
        const d = dictionaries[loc];
        expect(d.common.participant).toBeTruthy();
        expect(d.nav.myApplications).toBeTruthy();
        expect(d.nav.newApplication).toBeTruthy();
        expect(d.dashboard.title).toBeTruthy();
        expect(d.dashboard.wizard.participantInfoTitle).toBeTruthy();
        expect(d.dashboard.wizard.repertoireTitle).toBeTruthy();
        expect(d.dashboard.wizard.guardianConsentCheckbox).toBeTruthy();
        // Statuses
        expect(d.statuses.DRAFT).toBeTruthy();
        expect(d.statuses.SUBMITTED).toBeTruthy();
        expect(d.statuses.PAID).toBeTruthy();
        expect(d.statuses.UNDER_REVIEW).toBeTruthy();
        expect(d.statuses.EVALUATED).toBeTruthy();
        expect(d.statuses.COMPLETED).toBeTruthy();
        // Awards
        expect(d.awards.GRAND_PRIX).toBeTruthy();
        expect(d.awards.LAUREATE_1).toBeTruthy();
        expect(d.awards.LAUREATE_2).toBeTruthy();
        expect(d.awards.LAUREATE_3).toBeTruthy();
        expect(d.awards.DIPLOMANT).toBeTruthy();
        expect(d.awards.PARTICIPANT).toBeTruthy();
      }
    });

    it("Role 3: TEACHER — Referral portal, 20% commission, and payout management exist in RU and EN", () => {
      for (const loc of ["ru", "en"] as const) {
        const d = dictionaries[loc];
        expect(d.common.teacher).toBeTruthy();
        expect(d.teacher.title).toBeTruthy();
        expect(d.teacher.partnerProgramTitle).toBeTruthy();
        expect(d.teacher.commissionRateBadge).toContain("20%");
        expect(d.teacher.referralCodeLabel).toBeTruthy();
        expect(d.teacher.payout.requestPayoutBtn).toBeTruthy();
        expect(d.teacher.payout.availableBalance).toBeTruthy();
      }
    });

    it("Role 4: JURY — Blind audition, scoring criteria, and evaluation queue exist in RU and EN", () => {
      for (const loc of ["ru", "en"] as const) {
        const d = dictionaries[loc];
        expect(d.common.jury).toBeTruthy();
        expect(d.jury.title).toBeTruthy();
        expect(d.jury.blindModeNotice).toBeTruthy();
        expect(d.jury.evaluationQueueTitle).toBeTruthy();
        expect(d.jury.terminal.criterion1Title).toBeTruthy();
        expect(d.jury.terminal.criterion2Title).toBeTruthy();
        expect(d.jury.terminal.criterion3Title).toBeTruthy();
        expect(d.jury.terminal.criterion4Title).toBeTruthy();
      }
    });

    it("Role 5: ADMIN — Overview, user management, and financial control exist in RU and EN", () => {
      for (const loc of ["ru", "en"] as const) {
        const d = dictionaries[loc];
        expect(d.common.admin).toBeTruthy();
        expect(d.admin.title).toBeTruthy();
        expect(d.admin.kpi.grossRevenue).toBeTruthy();
        expect(d.admin.competitions.createSeasonBtn).toBeTruthy();
        expect(d.admin.moderation.title).toBeTruthy();
        expect(d.admin.results.title).toBeTruthy();
      }
    });
  });
});
