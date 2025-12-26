# Firestore Indexes for Image Advertisements

## Required Indexes

### Index 1: Active Advertisements Query (Tournament/Campaign)

**Collection:** `image-advertisements`

**Fields:**
- `status` (Ascending)
- `startDate` (Ascending)
- `endDate` (Ascending)

**Query Pattern:**
```typescript
query(
  collection(firestore, 'image-advertisements'),
  where('status', '==', 'active'),
  where('startDate', '<=', now),
  where('endDate', '>=', now)
)
```

**Why Needed:**
- This query uses 3 `where` clauses
- Firestore requires a composite index for queries with multiple `where` clauses on different fields

**Status:** ⚠️ **REQUIRED** - Create this index

---

## How to Create the Index

### Option 1: Automatic (Recommended)
1. Run the query in your app
2. Firestore will show an error with a link to create the index
3. Click the link → Firebase Console opens with index pre-configured
4. Click "Create Index"
5. Wait for index to build (usually 2-5 minutes)

### Option 2: Manual
1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Set:
   - Collection ID: `image-advertisements`
   - Fields:
     - `status` (Ascending)
     - `startDate` (Ascending)
     - `endDate` (Ascending)
4. Click "Create"
5. Wait for index to build

### Option 3: Using firebase.json
Add to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "image-advertisements",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startDate",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "endDate",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## Current Query Analysis

### ✅ No Index Needed (Client-Side Filtering)
- `targetTournaments` and `targetCampaigns` filtering is done **client-side** after fetching
- No server-side queries use these fields

### ⚠️ Index Needed (Server-Side Queries)
- `status`, `startDate`, `endDate` query - **REQUIRES INDEX**

---

## Impact

**Without Index:**
- Queries will fail with error: "The query requires an index"
- Ad loading will fail
- Users won't see ads

**With Index:**
- Queries will work correctly
- Ads will load properly
- Performance will be optimized

---

## Status

**Action Required:** ✅ **CREATE THE INDEX** for `image-advertisements` collection with fields: `status`, `startDate`, `endDate`


