"use client";

import { createContext, useContext } from "react";

const AuthedContext = createContext(false);

export function AuthedProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthedContext.Provider value={value}>{children}</AuthedContext.Provider>
  );
}

export function useAuthed() {
  return useContext(AuthedContext);
}
