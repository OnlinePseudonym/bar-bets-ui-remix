import type { Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { BetDisplay } from "../../components/bet";

interface LoaderData {
  bet: Prisma.BetGetPayload<{
    include: {
      owner: {
        select: {
          id: true;
        };
      };
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

  return <BetDisplay bet={bet} isOwner={true} canDelete={false} />;
}
