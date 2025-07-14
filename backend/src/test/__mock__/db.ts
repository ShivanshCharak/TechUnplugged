import { PrismaClient } from "@prisma/client/edge";
import { beforeEach } from "vitest";
import {mockDeep, mockReset} from 'vitest-mock-extended'

export const prisma= mockDeep<PrismaClient>()

