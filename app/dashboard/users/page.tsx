import { UsersList } from "@/components/dashboard/lists/UserList";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getUsers } from "@/lib/server actions/user.action";
import { RouteParams } from "@/types/global";

export default async function Users({ searchParams }: RouteParams) {
  const { page, query, filter } = await searchParams;
  const { data, success, error } = await getUsers({
    page: Number(page) || 1,
    query,
    filter,
  });

  const { items:users , isNext , total} = data || {};
  return (
    <div className="max-w-7xl w-full overflow-x-auto">
      <div className="flex w-full flex-col xs:flex-row gap-2 items-center">
        <div className="flex-1 max-xs:w-full">
          <LocalSearch
            route={DASHBOARDROUTES.USERS}
            placeholder="search for users"
          />
        </div>
      </div>
      <DataRenderer
        data={users}
        success={success}
        render={(users) => (
          <>
            <h2 className="h3-semibold mt-6 py-1">Users</h2>
            <div className="min-w-250 w-full mb-4">
              {users && <UsersList users={users} />}
            </div>
            <Pagination isNext={isNext} total={total}/>
          </>
        )}
        empty={{
          title: "No Users Found",
          message: "There are no Users yet. Hold On the traffic is comming.",
        }}
        error={error}
      />
    </div>
  );
}
