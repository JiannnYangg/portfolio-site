/**
 * Where the contact popup sends what the visitor typed.
 *
 * PLACEHOLDER: nothing is saved or sent anywhere yet. It only waits a moment
 * so the popup can show its "sending" state, then reports success.
 *
 * Next session: replace the body of this function with the Supabase insert
 * (keep the signature and the { ok } result, and throw on failure: the popup
 * already shows a friendly retry message when this rejects).
 *
 * @param {{ name: string, phone: string, email: string }} lead
 * @returns {Promise<{ ok: true }>}
 */
export async function submitLead(lead) {
  void lead;
  await new Promise(resolve => setTimeout(resolve, 900));
  return { ok: true };
}
