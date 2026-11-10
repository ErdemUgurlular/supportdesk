import "server-only";

import { createHash } from "node:crypto";
import pool from "@/lib/db";

// =========================================
// BLOOM FILTER CONFIGURATION
// =========================================

const EXPECTED_EMAILS = 100_000;
const FALSE_POSITIVE_RATE = 0.01;

// =========================================
// BLOOM FILTER CLASS
// =========================================

class BloomFilter {
  constructor(expectedItems, falsePositiveRate) {
    this.bitSize = Math.ceil(
      (-expectedItems * Math.log(falsePositiveRate)) /
      (Math.LN2 * Math.LN2)
    );

    this.hashCount = Math.max(
      1,
      Math.round((this.bitSize / expectedItems) * Math.LN2)
    );

    this.bits = new Uint8Array(Math.ceil(this.bitSize / 8));
  }

  getHashes(value) {
    const digest = createHash("sha256")
      .update(value)
      .digest();

    const hash1 = digest.readUInt32BE(0);
    const hash2 = (digest.readUInt32BE(4) | 1) >>> 0;

    return { hash1, hash2 };
  }

  add(value) {
    const { hash1, hash2 } = this.getHashes(value);

    for (let i = 0; i < this.hashCount; i++) {
      const index =
        (hash1 + i * hash2) % this.bitSize;

      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;

      this.bits[byteIndex] |= 1 << bitIndex;
    }
  }

  mightContain(value) {
    const { hash1, hash2 } = this.getHashes(value);

    for (let i = 0; i < this.hashCount; i++) {
      const index =
        (hash1 + i * hash2) % this.bitSize;

      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;

      const bitIsSet =
        (this.bits[byteIndex] & (1 << bitIndex)) !== 0;

      if (!bitIsSet) {
        return false;
      }
    }

    return true;
  }
}

// =========================================
// SHARED SERVER-SIDE INSTANCE
// =========================================

const globalForBloom = globalThis;

const bloomState =
  globalForBloom.supportDeskEmailBloom ??= {
    filter: new BloomFilter(
      EXPECTED_EMAILS,
      FALSE_POSITIVE_RATE
    ),
    initialized: false,
    initializationPromise: null,
  };

// =========================================
// NORMALIZE EMAIL
// =========================================

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// =========================================
// INITIALIZE FROM POSTGRESQL
// =========================================

async function initializeBloomFilter() {
  if (bloomState.initialized) {
    return;
  }

  if (!bloomState.initializationPromise) {
    bloomState.initializationPromise = pool
      .query("SELECT email FROM public.users")
      .then(({ rows }) => {
        for (const row of rows) {
          bloomState.filter.add(normalizeEmail(row.email));
        }

        bloomState.initialized = true;
      })
      .catch((error) => {
        bloomState.initializationPromise = null;
        throw error;
      });
  }

  await bloomState.initializationPromise;
}

// =========================================
// CHECK EMAIL
// =========================================

export async function emailMayExist(email) {
  await initializeBloomFilter();

  return bloomState.filter.mightContain(
    normalizeEmail(email)
  );
}

// =========================================
// ADD NEW EMAIL
// =========================================

export function rememberEmail(email) {
  bloomState.filter.add(normalizeEmail(email));
}