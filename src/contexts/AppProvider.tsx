import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import NextNProgress from "nextjs-progressbar";
import { Provider } from "react-redux";
import SplashScreen from "~/components/protected/SplashScreen";
import { ToastContainer } from "react-toastify";
import UpdateRouter from "~/components/layout/UpdateRouter";
import { store } from "~/redux/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppProvider({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps: any;
}) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NextNProgress
          height={2}
          color="#0866FF"
          options={{ showSpinner: false }}
        />
        <SplashScreen />
        <UpdateRouter />
        <ToastContainer autoClose={3000} />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}

export default AppProvider;
