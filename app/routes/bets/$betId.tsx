import type { Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

interface LoaderData {
  bet: Prisma.BetGetPayload<{
    include: {
      sides: {
        include: {
          user: {
            select: {
              username: true;
              name: true;
            };
          };
        };
      };
    };
  }>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const bet = await db.bet.findUnique({
    where: { id: params.betId },
    include: {
      sides: {
        include: {
          user: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!bet) {
    throw new Response("No bet found.", {
      status: 404,
    });
  }

  return json({ bet });
};

export default function BetRoute() {
  const { bet } = useLoaderData<LoaderData>();

  console.log(bet);
  return (
    <div>
      <p>Here's your bet:</p>
      <p>{bet.description}</p>
      <p>amount {bet.amount}</p>

      <table>
        <thead>
          <tr>
            <td>Side</td>
            <td>odds</td>
            <td>taker</td>
          </tr>
        </thead>
        <tbody>
          {bet.sides?.map((side) => (
            <tr key={side.id}>
              <td>{side.name}</td>
              <td>{side.odds}</td>
              <td>{side.user.name ?? side.user.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
