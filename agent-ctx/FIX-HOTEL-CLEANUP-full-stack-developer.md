# FIX-HOTEL-CLEANUP — Work Record

**Task ID:** FIX-HOTEL-CLEANUP
**Agent:** full-stack-developer
**Task:** Fix hotel module dead code, translations, and debounce skip-on-mount issues

> Previous agents' work records can be viewed in `/agent-ctx/` directory.

## Files Modified

1. `src/components/hotel/check-in-list.tsx`
   - Removed dead imports `PAYMENT_METHOD_LABELS` and `type SaaSPayment` from `@/lib/super-admin/payments`
   - Kept `PAYMENT_METHOD_OPTIONS` (actually used in Select dropdown)

2. `src/components/hotel/check-out-list.tsx`
   - Removed unused `FileText` import from lucide-react
   - Removed `invoiceUrl` state declaration and its `setInvoiceUrl(null)` call in `openDialog`
   - Removed import block from `@/lib/super-admin/payments` to decouple hotel module from super-admin
   - Defined local `PAYMENT_METHOD_OPTIONS` const (used in the payment-method Select)

3. `src/components/hotel/housekeeping-list.tsx`
   - Fixed French/English mix typo in dialog description:
     "qui needs être nettoyée" → "qui doit être nettoyée"

4. `src/components/hotel/settings-form.tsx`
   - Removed unused `type` state (only `typeSelect` is used in change-detection and save logic)

5. `src/components/hotel/guests-list.tsx`
   - Added `useRef` skip pattern (`isFirstRender`) for the first debounce effect
     so `router.push` is not triggered on mount

6. `src/components/hotel/reports-view.tsx`
   - Added `useRef` skip pattern for the first period effect

7. `src/components/hotel/reservations-list.tsx`
   - Removed unused `const searchParams = useSearchParams()` declaration
   - Removed `useSearchParams` from `next/navigation` import
   - Added `useRef` skip pattern for the debounce effect

## Verification

- `bun run lint` → **0 errors**, 0 warnings
- All existing functionality preserved (no behavioral changes to data flows,
  only removed dead code, fixed a translation, and skipped first-mount router push)

## Stage Summary

- Hotel module no longer couples to `@/lib/super-admin/payments` for dead code
- `check-out-list` is now fully decoupled (defines its own `PAYMENT_METHOD_OPTIONS`)
- All 3 debounce/period effects (guests, reports, reservations) now skip the
  initial mount → no spurious `router.push` on first render (prevents loss of
  server-provided initial params and avoids double network requests)
- All changes are minimal and surgical — no working code was refactored
