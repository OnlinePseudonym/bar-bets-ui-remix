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
  };
  fields?: {
    proposedId: string;
    amount: string;
    description: string;
  };
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
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
  const proposedId = form.get("userId");
  const amount = form.get("amount");
  const description = form.get("description");

  if (
    typeof amount !== "string" ||
    typeof description !== "string" ||
    typeof proposedId !== "string"
  ) {
    return badRequest({ formError: "Form not submitted correctly." });
  }

  const fieldErrors = {
    amount: validateBetAmount(amount),
    description: validateBetDescription(description),
    proposedId: validateProposedId(proposedId),
  };

  const fields = { amount, description, proposedId };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  // const joke = await db.bet.create({
  //   data: { ...fields, jokesterId: userId },
  // });

  return redirect(`/new`);
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
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="name">
                Description:
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                name="content"
                defaultValue={actionData?.fields?.description}
                aria-invalid={
                  Boolean(actionData?.fieldErrors?.description) || undefined
                }
                aria-errormessage={
                  actionData?.fieldErrors?.description
                    ? "description-error"
                    : undefined
                }
              />
              {actionData?.fieldErrors?.description && (
                <p
                  className="form-validation-error"
                  role="alert"
                  id="description-error"
                >
                  {actionData.fieldErrors.description}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-bold mb-2"
              htmlFor="proposedId"
            >
              Propose To:
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              name="proposedId"
              defaultValue={actionData?.fields?.proposedId}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.proposedId) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.proposedId
                  ? "proposedId-error"
                  : undefined
              }
              multiple
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option value={user.id}>{user.username}</option>
              ))}
            </select>
            {actionData?.fieldErrors?.proposedId && (
              <p
                className="form-validation-error"
                role="alert"
                id="proposedId-error"
              >
                {actionData.fieldErrors.proposedId}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Bet Amount:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              type="number"
              name="name"
              defaultValue={actionData?.fields?.amount}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.amount) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.amount ? "amount-error" : undefined
              }
            />
            {actionData?.fieldErrors?.amount && (
              <p
                className="form-validation-error"
                role="alert"
                id="amount-error"
              >
                {actionData.fieldErrors.amount}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Odds:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              type="number"
              name="name"
              defaultValue={actionData?.fields?.amount}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.amount) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.amount ? "amount-error" : undefined
              }
            />
            {actionData?.fieldErrors?.amount && (
              <p
                className="form-validation-error"
                role="alert"
                id="amount-error"
              >
                {actionData.fieldErrors.amount}
              </p>
            )}
          </div>
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
