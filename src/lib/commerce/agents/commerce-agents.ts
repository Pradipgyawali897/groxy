import { CheckoutUseCases } from "@/lib/commerce/application/checkout-use-cases";
import { ReservationUseCases } from "@/lib/commerce/application/reservation-use-cases";
import type { CheckoutCommand, ReserveBookCommand } from "@/lib/commerce/domain/contracts";

export class LibrarianAgent {
  constructor(private readonly reservations = new ReservationUseCases()) {}

  synchronizeAvailability() {
    return this.reservations.expireStaleReservations();
  }
}

export class BrokerAgent {
  constructor(private readonly reservations = new ReservationUseCases()) {}

  reserveSecondhandBook(command: ReserveBookCommand) {
    return this.reservations.reserveUniqueBook(command);
  }

  releaseSecondhandBook(bookId: string, buyerId: string) {
    return this.reservations.releaseUniqueBook(bookId, buyerId);
  }
}

export class ClerkAgent {
  constructor(private readonly checkout = new CheckoutUseCases()) {}

  runCheckout(command: CheckoutCommand) {
    return this.checkout.checkoutReservedCart(command);
  }
}

export class MarketDirectorAgent {
  readonly broker = new BrokerAgent();
  readonly clerk = new ClerkAgent();
  readonly librarian = new LibrarianAgent();
}
