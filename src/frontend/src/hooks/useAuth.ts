import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = loginStatus === "success" && identity !== undefined;
  const isLoading = loginStatus === "logging-in";

  const principalText = identity?.getPrincipal().toText() ?? null;
  const shortPrincipal = principalText
    ? `${principalText.slice(0, 5)}...${principalText.slice(-3)}`
    : null;

  const initials = shortPrincipal
    ? shortPrincipal.slice(0, 2).toUpperCase()
    : "?";

  return {
    login,
    logout: clear,
    isAuthenticated,
    isLoading,
    identity,
    principalText,
    shortPrincipal,
    initials,
    loginStatus,
  };
}
