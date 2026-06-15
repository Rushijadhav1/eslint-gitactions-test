import type { AppType } from "../../../server";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { hc } from "hono/client";
import { CircleX } from "lucide-react";
import { authClient } from "../lib/auth-client";

const client = hc<AppType>("/");

export const Route = createFileRoute("/todos")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const {
    data,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["todos"],
    enabled: !!session,
    queryFn: async () => {
      const resp = await client.api.todos.$get();

      if (!resp.ok) {
        throw new Error("Failed to fetch todos");
      }

      return resp.json();
    },
  });

  if (!session) {
    router.navigate({ to: "/signin" });
    return null;
  }

  return (
    <div className="flex flex-col items-center p-10">
      {isError && (
        <div role="alert" className="alert alert-error">
          <CircleX />
          <span>
            Error:
            {" "}
            {error.message}
          </span>
        </div>
      )}

      <div className="space-y-3 p-6">
        {isLoading && (
          <>
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="flex items-center gap-2"
              >
                <div className="skeleton h-6 w-6 rounded-full"></div>
                <div className="skeleton h-4 w-32"></div>
              </div>
            ))}
          </>
        )}

        {data?.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={todo.completed}
              readOnly
            />
            <span>{todo.title}</span>
          </div>
        ))}

        {!isLoading && data?.length === 0 && (
          <div className="text-center text-gray-500">
            No todos found.
          </div>
        )}
      </div>
    </div>
  );
}
