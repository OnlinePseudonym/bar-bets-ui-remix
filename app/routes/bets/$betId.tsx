import type { Prisma } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { BetDisplay } from "../../components/bet";
import { getUserId, requireUserId } from "~/utils/session.server";

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
  userId?: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await getUserId(request);
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

  return json({ bet, userId });
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();

  if (form.get("_method") !== "delete") {
    throw new Response(
      `The _method ${form.get("_method")} is not supported`,
      { status: 400 }
    );
  }
  
  const userId = await requireUserId(request);
  const bet = await db.bet.findUnique({
    where: { id: params.betId },
  });

  if (!bet) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (bet.ownerId !== userId) {
    throw new Response(
      "Pssh, nice try. That's not your bet",
      {
        status: 401,
      }
    );
  }
  await db.bet.delete({ where: { id: params.betId } });
  
  return redirect("/bets");
};

export default function BetRoute() {
  const { bet, userId } = useLoaderData<LoaderData>();

  return <BetDisplay bet={bet} isOwner={bet.ownerId === userId} canDelete />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const { betId } = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {betId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {betId} is not your bet.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  const { betId } = useParams();
  return (
    <div className="error-container">{`There was an error loading bet by the id ${betId}. Sorry.`}</div>
  );
}
