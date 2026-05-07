import "server-only";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReservationUseCases } from "@/lib/commerce/application/reservation-use-cases";

const workerNameSchema = z.enum([
  "ReservationWorker",
  "CartExpirationWorker",
  "CheckoutVerifierWorker",
  "SearchIndexWorker",
  "InvoiceWorker",
  "SellerSyncWorker",
]);

type WorkerName = z.infer<typeof workerNameSchema>;

export class CommerceWorker {
  constructor(readonly name: WorkerName) {}

  async selfRegister() {
    const supabase = await createSupabaseServerClient();
    await supabase.from("commerce_worker_heartbeats").upsert({
      worker_name: this.name,
      status: "registered",
      heartbeat_at: new Date().toISOString(),
    });
  }

  async heartbeat(status = "alive") {
    const supabase = await createSupabaseServerClient();
    await supabase.from("commerce_worker_heartbeats").upsert({
      worker_name: this.name,
      status,
      heartbeat_at: new Date().toISOString(),
    });
  }

  async audit(eventType: string, payload: Record<string, unknown>) {
    const supabase = await createSupabaseServerClient();
    await supabase.from("commerce_audit_events").insert({
      event_type: eventType,
      payload,
    });
  }
}

export class ReservationWorker extends CommerceWorker {
  constructor(private readonly reservations = new ReservationUseCases()) {
    super("ReservationWorker");
  }

  async runOnce() {
    await this.selfRegister();
    const expiredCount = await this.reservations.expireStaleReservations();
    await this.audit("RESERVATION_WORKER_RAN", { expiredCount });
    await this.heartbeat("idle");
    return { expiredCount };
  }
}

export const spawnableCommerceWorkers = [
  "ReservationWorker",
  "CartExpirationWorker",
  "CheckoutVerifierWorker",
  "SearchIndexWorker",
  "InvoiceWorker",
  "SellerSyncWorker",
] as const;
