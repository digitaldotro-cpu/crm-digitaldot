# TECH_DECISIONS - CRM Digital Dot MVP

## 1. De ce Next.js fullstack (App Router)

Decizie:

- backend-ul de MVP este implementat prin Server Actions + Route Handlers in acelasi repo cu frontend.

Motiv:

- viteza buna de livrare fara a sacrifica separarea logica.
- codul de autorizare si validare ramane server-side, aproape de UI flows.

Tradeoff:

- pe termen lung, daca apar cerinte de integrare extinsa/public API, se poate extrage un backend dedicat (BFF/service).

## 2. Auth custom JWT (vs. framework auth complex)

Decizie:

- sesiune JWT semnata HS256 in cookie HttpOnly, cu verificare in middleware + re-check in server actions.

Motiv:

- control complet pe payload, roluri si redirect pe portal vs intern.
- implementare predictibila pentru RBAC custom project-centric.

Tradeoff:

- responsabilitatea de intretinere revine proiectului (rotation, invalidation strategy etc. in faze viitoare).

## 3. RBAC + Project Membership in query layer

Decizie:

- scope-urile de acces sunt centralizate in `lib/domain/scopes.ts`.
- pentru operatii sensibile se foloseste `assertProjectAccess`.

Motiv:

- evita hardcodare permisiuni in componente disparate.
- reduce riscul de bypass accidental.

## 4. Secrets Vault encryption design

Decizie:

- credentialele externe se stocheaza criptat AES-256-GCM (`encryptedValue`, `iv`, `authTag`).
- parolele de login user sunt hash Argon2id.

Motiv:

- separare clara intre "auth secrets" (hash only) si "external credentials" (encrypt + controlled reveal).

Tradeoff:

- managementul cheii `SECRETS_ENCRYPTION_KEY` devine critic operational.

## 5. Audit strategy

Decizie:

- audit dedicat in tabelul `AuditLog`, separat conceptual de logurile operationale.

Evenimente MVP auditate:

- login success
- create/update membership
- create finance transaction
- create/reveal secret
- create/generate/update document
- approve commission

## 6. Document generation with legal flags

Decizie:

- template-urile includ flags configurabile juridic:
  - `requiresNdaSigned`
  - `includesServiceConfidentialityClause`
  - `includesDisclosurePenaltyClause`

Motiv:

- business/legal logic configurabila fara hardcodare in texte fixe.
- gating oferta dupa NDA semnat este enforce-uit in server action.

## 7. Upload storage in MVP

Decizie:

- upload local filesystem (`UPLOAD_DIR`) prin API route securizat.

Motiv:

- reduce complexitatea MVP.
- modelul `UploadedFile` e pregatit pentru mutare in object storage.

## 8. Why Tailwind + custom component set

Decizie:

- component set intern simplu (`components/ui`) cu look business consistent.

Motiv:

- control vizual clar + dependency footprint minim.

Tradeoff:

- fara design-system enterprise complet in MVP.

## 9. Prisma schema breadth in MVP

Decizie:

- schema include entitatile necesare MVP + fundatie pentru extindere.

Motiv:

- evita migrari disruptive timpurii.
- pastreaza coerenta cross-modul (docs, time, finance, assets, leads).

## 10. Security defaults

- date client-facing sunt ascunse implicit.
- publicarea catre client e explicita (`visibleToClient`, `publishedToClient`, aprobare time entry).
- accesul este refuzat implicit pentru user nealocat proiectului.
