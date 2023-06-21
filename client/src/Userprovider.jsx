import { createContext, useContext, useReducer } from "react";

const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

export function UserProvider({ children }) {
  const [user, dispatch] = useReducer(UserReducer, null);

  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>{children}</UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

function UserReducer(tasks, action) {
  switch (action.type) {
    case "added":
      return {
        ...action.user,
      };
    case "removed": {
      return null;
    }

    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export function useUser() {
  return useContext(UserContext);
}

export function useUserDispatch() {
  return useContext(UserDispatchContext);
}
