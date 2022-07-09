import { Bet, User } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

interface LoaderData {
  user: User;
  bets: Array<Bet>;
}

export const loader: LoaderFunction = async () => {
  const bets = await db.bet.findMany({
    include: {
      sides: true
    }
  });
  const user = await db.user.findFirst({
    where: { username: "kevin" },
    include: { betSides: true }
  })
  
  return json({ user, bets })
};

export default function Index() {
  const { user, bets } = useLoaderData<LoaderData>();
  
  return (
    <div className="container flex flex-col justify-center align-center">
      <div className="flex flex-col justify-center align-center py-12">
        <h1 className="text-3xl font-bold">
          Bar Bets
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="bets">See Bets</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
