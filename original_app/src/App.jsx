// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Top from './Top/Top.jsx';
import { Provider } from "./components/ui/provider";
import AppRouter from "./Router"; // ルーティング設定
import { UserProvider } from "./UserContext";

const App = () => {
  return (
    <UserProvider>
      <Provider>
        <AppRouter />
      </Provider>
    </UserProvider>
  );
};

export default App;
