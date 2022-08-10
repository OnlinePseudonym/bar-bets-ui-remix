import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const twixroxHash =
    "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u";
  const kevin = await db.user.create({
    data: {
      username: "kevin",
      // this is a hashed version of "twixrox"
      passwordHash: twixroxHash,
    },
  });

  const val = await db.user.create({
    data: {
      username: "val",
      // this is a hashed version of "twixrox"
      passwordHash: twixroxHash,
    },
  });

  await Promise.all(
    getBets().map((data) => {
      data.ownerId = kevin.id;
      data.sides.create[0].userId = kevin.id;
      data.sides.create[1].userId = val.id;
      return db.bet.create({ data });
    })
  );
}

seed();

function getBets() {
  return [
    {
      amount: 100.0,
      description: "Colts record vs Rams record.",
      ownerId: "",
      sides: {
        create: [
          {
            name: "Colts",
            odds: -150.0,
            accepted: true,
            userId: "",
          },
          {
            name: "Rams",
            odds: 150.0,
            accepted: true,
            userId: "",
          },
        ],
      },
    },
    {
      amount: 500.0,
      description: "Kevin makes a better pizza than Val",
      ownerId: "",
      sides: {
        create: [
          {
            name: "Kevin",
            odds: -1000.0,
            accepted: true,
            userId: "",
          },
          {
            name: "Val",
            odds: 1000.0,
            accepted: false,
            userId: "",
          },
        ],
      },
    },
  ];
}
