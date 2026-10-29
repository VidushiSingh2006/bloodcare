import { BloodGroup } from "@prisma/client";

export const UNIT_ML = 450;
export const COOLDOWN_DAYS = 90;
export const CRITICAL_UNIT_THRESHOLD = 3;
export const BAG_CAPACITY_UNITS = 12;

export const BLOOD_GROUPS: BloodGroup[] = [
  BloodGroup.A_POS,
  BloodGroup.A_NEG,
  BloodGroup.B_POS,
  BloodGroup.B_NEG,
  BloodGroup.O_POS,
  BloodGroup.O_NEG,
  BloodGroup.AB_POS,
  BloodGroup.AB_NEG,
];

export const GROUP_LABEL: Record<BloodGroup, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  O_POS: "O+",
  O_NEG: "O-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
};

/** Recipients listed here may accept units from the donor groups in the array. */
export const RECEIVE_FROM: Record<BloodGroup, BloodGroup[]> = {
  A_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS],
  A_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG],
  B_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.B_NEG, BloodGroup.B_POS],
  B_NEG: [BloodGroup.O_NEG, BloodGroup.B_NEG],
  O_POS: [BloodGroup.O_NEG, BloodGroup.O_POS],
  O_NEG: [BloodGroup.O_NEG],
  AB_POS: BLOOD_GROUPS,
  AB_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.AB_NEG],
};

export function litresFromUnits(units: number): number {
  return Number(((units * UNIT_ML) / 1000).toFixed(2));
}

export function labelToGroup(label: string): BloodGroup | null {
  const found = (Object.entries(GROUP_LABEL) as [BloodGroup, string][]).find(
    ([, value]) => value === label || value === label.replace(" ", "")
  );
  return found ? found[0] : null;
}

export function daysUntilEligible(lastDonationAt: Date | null): { eligible: boolean; waitDays: number } {
  if (!lastDonationAt) return { eligible: true, waitDays: 0 };
  const reopen = new Date(lastDonationAt);
  reopen.setDate(reopen.getDate() + COOLDOWN_DAYS);
  const diffMs = reopen.getTime() - Date.now();
  const waitDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return { eligible: waitDays === 0, waitDays };
}
