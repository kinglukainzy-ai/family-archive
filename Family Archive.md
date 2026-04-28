# Family Archive — Complete Project Specification

> Version 1.0 | For IDE Agent Execution

---

## 1. PROJECT OVERVIEW

A private, self-hosted family genealogy and archive web application. Only enrolled family members can access the site. An admin controls all enrollment and relationship linking. Members manage their own profiles. The system maintains a top-down interactive family tree, biographical profiles, media galleries, life events, and a document archive.

The application is to be hosted on an Oracle Always Free ARM server (4 cores, 24GB RAM, 200GB block storage) and must be mobile-responsive from day one as it will later be wrapped in an APK via Capacitor.

---

## 2. TECH STACK

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Frontend         | React 18 (Vite)                         |
| Styling          | Tailwind CSS                            |
| Backend          | Node.js + Express                       |
| Database         | PostgreSQL                              |
| Auth             | JWT stored in httpOnly cookies          |
| File Storage     | Local filesystem (Oracle block storage) |
| PDF Generation   | Puppeteer                               |
| Image Processing | Sharp (resize/compress on upload)       |
| ORM              | Prisma                                  |
| Runtime          | Node 20 LTS                             |

---

## 3. PROJECT STRUCTURE

```text
family-archive/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instance + API call functions
│   │   ├── components/
│   │   │   ├── tree/              # Family tree components
│   │   │   │   ├── FamilyTree.jsx         # Root tree component
│   │   │   │   ├── TreeNode.jsx           # Recursive node component
│   │   │   │   ├── PersonCard.jsx         # Node card UI
│   │   │   │   └── UnionConnector.jsx     # Visual marriage/union line
│   │   │   ├── profile/           # Profile view/edit components
│   │   │   │   ├── ProfileView.jsx
│   │   │   │   ├── ProfileEdit.jsx
│   │   │   │   ├── LifeEvents.jsx
│   │   │   │   ├── MediaGallery.jsx
│   │   │   │   └── DocumentsSection.jsx
│   │   │   ├── admin/             # Admin panel components
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── EnrollMember.jsx
│   │   │   │   ├── LinkRelationships.jsx
│   │   │   │   ├── MediaApproval.jsx
│   │   │   │   └── AccountsManager.jsx
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   └── NotificationPanel.jsx
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Avatar.jsx
│   │   │       ├── RichTextEditor.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Tree.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTree.js
│   │   │   └── useNotifications.js
│   │   ├── utils/
│   │   │   ├── treeBuilder.js     # Converts flat DB data to nested tree
│   │   │   └── dateHelpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                        # Express backend
│   ├── prisma/
│   │   ├── schema.prisma          # Full DB schema
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── persons.routes.js
│   │   │   ├── unions.routes.js
│   │   │   ├── tree.routes.js
│   │   │   ├── media.routes.js
│   │   │   ├── events.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   ├── search.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── export.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── persons.controller.js
│   │   │   ├── unions.controller.js
│   │   │   ├── tree.controller.js
│   │   │   ├── media.controller.js
│   │   │   ├── events.controller.js
│   │   │   ├── notifications.controller.js
│   │   │   ├── search.controller.js
│   │   │   ├── admin.controller.js
│   │   │   └── export.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # JWT verification
│   │   │   ├── admin.middleware.js     # Admin role check
│   │   │   ├── ownership.middleware.js # Person ownership check
│   │   │   └── upload.middleware.js    # Multer config
│   │   ├── services/
│   │   │   ├── tree.service.js        # Tree building logic
│   │   │   ├── notification.service.js
│   │   │   ├── media.service.js       # Sharp processing
│   │   │   └── pdf.service.js         # Puppeteer export
│   │   ├── utils/
│   │   │   ├── prismaClient.js
│   │   │   └── asyncHandler.js
│   │   └── app.js
│   ├── storage/                   # File storage root
│   │   ├── photos/                # Profile and gallery photos
│   │   ├── documents/             # Uploaded documents
│   │   └── videos/                # Short uploaded clips
│   ├── .env
│   └── server.js
│
├── .gitignore
├── README.md
└── docker-compose.yml             # Optional, for local dev
```

---

## 4. DATABASE SCHEMA (Prisma)

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────

model Account {
  id            String    @id @default(uuid())
  username      String    @unique
  passwordHash  String
  role          Role      @default(MEMBER)
  isActive      Boolean   @default(true)
  forcePasswordChange Boolean @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  person        Person?   @relation(fields: [personId], references: [id])
  personId      String?   @unique

  notifications Notification[]
}

enum Role {
  ADMIN
  MEMBER
}

// ─── PERSONS ─────────────────────────────────────────────────────────────────

model Person {
  id              String    @id @default(uuid())
  firstName       String
  lastName        String
  maidenName      String?
  otherNames      String?   // aliases, nicknames
  gender          Gender
  dateOfBirth     DateTime?
  dateOfDeath     DateTime?
  birthPlace      String?
  deathPlace      String?
  isDeceased      Boolean   @default(false)
  isLiving        Boolean   @default(true)  // false = profile-only, no account
  profilePhotoUrl String?
  biography       String?   @db.Text
  occupation      String?
  nationality     String?

  // Profile locked after person turns 18 and before admin assigns account
  profileLocked   Boolean   @default(false)

  // Tree position
  isRoot          Boolean   @default(false) // Admin sets exactly one person as root

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  account         Account?

  // Unions this person is part of (as partner1 or partner2)
  unionsAsPartner1  Union[]  @relation("Partner1")
  unionsAsPartner2  Union[]  @relation("Partner2")

  // Children records
  childRecords    Child[]

  // Content
  lifeEvents      LifeEvent[]
  media           Media[]
  documents       Document[]

  // Notifications about this person
  notifications   Notification[]
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}

// ─── UNIONS ──────────────────────────────────────────────────────────────────
// A union is a relationship between two people (or one person + unknown)
// that may have produced children. Children belong to a union, not a person.

model Union {
  id          String      @id @default(uuid())
  partner1Id  String
  partner2Id  String?     // nullable = single parent / unknown other parent
  unionType   UnionType
  startDate   DateTime?
  endDate     DateTime?   // null = ongoing
  stillTogether Boolean   @default(true)
  notes       String?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  partner1    Person      @relation("Partner1", fields: [partner1Id], references: [id])
  partner2    Person?     @relation("Partner2", fields: [partner2Id], references: [id])
  children    Child[]
}

enum UnionType {
  MARRIED
  DIVORCED
  PARTNERSHIP   // together but not formally married
  RELATIONSHIP  // had children, no formal union
  SINGLE_PARENT // only one known parent
}

// ─── CHILDREN ────────────────────────────────────────────────────────────────
// Links a person to a union as a child

model Child {
  id              String          @id @default(uuid())
  unionId         String
  personId        String
  relationshipType ChildRelationType @default(BIOLOGICAL)
  birthOrder      Int?            // optional ordering within the union

  union           Union           @relation(fields: [unionId], references: [id])
  person          Person          @relation(fields: [personId], references: [id])

  @@unique([unionId, personId])
}

enum ChildRelationType {
  BIOLOGICAL
  ADOPTED
  STEP
}

// ─── LIFE EVENTS ─────────────────────────────────────────────────────────────

model LifeEvent {
  id          String      @id @default(uuid())
  personId    String
  eventType   EventType
  title       String
  description String?     @db.Text
  eventDate   DateTime?
  location    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  person      Person      @relation(fields: [personId], references: [id])
}

enum EventType {
  BIRTH
  DEATH
  MARRIAGE
  DIVORCE
  MIGRATION
  EDUCATION
  CAREER
  MILITARY
  AWARD
  OTHER
}

// ─── MEDIA ───────────────────────────────────────────────────────────────────

model Media {
  id          String      @id @default(uuid())
  personId    String
  type        MediaType
  url         String      // local path or external URL
  thumbnailUrl String?    // generated thumbnail for photos/videos
  caption     String?
  takenAt     DateTime?
  isApproved  Boolean     @default(false) // admin must approve
  uploadedById String?    // account id of uploader
  createdAt   DateTime    @default(now())

  person      Person      @relation(fields: [personId], references: [id])
}

enum MediaType {
  PHOTO
  VIDEO_UPLOAD   // short clip stored on server (max 100MB)
  VIDEO_LINK     // external YouTube/Vimeo link
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

model Document {
  id          String      @id @default(uuid())
  personId    String
  title       String
  description String?
  fileUrl     String      // local path
  fileType    String      // pdf, jpg, png, etc.
  fileSizeKb  Int
  isApproved  Boolean     @default(false)
  uploadedById String?
  createdAt   DateTime    @default(now())

  person      Person      @relation(fields: [personId], references: [id])
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

model Notification {
  id          String              @id @default(uuid())
  accountId   String              // recipient
  type        NotificationType
  message     String
  isRead      Boolean             @default(false)
  relatedPersonId String?         // person this notification is about
  createdAt   DateTime            @default(now())

  account     Account             @relation(fields: [accountId], references: [id])
  relatedPerson Person?           @relation(fields: [relatedPersonId], references: [id])
}

enum NotificationType {
  PROFILE_UPDATED        // a member updated their profile
  MEDIA_PENDING          // new media upload awaiting admin approval
  MEDIA_APPROVED         // admin approved your upload
  MEDIA_REJECTED         // admin rejected your upload
  NEW_MEMBER_ENROLLED    // admin enrolled a new family member
  NEW_ACCOUNT_CREATED    // your account was created (welcome)
  PROFILE_LOCKED         // profile locked (turned 18)
  ACCOUNT_RESET          // admin reset your password
  BIRTHDAY_TODAY         // family member birthday
}
```

---

## 5. API ROUTES

### Auth `/api/auth`

| Method | Path               | Access | Description                                                    |
| ------ | ------------------ | ------ | -------------------------------------------------------------- |
| POST   | `/login`           | Public | Login with username + password. Returns JWT in httpOnly cookie |
| POST   | `/logout`          | Member | Clears cookie                                                  |
| POST   | `/change-password` | Member | Change own password                                            |
| GET    | `/me`              | Member | Returns current user + linked person                           |

### Persons `/api/persons`

| Method | Path          | Access                        | Description                                                 |
| ------ | ------------- | ----------------------------- | ----------------------------------------------------------- |
| GET    | `/`           | Admin                         | List all persons (paginated)                                |
| POST   | `/`           | Admin                         | Create new person                                           |
| GET    | `/:id`        | Member                        | Get person profile                                          |
| PATCH  | `/:id`        | Member (own/children) + Admin | Update person fields                                        |
| DELETE | `/:id`        | Admin                         | Soft delete person                                          |
| GET    | `/:id/family` | Member                        | Get immediate family (parents, siblings, children, spouses) |

### Tree `/api/tree`

| Method | Path    | Access | Description                                                                  |
| ------ | ------- | ------ | ---------------------------------------------------------------------------- |
| GET    | `/`     | Member | Get full tree data (flat list with relationships, built into tree on client) |
| GET    | `/root` | Member | Get the current root person                                                  |
| PATCH  | `/root` | Admin  | Set a different root person                                                  |

### Unions `/api/unions`

| Method | Path                      | Access | Description                        |
| ------ | ------------------------- | ------ | ---------------------------------- |
| GET    | `/`                       | Admin  | List all unions                    |
| POST   | `/`                       | Admin  | Create a union between two persons |
| PATCH  | `/:id`                    | Admin  | Update union details               |
| DELETE | `/:id`                    | Admin  | Remove a union                     |
| POST   | `/:id/children`           | Admin  | Add a child to a union             |
| DELETE | `/:id/children/:personId` | Admin  | Remove a child from a union        |

### Media `/api/media`

| Method | Path                            | Access                        | Description                            |
| ------ | ------------------------------- | ----------------------------- | -------------------------------------- |
| POST   | `/persons/:personId/upload`     | Member (own/children) + Admin | Upload photo, document, or short video |
| POST   | `/persons/:personId/link-video` | Member (own/children) + Admin | Add external video link                |
| GET    | `/pending`                      | Admin                         | List all unapproved media              |
| PATCH  | `/:id/approve`                  | Admin                         | Approve media item                     |
| PATCH  | `/:id/reject`                   | Admin                         | Reject and delete media item           |
| DELETE | `/:id`                          | Admin                         | Delete media item                      |
| GET    | `/persons/:personId`            | Member                        | Get all approved media for a person    |

### Documents `/api/documents`

| Method | Path                 | Access                        | Description                          |
| ------ | -------------------- | ----------------------------- | ------------------------------------ |
| POST   | `/persons/:personId` | Member (own/children) + Admin | Upload document                      |
| GET    | `/persons/:personId` | Member                        | List approved documents for a person |
| PATCH  | `/:id/approve`       | Admin                         | Approve document                     |
| DELETE | `/:id`               | Admin                         | Delete document                      |

### Life Events `/api/events`

| Method | Path                 | Access                        | Description                      |
| ------ | -------------------- | ----------------------------- | -------------------------------- |
| GET    | `/persons/:personId` | Member                        | Get all life events for a person |
| POST   | `/persons/:personId` | Member (own/children) + Admin | Add a life event                 |
| PATCH  | `/:id`               | Member (own/children) + Admin | Update a life event              |
| DELETE | `/:id`               | Admin                         | Delete a life event              |

### Notifications `/api/notifications`

| Method | Path        | Access | Description                          |
| ------ | ----------- | ------ | ------------------------------------ |
| GET    | `/`         | Member | Get own notifications (unread first) |
| PATCH  | `/:id/read` | Member | Mark notification as read            |
| PATCH  | `/read-all` | Member | Mark all as read                     |

### Search `/api/search`

| Method | Path                                        | Access | Description    |
| ------ | ------------------------------------------- | ------ | -------------- |
| GET    | `/?q=&generation=&birthDecade=&birthPlace=` | Member | Search persons |

### Admin `/api/admin`

| Method | Path                           | Access | Description                            |
| ------ | ------------------------------ | ------ | -------------------------------------- |
| GET    | `/accounts`                    | Admin  | List all accounts                      |
| POST   | `/accounts`                    | Admin  | Create account and link to person      |
| PATCH  | `/accounts/:id/reset-password` | Admin  | Reset member password                  |
| PATCH  | `/accounts/:id/deactivate`     | Admin  | Deactivate account                     |
| GET    | `/unplaced`                    | Admin  | Persons not yet linked in the tree     |
| GET    | `/dashboard-stats`             | Admin  | Counts, pending media, locked profiles |

### Export `/api/export`

| Method | Path   | Access | Description                                  |
| ------ | ------ | ------ | -------------------------------------------- |
| GET    | `/pdf` | Admin  | Generate and download full family PDF report |

---

## 6. BUSINESS LOGIC & RULES

### Authentication & Sessions

- JWT stored in httpOnly, sameSite=strict cookie. Token expiry: 7 days.
- On first login, if `forcePasswordChange = true`, redirect to change-password page before any other access.
- Admin resets passwords manually. No self-service reset. No email required.

### Profile Ownership & Edit Rights

- A member can edit only their own linked person's profile.
- A member can also edit profiles of persons who are their **biological, adopted, or step children AND are under 18**.
- On a child's 18th birthday, set `person.profileLocked = true`. Trigger a `PROFILE_LOCKED` notification to the parent and a `NEW_ACCOUNT_CREATED` notification to admin (prompting them to create the account).
- Admin can edit any person's profile at any time regardless of age or lock status.
- Once a locked person is assigned an account, set `profileLocked = false` — they now manage themselves.

### Tree Logic

- The tree renders **top-down** starting from the root person (the one with `isRoot = true`).
- Exactly one person can have `isRoot = true` at a time. Admin sets this.
- Persons with no parents linked AND `isRoot = false` appear in an "Unplaced Members" section in the admin panel, not in the main tree.
- The tree is built server-side into a nested JSON structure and sent to the client. Client renders it recursively.
- **Cycle guard:** When building the tree, track visited person IDs. If a person has already been rendered (e.g. cousin marriages), render a reference card ("See [Name] above") instead of re-rendering their branch.
- Siblings are **derived** automatically — persons sharing the same union as a child are siblings. Do not store sibling relationships directly.
- Half-siblings are persons who share one parent union but not both.

### Union & Relationship Rules

- Children always belong to a **union**, never directly to a person.
- A union can have `partner2Id = null` for single-parent cases or unknown other parent.
- A person can appear in multiple unions (multiple marriages, relationships, etc.).
- Admin manages all union creation and child linking. Members cannot create or modify unions.

### Media & Documents

- All member uploads (photos, videos, documents) default to `isApproved = false`.
- Admin uploads are auto-approved (`isApproved = true`).
- On member upload: trigger `MEDIA_PENDING` notification to admin.
- On admin approval: trigger `MEDIA_APPROVED` notification to uploader.
- On admin rejection: trigger `MEDIA_REJECTED` notification to uploader and delete the file from disk.
- Photo uploads: process with Sharp — resize to max 1920px on longest edge, compress to JPEG 85% quality, generate 300px thumbnail.
- Video uploads: max file size 100MB. Accept mp4, mov, webm only.
- Document uploads: max file size 20MB. Accept pdf, jpg, png, docx only.
- External video links: validate that URL is from youtube.com, youtu.be, or vimeo.com only.
- Storage path structure: `storage/photos/{personId}/{uuid}.jpg`, `storage/documents/{personId}/{uuid}.pdf`, `storage/videos/{personId}/{uuid}.mp4`.

### Notifications

- Notifications are in-app only. No email.
- Notification triggers:
  - Member updates their own profile → notify admin (`PROFILE_UPDATED`)
  - Member uploads media → notify admin (`MEDIA_PENDING`)
  - Admin approves media → notify uploader (`MEDIA_APPROVED`)
  - Admin rejects media → notify uploader (`MEDIA_REJECTED`)
  - Admin enrolls new person → notify all active members (`NEW_MEMBER_ENROLLED`)
  - Admin creates account → notify the new account holder (`NEW_ACCOUNT_CREATED`)
  - Person turns 18 → notify their parent(s) and admin (`PROFILE_LOCKED`)
  - Admin resets password → notify the account (`ACCOUNT_RESET`)
  - Birthday (daily cron job, midnight) → notify all members for each person whose birthday is today (`BIRTHDAY_TODAY`)
- Unread notification count shown on bell icon in navbar.

### Search

- Search across: firstName, lastName, maidenName, otherNames, biography, birthPlace.
- Optional filters: generation (derived from tree depth), birthDecade, birthPlace exact match.
- Results show name, photo thumbnail, DOB year, birthplace.

### Password Rules

- Minimum 8 characters.
- Admin-set initial passwords should be temporary (forcePasswordChange flag).
- Passwords hashed with bcrypt (12 rounds).

---

## 7. FRONTEND PAGES & COMPONENTS

### Login Page

- Username + password form.
- On success: redirect to `/tree`. If `forcePasswordChange`, redirect to `/change-password` first.
- Show error on invalid credentials.

### Tree Page (`/tree`)

- Full-width top-down family tree.
- Starts from root person, renders downward recursively.
- Each node shows: profile photo (or avatar placeholder), full name, birth year – death year (or "living"), location.
- Couple nodes sit side by side connected with a horizontal `══` line.
- Vertical line drops from couple to their children row.
- Children render in a horizontal row below their parents.
- Each node is clickable — opens a profile side panel (slide in from right on desktop, full screen on mobile).
- Collapse/expand button on nodes that have children.
- "Unplaced Members" button (admin only) — opens a list of persons not yet in the tree.
- Deceased persons: slightly muted styling, small cross icon or italic name.

### Profile Side Panel / Profile Page (`/profile/:id`)

- Header: large photo, name, vital dates, birthplace.
- Tabs: Biography | Life Events | Photos | Videos | Documents
- Edit button visible only if user has edit rights for this person.
- Biography tab: rich text display. Edit mode uses a rich text editor (use Quill or TipTap).
- Life Events tab: chronological list of events with type icon, date, location, description.
- Photos tab: masonry grid of approved photos. Upload button if user has rights.
- Videos tab: approved video clips + external video embeds. Add button if user has rights.
- Documents tab: list of approved documents with download links.
- All uploads show "Pending approval" badge to the uploader until approved.

### Admin Panel (`/admin`)

- Tab navigation: Dashboard | Members | Enrollments | Tree Management | Media Approval | Accounts
- **Dashboard:** Stats cards — total persons, total accounts, pending media count, locked profiles awaiting account.
- **Members:** Searchable list of all persons. Click to view/edit any profile.
- **Enrollments:** Form to create a new person with all fields. After creation, immediately go to relationship linking — select their parents (pick union or create new one), select their spouse unions if any. Option to create account for them or leave as profile-only.
- **Tree Management:** Set root person. View unplaced members. Drag or assign them into the tree by selecting their parent union.
- **Media Approval:** Queue of pending uploads. Show preview, person name, uploader. Approve or reject each.
- **Accounts:** List all accounts. Create account (link to existing person, set username, set temp password). Reset password. Deactivate account.

### Search Page (`/search`)

- Search bar with filters (birthplace, generation, decade).
- Results as cards with photo, name, dates, birthplace.
- Click result → opens profile.

### Notifications Panel

- Accessible from bell icon in navbar.
- Slide-in panel listing all notifications, newest first.
- Unread shown with highlight. Mark all read button.
- Click notification → navigate to relevant profile or admin section.

---

## 8. TREE DATA STRUCTURE (Server Response)

The `/api/tree` endpoint returns a nested object:

```json
{
  "root": {
    "id": "uuid",
    "firstName": "Kofi",
    "lastName": "Mensah",
    "dateOfBirth": "1920-01-01",
    "dateOfDeath": "1995-06-15",
    "isDeceased": true,
    "profilePhotoUrl": "/storage/photos/uuid/thumb.jpg",
    "unions": [
      {
        "id": "union-uuid",
        "unionType": "MARRIED",
        "partner": {
          "id": "uuid",
          "firstName": "Efua",
          "lastName": "Mensah",
          "isDeceased": false,
          "profilePhotoUrl": null
        },
        "children": [
          {
            "id": "uuid",
            "firstName": "Kwame",
            "lastName": "Mensah",
            "isDeceased": false,
            "profilePhotoUrl": "/storage/photos/uuid/thumb.jpg",
            "unions": [ ... ],   // recursive
            "isAlreadyRendered": false  // true if cycle detected
          }
        ]
      }
    ]
  }
}
```

The recursive tree builder in `server/src/services/tree.service.js` must:

1. Start from the root person.
2. For each person, fetch all their unions.
3. For each union, fetch the partner and all children.
4. Recurse into each child.
5. Track visited IDs in a Set to detect cycles. If a child ID is already in the Set, return `{ id, firstName, lastName, isAlreadyRendered: true }` without further recursion.

---

## 9. FILE STORAGE

All files stored under `server/storage/`. Served statically via Express at `/storage/*`.

```text
storage/
├── photos/
│   └── {personId}/
│       ├── {uuid}_original.jpg   # original compressed
│       └── {uuid}_thumb.jpg      # 300px thumbnail
├── documents/
│   └── {personId}/
│       └── {uuid}.{ext}
└── videos/
    └── {personId}/
        └── {uuid}.{ext}
```

Add `storage/` to `.gitignore`. Never commit uploaded files.

---

## 10. ENVIRONMENT VARIABLES

```env
# server/.env

DATABASE_URL=postgresql://user:password@localhost:5432/family_archive
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d
PORT=3001
CLIENT_URL=http://localhost:5173
STORAGE_PATH=./storage
MAX_PHOTO_SIZE_MB=20
MAX_VIDEO_SIZE_MB=100
MAX_DOCUMENT_SIZE_MB=20
NODE_ENV=development
```

---

## 11. BIRTHDAY CRON JOB

Run daily at midnight using `node-cron`:

```js
// In server/src/services/notification.service.js
// Every day at 00:00
cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Find all persons whose birthday is today (living persons only)
  const persons = await prisma.person.findMany({
    where: {
      isDeceased: false,
      dateOfBirth: { not: null },
    },
  });

  const birthdayPersons = persons.filter((p) => {
    const dob = new Date(p.dateOfBirth);
    return dob.getMonth() + 1 === month && dob.getDate() === day;
  });

  // For each birthday person, notify all active accounts
  for (const person of birthdayPersons) {
    const allAccounts = await prisma.account.findMany({
      where: { isActive: true },
    });
    for (const account of allAccounts) {
      await prisma.notification.create({
        data: {
          accountId: account.id,
          type: "BIRTHDAY_TODAY",
          message: `🎂 Today is ${person.firstName} ${person.lastName}'s birthday!`,
          relatedPersonId: person.id,
        },
      });
    }
  }
});
```

---

## 12. PDF EXPORT

Admin can trigger a full family report PDF via `GET /api/export/pdf`.

The PDF should include:

- Cover page: Family name, date generated, total members count.
- Family tree section: A simplified text-based tree representation.
- Member profiles section: One page per person — photo, vital info, biography, life events list.
- Generated with Puppeteer by rendering an internal HTML template and printing to PDF.
- Response: `Content-Disposition: attachment; filename=family-report-{date}.pdf`.

---

## 13. SECURITY REQUIREMENTS

- All routes except `POST /api/auth/login` require a valid JWT cookie.
- Admin routes additionally require `account.role === 'ADMIN'`.
- Ownership middleware: for PATCH on persons, verify that `req.user.personId === personId` OR person is an under-18 child of the current user OR current user is admin.
- Rate limit login endpoint: max 10 attempts per 15 minutes per IP (use `express-rate-limit`).
- Sanitise all text inputs (use `dompurify` or equivalent on server).
- Validate all file uploads (check MIME type, not just extension).
- httpOnly, sameSite=strict cookie. Secure flag in production.
- Never expose password hashes in API responses.
- CORS: allow only `CLIENT_URL` from env.

---

## 14. BUILD & SETUP SCRIPTS

### `package.json` scripts (root level — use workspaces or two separate package.jsons)

```json
// server/package.json scripts
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:seed": "node prisma/seed.js",
  "db:studio": "prisma studio"
}

// client/package.json scripts
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Seed file (`server/prisma/seed.js`)

Create one admin account on first seed:

- Username: `admin`
- Password: `ChangeMe123!` (forcePasswordChange: true)
- Role: ADMIN
- Link to a placeholder Person record for the admin.

---

## 15. DEPLOYMENT NOTES (Oracle Always Free)

- Oracle ARM VM: Ubuntu 22.04
- Use PM2 to run the Node server as a process: `pm2 start server.js --name family-archive`
- Use Nginx as reverse proxy: port 80/443 → port 3001
- Use Certbot for SSL (Let's Encrypt)
- Serve the built React client as static files via Nginx from `client/dist/`
- PostgreSQL running locally on the same VM
- Storage directory: mount Oracle block storage at `/mnt/storage`, symlink to `server/storage`
- Set up PM2 startup: `pm2 startup` so server survives reboots
- Daily database backup: pg_dump via cron to a separate directory

---

## 16. FUTURE APK NOTES

- Keep all UI interactions touch-friendly (min 44px tap targets)
- Avoid hover-only interactions
- No browser-specific APIs that won't work in Capacitor WebView
- When APK time comes: `npm install @capacitor/core @capacitor/cli`, `npx cap init`, `npx cap add android`
- The existing web build drops into Capacitor with minimal changes

---

## 17. BUILD ORDER (Recommended for IDE Agent)

1. Initialise project structure (folders, package.json files, configs)
2. Set up Prisma schema and run initial migration
3. Seed admin account
4. Build Express app skeleton with middleware and route stubs
5. Implement Auth routes + JWT middleware
6. Implement Person CRUD routes + ownership middleware
7. Implement Union + Child routes
8. Implement Tree service + tree endpoint
9. Implement Media upload + Sharp processing + approval flow
10. Implement Document upload + approval flow
11. Implement Life Events routes
12. Implement Notification service + triggers
13. Implement Search endpoint
14. Implement Birthday cron job
15. Implement PDF export
16. Build React app skeleton (routing, auth context, protected routes)
17. Build Login page
18. Build Tree page + recursive TreeNode component
19. Build Profile panel/page with all tabs
20. Build Admin panel with all sections
21. Build Search page
22. Build Notification panel
23. Connect all frontend to backend API
24. End-to-end testing of all flows
25. Production build + deployment config

---

_End of specification. All decisions finalised. No ambiguity remaining._
