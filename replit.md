# POS System - Offline-First Point of Sale

## Overview
A complete offline-first POS (Point of Sale) web application with end-to-end encryption using Web Crypto API. All data is stored encrypted in localStorage with PBKDF2 + AES-GCM-256 encryption.

## Project Status
**Current Phase:** Frontend Complete, Backend Integration Pending

### Recent Changes (Task 1 - Schema & Frontend)
- ✅ Implemented complete data schema for Products, Categories, Bills, Settings, Tokens
- ✅ Built Web Crypto utilities with PBKDF2 (150,000 iterations) + AES-GCM encryption
- ✅ Created encrypted storage hooks for all data types
- ✅ Implemented unlock/authentication flow with fixed master password
- ✅ Built all pages: Dashboard, Billing, Products, Categories, Settings
- ✅ Created invoice modal with A4/58mm/80mm print layouts
- ✅ Responsive design for desktop and mobile
- ✅ Navigation components (desktop header + mobile bottom tabs)

## Master Password
**Fixed Master Password:** `0905`
- Uses deterministic salt for cross-device unlock
- Password is never stored as plaintext
- Only derived key verifier is stored in localStorage

## Architecture

### Tech Stack
- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Routing:** Wouter
- **State:** React Query + Context API
- **Encryption:** Web Crypto API (PBKDF2 + AES-GCM-256)
- **Storage:** localStorage (all data encrypted at rest)
- **PDF Generation:** html2pdf.js
- **Date Utilities:** date-fns
- **No Backend:** Fully offline, no server required

### Key Features
1. **One-time unlock** with master password "0905"
2. **Product Management** - Add/edit/delete products with categories
3. **Category Management** - Organize products
4. **Billing System** - Desktop split-view, mobile tabbed interface
5. **Dashboard** - Sales statistics with date filters
6. **Invoice Generation** - Multiple print layouts (A4, 58mm, 80mm receipt)
7. **Token System** - Daily auto-reset bill numbering
8. **Settings Panel** - Shop info, GST config, print settings
9. **Encrypted Backup** - Export/import with merge or overwrite
10. **Data Wipe** - Factory reset functionality

### Data Model
```typescript
Product: id, name, price, categoryId, addCount
Category: id, name
Bill: id, dateISO, items[], subtotal, discount, gst, total, token
Settings: shopName, address, gstOn, gstPercent, tokenVisible, printLayout
TokenCounter: date, count
```

### Encryption Specification
- **Algorithm:** PBKDF2-HMAC-SHA256 + AES-GCM-256
- **Iterations:** 150,000
- **Salt:** Fixed deterministic (enables cross-device unlock)
- **IV:** Random 12 bytes per encryption
- **Key Derivation:** Password → PBKDF2 → AES-GCM key
- **Verifier:** Derived key exported to base64 and stored

### LocalStorage Keys
- `pos_salt` - Base64 salt (fixed deterministic)
- `pos_kdf_iter` - KDF iteration count
- `pos_key_hash` - Key verifier (base64)
- `pos_activated` - Activation flag
- `pos_products` - Encrypted products { ct, iv, ts }
- `pos_categories` - Encrypted categories
- `pos_bills` - Encrypted bills
- `pos_settings` - Encrypted settings
- `pos_tokens` - Encrypted token counter

## File Structure

### Core Utilities
- `client/src/utils/crypto.ts` - Web Crypto API helpers
- `client/src/utils/storage.ts` - LocalStorage key management
- `client/src/hooks/useAuth.tsx` - Authentication context
- `client/src/hooks/useEncryptedStorage.tsx` - Encrypted data hooks

### Pages
- `client/src/pages/unlock.tsx` - Master password entry
- `client/src/pages/dashboard.tsx` - Sales statistics & bills
- `client/src/pages/billing.tsx` - POS billing interface
- `client/src/pages/products.tsx` - Product management
- `client/src/pages/categories.tsx` - Category management
- `client/src/pages/settings.tsx` - App configuration

### Components
- `client/src/components/layout/navigation.tsx` - Desktop & mobile nav
- `client/src/components/invoice-modal.tsx` - Invoice preview & print

### Schema
- `shared/schema.ts` - TypeScript types and Zod schemas

## User Workflows

### First-Time Setup
1. Open app → Unlock screen appears
2. Enter master password: `0905`
3. System derives encryption key and stores verifier
4. App unlocks and shows dashboard
5. Navigate to Categories → Add categories
6. Navigate to Products → Add products
7. Navigate to Settings → Configure shop details

### Billing Flow
1. Navigate to Billing
2. Browse/search products
3. Click products to add to cart
4. Adjust quantities, add discount
5. Click Checkout → Bill saved and invoice shown
6. Print or download PDF invoice

### Dashboard
1. View sales statistics
2. Filter by period (Today, Yesterday, This Month, etc.)
3. Click bills to view invoices

### Backup & Restore
1. Settings → Export Encrypted Backup
2. Downloads encrypted JSON file
3. To restore: Import → Select file → Choose merge/overwrite
4. Enter master password to decrypt (uses in-memory key)

## Security Features

### Encryption at Rest
- All sensitive data encrypted before localStorage storage
- Encryption key never persisted (only in-memory)
- Key verifier for password validation

### Cross-Device Unlock
- Fixed deterministic salt enables same password across devices
- Enter "0905" on any device to unlock
- Data must be transferred via encrypted backup export/import

### No Network Required
- Completely offline application
- No API calls or external dependencies
- All processing happens client-side

## Development Guidelines

### Adding New Features
1. Update schema in `shared/schema.ts` if needed
2. Add encrypted storage hook in `useEncryptedStorage.tsx`
3. Create/update page components
4. Ensure all data operations use encrypted storage

### Testing Encryption
1. Open browser DevTools → Application → Local Storage
2. Verify all data keys contain `{ ct, iv, ts }` objects
3. Ciphertext should be base64 and unreadable
4. Test backup export/import flow

### Backup Format
```json
{
  "version": 1,
  "exportDate": "ISO timestamp",
  "data": {
    "products": [...],
    "categories": [...],
    "bills": [...],
    "settings": {...},
    "tokens": {...}
  }
}
```
Entire backup object is encrypted with AES-GCM before download.

## Next Steps
1. **Task 2:** Backend integration (localStorage persistence layer implementation)
2. **Task 3:** Integration testing, token generation logic, backup merge functionality
3. **Final:** End-to-end testing of all features

## Troubleshooting

### "Invalid master password" on first unlock
- The fixed password is exactly: `0905`
- Check for extra spaces or different characters

### Data not persisting
- Ensure browser allows localStorage
- Check browser DevTools console for encryption errors
- Verify crypto key is in memory (check useAuth context)

### Backup import fails
- Ensure file is from same master password encryption
- File must be valid encrypted JSON format
- Check console for decryption errors

### App won't unlock after clearing browser data
- This is expected behavior
- Enter `0905` again to re-initialize
- Import previous backup to restore data
