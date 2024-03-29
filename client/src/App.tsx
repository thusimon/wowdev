import './App.scss';
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import WowToken from './components/wowtoken';

const router = createBrowserRouter([
  {
    path: "/",
    element: <WowToken />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
