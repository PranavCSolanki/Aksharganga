
import NavbarComponent from "@/_Components/WebsiteContent/NavbarComponent";
import Link from "next/link";

export default function Page() {
  return (
    <div>This is the home page
      <NavbarComponent />
    <Link href={"/dashboard"}>go to Dashboard</Link>
    </div>
  );
}