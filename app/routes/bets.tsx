import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, Link, useLoaderData, Form } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  bets: Array<{ id: string; description: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const bets = await db.bet.findMany({
    take: 5,
    where: { winner: null },
    select: { id: true, description: true },
    orderBy: { createdAt: "desc" },
  });

  const user = await getUser(request);

  const data: LoaderData = {
    bets,
    user,
  };

  return json(data);
};

export default function JokesRoute() {
  const { bets, user } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto h-screen">
      <header>
        <div className="flex justify-between">
          <h1>
            <Link to="/" title="Bar Bets" aria-label="Bar Bets">
              <span>Bar Bets</span>
            </Link>
          </h1>
          {user ? (
            <div>
              <span>{`Hi ${user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="flex flex-col h-full items-center justify-center">
        <div className="bg-white shadow-md p-8 rounded w-full max-w-3xl flex flex-wrap">
          <div className="flex-1">
            <h2 className="">
              <Link to=".">Leaderboard</Link>
            </h2>
            <p>Here are a few recent bets</p>
            <ul>
              {bets.map((bet) => (
                <li key={bet.id}>
                  <Link prefetch="intent" to={bet.id}>
                    {bet.description}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new">Propose a bet</Link>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
