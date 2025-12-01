✅ **NEXT STEPS — Milestone 1 (Data + API Foundation)**
======================================================

**1\. Finalize the Database Schema (Prisma)**
---------------------------------------------

Create prisma/schema.prisma models for:

*   Card
    
*   Set
    
*   Faction
    
*   Rarity
    
*   Keyword (optional)
    
*   CardKeyword (join table)
    

**Your JSON already defines the fields** — convert them 1:1 into proper Prisma types.

**Output:** A complete schema file.

**2\. Create a Seed Script**
----------------------------

Inside scripts/seed.ts:

*   Load your JSON with fs.readFileSync
    
*   Parse every card
    
*   Map JSON fields → Prisma fields
    
*   prisma.card.createMany()
    

**Output:** pnpm prisma db push + pnpm tsx scripts/seed.ts loads ALL cards into the DB.

**3\. Implement the Core API Endpoints**
----------------------------------------

Inside app/api/cards/:

### **3.1 GET /api/cards**

Query params:

*   q (name, text)
    
*   faction
    
*   rarity
    
*   type
    
*   cost
    
*   limit
    
*   page
    

Include Prisma filtering + pagination.

### **3.2 GET /api/cards/\[id\]**

Return full card object + related set/faction info.

### **3.3 GET /api/sets**

Return all sets + card counts.

### **3.4 GET /api/search/autocomplete**

Return name suggestions.

**Output:** Fully functional, predictable API.

**4\. Add Response Normalization**
----------------------------------

Create lib/api/formatCard.ts:

*   Convert DB card → public API shape.
    
*   Provide consistent field names.
    
*   Strip unused fields.
    
*   Ensure predictable structure.
    

**Output:** Clean, stable API responses.

**5\. Add Error Handling**
--------------------------

Global API utilities:

*   badRequest()
    
*   notFound()
    
*   serverError()
    

Make every endpoint return clean JSON errors.

**6\. Add Rate Limiting + Caching**
-----------------------------------

Not mandatory, but smart early.

*   Middleware route limiter (simple in-memory for dev)
    
*   Revalidate search pages every 60s
    

**Output:** Faster search & small protection layer.

🟦 **Milestone 2 (UI)** — but only after Milestone 1 is done
============================================================

**7\. Build Card Index Page**
-----------------------------

*   Grid layout showing card image + name + cost
    
*   Fetch via /api/cards
    
*   Basic pagination
    

**8\. Build Card Details Page**
-------------------------------

*   Large image
    
*   Stats, cost, rarity, faction
    
*   Ability text formatted
    
*   Backlinks to set / faction pages
    

**9\. Build Search + Filters UI**
---------------------------------

*   Name search input (debounced)
    
*   Faction dropdown
    
*   Cost slider/buttons
    
*   Sort dropdown
    

Real-time results fed by your API.

🟧 Milestone 3 (Polish / Release)
=================================

**10\. Add SEO Metadata**
-------------------------

*   OpenGraph card previews
    
*   Metadata for each card page
    

**11\. Add Image Resolver**
---------------------------

*   /images/cards/{id}.png
    
*   Fallback for missing images
    

**12\. Deploy**
---------------

*   Vercel deployment
    
*   Prisma → hosted DB (Railway / Supabase)
    
*   ENV config
    

🧩 Summary — Your Next 3 Moves
==============================

If you want the simplest condensed immediate actions:

### **Step 1 — Write Prisma models**

(You cannot continue until this is solid.)

### **Step 2 — Seed the DB with your JSON**

### **Step 3 — Build /api/cards + /api/cards/\[id\]**

(These two unlock the UI.)