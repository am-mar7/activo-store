import { auth } from "@/auth";



export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        this user id {userId}
      </main>
    </div>
  );
}
