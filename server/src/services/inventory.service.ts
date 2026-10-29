import { BloodGroup, RequestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BAG_CAPACITY_UNITS,
  BLOOD_GROUPS,
  CRITICAL_UNIT_THRESHOLD,
  GROUP_LABEL,
  litresFromUnits,
  RECEIVE_FROM,
} from "../domain/blood";

export type GroupStock = {
  group: BloodGroup;
  label: string;
  units: number;
  litres: number;
  critical: boolean;
  fillPercent: number;
};

/** Remaining banked units = collected donations minus fulfilled request draws. */
export async function computeStock(): Promise<GroupStock[]> {
  const [donations, fulfilled] = await Promise.all([
    prisma.donation.groupBy({
      by: ["bloodGroup"],
      _sum: { units: true },
    }),
    prisma.bloodRequest.groupBy({
      by: ["bloodGroup"],
      where: { status: RequestStatus.FULFILLED },
      _sum: { unitsRequested: true },
    }),
  ]);

  const donated = new Map(donations.map((d) => [d.bloodGroup, d._sum.units ?? 0]));
  const drawn = new Map(fulfilled.map((d) => [d.bloodGroup, d._sum.unitsRequested ?? 0]));

  return BLOOD_GROUPS.map((group) => {
    const units = Math.max(0, (donated.get(group) ?? 0) - (drawn.get(group) ?? 0));
    return {
      group,
      label: GROUP_LABEL[group],
      units,
      litres: litresFromUnits(units),
      critical: units < CRITICAL_UNIT_THRESHOLD,
      fillPercent: Math.min(100, Math.round((units / BAG_CAPACITY_UNITS) * 100)),
    };
  });
}

export async function dashboardPayload() {
  const [stock, donorCount, pendingRequests, activity] = await Promise.all([
    computeStock(),
    prisma.donor.count({ where: { isActive: true } }),
    prisma.bloodRequest.count({ where: { status: RequestStatus.PENDING } }),
    prisma.activityEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  const totalUnits = stock.reduce((sum, row) => sum + row.units, 0);
  const criticalGroups = stock.filter((row) => row.critical).map((row) => row.label);

  return {
    totals: {
      totalUnits,
      totalLitres: litresFromUnits(totalUnits),
      registeredDonors: donorCount,
      pendingRequests,
    },
    stock,
    criticalBanner:
      criticalGroups.length > 0
        ? `Critical stock: ${criticalGroups.join(", ")}. Ask eligible donors to donate soon.`
        : null,
    activity,
  };
}

export async function compatibilityFor(recipient: BloodGroup) {
  const stock = await computeStock();
  const byGroup = new Map(stock.map((s) => [s.group, s]));
  const donors = RECEIVE_FROM[recipient].map((group) => byGroup.get(group)!);
  return {
    recipient,
    label: GROUP_LABEL[recipient],
    canReceiveFrom: donors,
  };
}
