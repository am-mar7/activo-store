import Loading from "@/app/loading";
import { UsersList } from "@/components/dashboard/lists/UserList";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getUsers } from "@/lib/server actions/user.action";
import { RouteParams } from "@/types/global";
import { Suspense } from "react";

export default function Users({ searchParams, params }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <UsersContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function UsersContent({ searchParams }: RouteParams) {
  const { page, query, filter, pageSize } = await searchParams;
  const { data, success, error } = await getUsers({
    page: Number(page) || 1,
    query,
    filter,
    pageSize: Number(pageSize) || 25,
  });

  const { items: users, isNext, total } = data || {};
  const tryAgain = !success || error;

  return (
    <div className="max-w-7xl w-full overflow-x-auto">
      <div className="flex-1">
        <LocalSearch
          route={DASHBOARDROUTES.USERS}
          placeholder="search for users by name or email..."
        />
      </div>
      {!tryAgain && users && (
        <div className="bg-white">
          <h3 className="h3-semibold text-slate-800 mt-4 mb-1.5 px-1">Users</h3>
          <UsersList users={users} />
          <div className="mt-1.5">
            {users.length ? (
              <Pagination
                pageSize={Number(pageSize) || 25}
                page={page}
                total={total}
                isNext={isNext}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
