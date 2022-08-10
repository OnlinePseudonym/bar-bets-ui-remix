import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { getUserId, requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState } from "react";
import FormField, { FieldTypes } from "~/components/form/FormField";
import { debug } from "~/utils/debug";
//import { JokeDisplay } from "~/components/joke";

function validateBetDescription(content: string) {
  if (content.length < 10) {
    return "Bet description must be at least 10 characters";
  }
}

function validateBetAmount(content: string) {
  const amount = parseInt(content);
  if (isNaN(amount)) {
    return "Bet must be a valid whole number";
  }
  if (amount <= 0) {
    return "Bet amount must be greater than $0";
  }
}

function validateOdds(content: string) {
  const odds = parseInt(content);
  if (isNaN(odds)) {
    return "Odds must be a valid whole number";
  }
}

function validateProposedId(content: string) {
  if (content.length === 0) {
    return `Must select a user`;
  }
}

interface LoaderData {
  users: Array<{ id: string; username: string }>;
}

interface ActionData {
  formError?: string;
  fieldErrors?: {
    amount: string | undefined;
    description: string | undefined;
    proposedId: string | undefined;
    odds: string | undefined;
  };
  fields?: {
    proposedId: string;
    amount: string;
    odds: string;
    description: string;
  };
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  console.log(userId);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const users = await db.user.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
      username: true,
    },
  });
  return json({ users });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const proposedId = form.get("proposedId");
  const amount = form.get("amount");
  const description = form.get("description");
  const odds = form.get("odds");

  debug();

  if (
    typeof amount !== "string" ||
    typeof description !== "string" ||
    typeof proposedId !== "string" ||
    typeof odds !== "string"
  ) {
    return badRequest({ formError: "Form not submitted correctly." });
  }

  const fieldErrors = {
    amount: validateBetAmount(amount),
    description: validateBetDescription(description),
    proposedId: validateProposedId(proposedId),
    odds: validateOdds(odds),
  };

  const fields = { amount, description, proposedId, odds };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const bet = await db.bet.create({
    data: {
      amount: fields.amount,
      description: fields.description,
      sides: {
        create: [
          {
            user: {
              connect: { id: fields.proposedId },
            },
            odds: fields.odds,
            name: "some side",
            accepted: false,
          },
          {
            user: {
              connect: { id: userId },
            },
            odds: -fields.odds,
            name: "some side",
            accepted: false,
          },
        ],
      },
    },
  });

  return redirect(`/bets/${bet.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  const { users } = useLoaderData<LoaderData>();
  console.log(users);
  // const transition = useTransition();

  // if (transition.submission) {
  //   const name = transition.submission.formData.get("name");
  //   const content = transition.submission.formData.get("content");

  //   if (
  //     typeof name === "string" &&
  //     typeof content === "string" &&
  //     !validateJokeContent(content) &&
  //     !validateJokeName(name)
  //   ) {
  //     return (
  //       <JokeDisplay
  //         joke={{ name, content }}
  //         isOwner={true}
  //         canDelete={false}
  //       />
  //     );
  //   }
  // }

  return (
    <div>
      <p>Propose a bet</p>
      <Form method="post">
        <div>
          <FormField
            defaultValue={actionData?.fields?.description}
            errorMessage={actionData?.fieldErrors?.description}
            label="Description:"
            name="description"
            type={FieldTypes.TextArea}
          />
          <FormField
            defaultValue={actionData?.fields?.proposedId}
            errorMessage={actionData?.fieldErrors?.proposedId}
            label="Propose To:"
            name="proposedId"
            type={FieldTypes.Select}
            disabledOption="Select a user"
            options={users.map((user) => ({
              value: user.id,
              label: user.username,
            }))}
          />
          <FormField
            defaultValue={actionData?.fields?.amount}
            errorMessage={actionData?.fieldErrors?.amount}
            label="Bet Amount:"
            name="amount"
            type={FieldTypes.Number}
          />
          <FormField
            defaultValue={actionData?.fields?.odds}
            errorMessage={actionData?.fieldErrors?.odds}
            label="Odds:"
            name="odds"
            type={FieldTypes.Number}
          />
        </div>
        <div>
          {actionData?.formError && (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          )}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a bet.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}
