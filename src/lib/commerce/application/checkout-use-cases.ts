import {
  checkoutCommandSchema,
  type CheckoutCommand,
} from "@/lib/commerce/domain/contracts";
import { SupabaseCommerceRepository } from "@/lib/commerce/adapters/supabase-commerce-repository";

export class CheckoutUseCases {
  constructor(private readonly repository = new SupabaseCommerceRepository()) {}

  checkoutReservedCart(command: CheckoutCommand) {
    return this.repository.checkout(checkoutCommandSchema.parse(command));
  }
}
