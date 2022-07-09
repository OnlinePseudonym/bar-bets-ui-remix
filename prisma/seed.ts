import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const twixroxHash = "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u";
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
    getBets().map(data => {
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
      amount: 100.00,
      description: "Colts record vs Rams record.",
      sides: {
        create: [
          {
            name: "Colts",
            odds: -150.00,
            accepted: true,
            userId: '',
          },
          { 
            name: "Rams",
            odds: 150.00,
            accepted: true,
            userId: '',
          }
        ],
      }
    },
    {
      amount: 500.00,
      description: "Kevin makes a better pizza than Val",
      sides: {
        create: [
          {
            name: "Kevin",
            odds: -1000.00,
            accepted: true,
            userId: '',
          },
          { 
            name: "Val",
            odds: 1000.00,
            accepted: false,
            userId: '',
          }
        ]
      },
    },
  ];
}
