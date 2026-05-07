import {
  reserveBookCommandSchema,
  type ReserveBookCommand,
} from "@/lib/commerce/domain/contracts";
import { SupabaseCommerceRepository } from "@/lib/commerce/adapters/supabase-commerce-repository";

export class ReservationUseCases {
  constructor(private readonly repository = new SupabaseCommerceRepository()) {}

  reserveUniqueBook(command: ReserveBookCommand) {
    return this.repository.reserveBook(reserveBookCommandSchema.parse(command));
  }

  releaseUniqueBook(bookId: string, buyerId: string) {
    return this.repository.releaseBook(bookId, buyerId);
  }

  expireStaleReservations() {
    return this.repository.expireReservations();
  }
}
