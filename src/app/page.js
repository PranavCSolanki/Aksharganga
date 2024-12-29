import Link from "next/link";

export default function Page() {
  return (
    <div>This is the home page
    <Link href={"/dashboard"}>go to Dashboard</Link>
    </div>
  );
}