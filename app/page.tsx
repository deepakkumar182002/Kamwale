import {redirect} from "next/navigation";

async function Page() {
  <>
  Current Date: {new Date().toLocaleDateString()}
  redirect("/dashboard")
  </>
}

export default Page;