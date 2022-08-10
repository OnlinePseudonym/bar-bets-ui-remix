import { Prisma } from "@prisma/client";
import { Form } from "@remix-run/react";
//import type { Bet, Prisma } from "@prisma/client";

interface BetProps {
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
  isOwner: boolean;
  canDelete?: boolean;
}

export function BetDisplay({ bet, isOwner, canDelete }: BetProps) {
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

      {isOwner && (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}
