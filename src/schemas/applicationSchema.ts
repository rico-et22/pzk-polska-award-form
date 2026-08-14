import { z } from "zod/v4";

export const BANDS = [
  "160m",
  "80m",
  "40m",
  "30m",
  "20m",
  "17m",
  "15m",
  "12m",
  "10m",
  "6m",
  "2m",
  "70cm",
] as const;

export const MODES = [
  "SSB",
  "CW",
  "FM",
  "DIGI",
  "FT8",
  "FT4",
  "RTTY",
  "PSK",
  "OTHER",
] as const;

export const VOIVODESHIPS = [
  { code: "", name: "---" },
  { code: "D", name: "dolnośląskie" },
  { code: "P", name: "kujawsko-pomorskie" },
  { code: "L", name: "lubelskie" },
  { code: "B", name: "lubuskie" },
  { code: "C", name: "łódzkie" },
  { code: "M", name: "małopolskie" },
  { code: "R", name: "mazowieckie" },
  { code: "U", name: "opolskie" },
  { code: "K", name: "podkarpackie" },
  { code: "O", name: "podlaskie" },
  { code: "F", name: "pomorskie" },
  { code: "G", name: "śląskie" },
  { code: "S", name: "świętokrzyskie" },
  { code: "J", name: "warmińsko-mazurskie" },
  { code: "W", name: "wielkopolskie" },
  { code: "Z", name: "zachodnio-pomorskie" },
] as const;

export const CATEGORIES = [
  "junior",
  "mixed",
  "phone",
  "cw",
  "digi",
  "160m",
  "80m",
  "40m",
  "30m",
  "20m",
  "17m",
  "15m",
  "12m",
  "10m",
  "6m",
  "2m",
] as const;
export const AWARD_CLASSES = ["new", "class3", "class2", "class1"] as const;

export const qsoRowSchema = z.object({
  callsign: z.string().regex(/^[A-Za-z0-9/]+$/, "invalidCallsign"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate"),
  band: z.enum(BANDS),
  mode: z.enum(MODES),
  voivodeship: z.string().optional(),
  remarks: z.string().optional(),
});

export const applicationSchema = z
  .object({
    callsign: z.string().min(3, "invalidCallsign"),
    exCalls: z.string().default(""),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    address1: z.string().min(5),
    address2: z.string().default(""),
    city: z.string().min(2),
    postcode: z.string().min(2),
    telephone: z.string().default(""),
    email: z.string().email("invalidEmail").or(z.literal("")).default(""),
    issueTo1: z.string().min(2),
    issueTo2: z.string().default(""),
    previousEdition: z.boolean().default(false),
    pzkMember: z.enum(["yes", "no"], { message: "required" }),
    feeAmount: z.string().optional(),
    feeAmountEur: z.string().optional(),
    feeAmountUsd: z.string().optional(),
    feeAmountIrc: z.string().optional(),
    feeAmountOther: z.string().optional(),
    qthLocator: z
      .string()
      .min(6)
      .refine((val) => /^[A-Ra-r]{2}[0-9]{2}[A-Xa-x]{2}$/.test(val), {
        message: "invalidLocator",
      }),
    ituZone: z.string().min(1),
    cqZone: z.string().min(1),
    applyFor: z.enum(["new", "sticker"], { message: "applyForRequired" }),
    gcr1Name: z.string().default(""),
    gcr1Callsign: z.string().default(""),
    gcr2Name: z.string().default(""),
    gcr2Callsign: z.string().default(""),
    spDxContestYear: z.string().optional(),
    spDxRttyContestYear: z.string().optional(),
    selections: z.array(z.string()).min(1, "selectCategory"),
    contacts: z.array(qsoRowSchema).min(1, "minRows"),
    confirmation: z.literal(true, { message: "required" }),
  })
  .superRefine((data, ctx) => {
    const hasPayment = !!(
      data.feeAmount ||
      data.feeAmountEur ||
      data.feeAmountUsd ||
      data.feeAmountIrc ||
      data.feeAmountOther
    );
    if (!hasPayment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "paymentRequired",
        path: ["feeAmount"],
      });
    }
  });

export type QsoRow = z.infer<typeof qsoRowSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
