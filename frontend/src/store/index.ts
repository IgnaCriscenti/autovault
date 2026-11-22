// Store de Redux. La sesion NO vive aca: la maneja useSession() de Better Auth.
import { configureStore } from "@reduxjs/toolkit";
import { vehiclesApi } from "./api";
import { usersApi } from "./usersApi";

export const store = configureStore({
  reducer: {
    [vehiclesApi.reducerPath]: vehiclesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  // El middleware de RTK Query maneja la cache, el refetch y la invalidacion por tags.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(vehiclesApi.middleware, usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
