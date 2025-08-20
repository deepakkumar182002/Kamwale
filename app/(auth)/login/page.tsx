import LoginForm, { ManualLogin } from "@/components/LoginForm";

function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-24">
      <LoginForm />
      <div className="mt-6">
        <ManualLogin />
      </div>
    </div>
  );
}

export default LoginPage;
