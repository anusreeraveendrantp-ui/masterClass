import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Courses
  const courses = await Promise.all([
    db.course.upsert({ where: { code: "CS101" }, update: {}, create: { name: "Introduction to Computer Science", code: "CS101", department: "Computer Science" } }),
    db.course.upsert({ where: { code: "CS301" }, update: {}, create: { name: "Data Structures & Algorithms", code: "CS301", department: "Computer Science" } }),
    db.course.upsert({ where: { code: "CS401" }, update: {}, create: { name: "Machine Learning", code: "CS401", department: "Computer Science" } }),
    db.course.upsert({ where: { code: "MATH201" }, update: {}, create: { name: "Calculus II", code: "MATH201", department: "Mathematics" } }),
    db.course.upsert({ where: { code: "MATH301" }, update: {}, create: { name: "Linear Algebra", code: "MATH301", department: "Mathematics" } }),
    db.course.upsert({ where: { code: "PHYS201" }, update: {}, create: { name: "Physics II: Electromagnetism", code: "PHYS201", department: "Physics" } }),
    db.course.upsert({ where: { code: "ENG201" }, update: {}, create: { name: "Technical Writing", code: "ENG201", department: "English" } }),
  ]);

  console.log(`✓ Created ${courses.length} courses`);

  // Demo users
  const hash = await bcrypt.hash("password123", 12);

  const alice = await db.user.upsert({
    where: { email: "alice@demo.com" },
    update: {},
    create: {
      name: "Alice Chen",
      email: "alice@demo.com",
      passwordHash: hash,
      role: "STUDENT",
      trustScore: 78,
    },
  });

  const bob = await db.user.upsert({
    where: { email: "bob@demo.com" },
    update: {},
    create: {
      name: "Bob Kumar",
      email: "bob@demo.com",
      passwordHash: hash,
      role: "ORGANIZER",
      trustScore: 65,
    },
  });

  const admin = await db.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash: hash,
      role: "ADMIN",
      trustScore: 90,
    },
  });

  console.log("✓ Created demo users (alice@demo.com, bob@demo.com, admin@demo.com / password123)");

  // Enrollments
  const availability = [
    { day: "MON", start: "10:00", end: "12:00" },
    { day: "WED", start: "14:00", end: "16:00" },
    { day: "FRI", start: "09:00", end: "11:00" },
  ];

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: alice.id, courseId: courses[0].id } },
    update: {},
    create: { userId: alice.id, courseId: courses[0].id, availability },
  });
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: alice.id, courseId: courses[1].id } },
    update: {},
    create: { userId: alice.id, courseId: courses[1].id, availability },
  });
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: bob.id, courseId: courses[0].id } },
    update: {},
    create: { userId: bob.id, courseId: courses[0].id, availability },
  });
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: bob.id, courseId: courses[2].id } },
    update: {},
    create: { userId: bob.id, courseId: courses[2].id, availability },
  });

  console.log("✓ Created enrollments");

  // Sample session
  const futureStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  const futureEnd = new Date(futureStart.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  await db.studySession.upsert({
    where: { id: "seed-session-1" },
    update: {},
    create: {
      id: "seed-session-1",
      courseId: courses[0].id,
      hostId: alice.id,
      title: "CS101 Midterm Review",
      description: "Let's review chapters 1–5 together and do past papers.",
      startTime: futureStart,
      endTime: futureEnd,
      location: "Library Room 3",
      maxCapacity: 8,
      participants: {
        create: [
          { userId: alice.id, status: "JOINED" },
          { userId: bob.id, status: "JOINED" },
        ],
      },
    },
  });

  console.log("✓ Created sample session");
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
