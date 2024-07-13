-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "category" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "salaryMin" REAL,
    "salaryMax" REAL,
    "salaryType" TEXT NOT NULL,
    "partOfTown" TEXT,
    "workPresence" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "linkToApply" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "customInstructions" TEXT,
    CONSTRAINT "JobPosting_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
