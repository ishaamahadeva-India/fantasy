# Firestore Indexes Required

## Current Queries Analysis

### ✅ NO INDEXES NEEDED (Simple Queries)

1. **Events Subcollection Query**
   - Path: `fantasy-campaigns/{campaignId}/events`
   - Query: Simple collection query with no filters
   - **Status**: ✅ No index needed

2. **Campaign Detail Query**
   - Path: `fantasy-campaigns/{campaignId}`
   - Query: Direct document access
   - **Status**: ✅ No index needed

### ⚠️ POTENTIAL INDEX NEEDED

**Campaigns List Query** (`src/app/fantasy/movie/page.tsx`)
- Collection: `fantasy-campaigns`
- Current implementation: Fetches ALL campaigns and filters client-side
- **Status**: ✅ No index needed (because filtering is done client-side)

## If You Add Filtered Queries Later

If you want to optimize and add server-side filtering, you would need these indexes:

### Example Index 1: Campaign Type + Status + Visibility
```
Collection: fantasy-campaigns
Fields:
  - campaignType (Ascending)
  - status (Ascending)  
  - visibility (Ascending)
```

### Example Index 2: Campaign Type + Start Date
```
Collection: fantasy-campaigns
Fields:
  - campaignType (Ascending)
  - startDate (Descending)
```

## How to Create Indexes (If Needed)

1. **Automatic**: Firestore will show an error with a link to create the index when you run a query that needs one
2. **Manual**: Go to Firebase Console → Firestore → Indexes → Create Index
3. **Using firebase.json**: Add index configuration to `firestore.indexes.json`

## Current Status

**✅ NO INDEXES ARE REQUIRED** for the current implementation because:
- Events are queried from a subcollection without filters
- Campaigns are fetched entirely and filtered client-side
- No `orderBy` or complex `where` clauses are used server-side

## Troubleshooting

If you see an error like:
```
The query requires an index. You can create it here: [link]
```

1. Click the link in the error message
2. Firebase Console will open with the index pre-configured
3. Click "Create Index"
4. Wait for the index to build (usually takes a few minutes)

## Future Optimization

If you want to optimize queries and reduce client-side filtering, you could:

1. Add server-side filters:
   ```typescript
   query(
     collection(firestore, 'fantasy-campaigns'),
     where('campaignType', 'in', ['single_movie', 'multiple_movies']),
     where('status', 'in', ['upcoming', 'active']),
     where('visibility', '==', 'public'),
     orderBy('startDate', 'desc')
   )
   ```

2. This would require a composite index:
   - Collection: `fantasy-campaigns`
   - Fields: `campaignType`, `status`, `visibility`, `startDate`

But for now, **no indexes are needed** with the current implementation.

