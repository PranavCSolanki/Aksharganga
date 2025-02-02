
import NavbarComponent from "@/_Components/WebsiteContent/NavbarComponent";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <NavbarComponent />
      <Link href={"/exam/dashboard"}>go to Dashboard</Link>
    </>
  );
}