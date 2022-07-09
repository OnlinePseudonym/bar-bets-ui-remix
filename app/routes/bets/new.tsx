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

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(content: string) {
  if (content.length < 3) {
    return `That joke's name is too short`;
  }
}

function validateProposedId(content: string) {
  if (content.length === 0) {
    return `Must select a user`;
  }
}

interface LoaderData {
  users: Array<{ id: string, username: string}>;
}

interface ActionData {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
    proposedId: string | undefined;
  };
  fields?: {
    proposedId: string;
    name: string;
    content: string;
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
        id: userId
      }
    },
    select: {
      id: true,
      username: true,
    }
  });
  return json({ users });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const proposedId = form.get("userId");
  const name = form.get("name");
  const content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string" || typeof proposedId !== "string") {
    return badRequest({ formError: "Form not submitted correctly." });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
    proposedId: validateProposedId(proposedId)
  };

  const fields = { name, content, proposedId };
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
          <label htmlFor="proposedId">
            Propose To:
            <select
              name="proposedId"
              defaultValue={actionData?.fields?.proposedId}
              aria-invalid={Boolean(actionData?.fieldErrors?.proposedId) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.proposedId ? "proposedId-error" : undefined
              }
              multiple
            >
              <option value="" disabled>Select a user</option>
              {users.map(user => <option value={user.id}>{user.username}</option>)}              
            </select>
          </label>
          <label htmlFor="name">
            Name:
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name && (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="content">
            Content:{" "}
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content && (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          )}
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
