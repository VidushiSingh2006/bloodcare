import { ActivityKind } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function recordActivity(kind: ActivityKind, message: string) {
  await prisma.activityEvent.create({ data: { kind, message } });
}
