import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  throw new Response("No random joke found", {
    status: 404,
  });
};

export default function Index() {
  return (
    <div className="container flex flex-col justify-center align-center">
      <div className="flex flex-col justify-center align-center py-12">
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </div>
    </div>
  );
}
