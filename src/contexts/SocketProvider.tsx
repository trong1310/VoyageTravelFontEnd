import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { createContext, useCallback, useEffect, useState } from "react";

import { RootState } from "~/redux/store";
import { useSelector } from "react-redux";

export const SocketContext = createContext<HubConnection | null>(null);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  const startConnection = useCallback(async () => {
    try {
      if (token) {
        const initConnection: HubConnection = new HubConnectionBuilder()
          .withUrl(process.env.NEXT_PUBLIC_SOCKET + "/chatHub"!, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets,
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Information)
          .build();

        initConnection.onclose(() => {
          console.log("Websocket: Disconnected");
        });

        await initConnection.start();
        setConnection(initConnection);
      }
    } catch (e) {
      console.error("Websocket: " + e);
    }
  }, [token]);

  useEffect(() => {
    startConnection();
    return () => {
      // Cleanup code if needed
      console.log("Websocket: Disconnected Return");
      if (connection) {
        connection.stop();
      }
    };
  }, [token]);

  return (
    <SocketContext.Provider value={connection}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
