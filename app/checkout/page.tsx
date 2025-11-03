import { getDibsyPublicKey } from "@/app/actions/dibsy-actions"
import CheckoutClient from "./checkout-client"

export default async function CheckoutPage() {
  const dibsyPublicKey = await getDibsyPublicKey()

  return <CheckoutClient dibsyPublicKey={dibsyPublicKey} />
}
