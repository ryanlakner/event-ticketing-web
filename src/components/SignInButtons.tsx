import { useAuth } from '../auth/AuthContext';

/** Sign-in controls: one button for Entra ID, or one per role with local dev tokens. */
export default function SignInButtons() {
  const auth = useAuth();

  if (auth.mode === 'none') {
    return <span className="muted">Sign-in isn&apos;t configured</span>;
  }

  if (auth.signInOptions.length > 0) {
    return (
      <>
        {auth.signInOptions.map((role) => (
          <button key={role} type="button" onClick={async () => auth.signIn(role)}>
            Sign in as {role.toLowerCase()}
          </button>
        ))}
      </>
    );
  }

  return (
    <button type="button" onClick={async () => auth.signIn()}>
      Sign in
    </button>
  );
}
