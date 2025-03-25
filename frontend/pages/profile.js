import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import withAuth from "@/utils/withAuth";

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <>
        <Head>
          <title>Unauthorized – Our Arab Heritage</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="text-center mt-10" role="alert">
          <h1 className="text-2xl font-bold text-red-600">You are not logged in</h1>
          <Link
            href="/login"
            className="mt-4 inline-block text-blue-600 underline hover:text-blue-800"
          >
            Go to Login
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile – Our Arab Heritage</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-center mt-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>

        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Email: {user.email || <em>Not available</em>}
        </p>

        <button
          onClick={logout}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Logout
        </button>
      </div>
    </>
  );
}

export default withAuth(Profile);
