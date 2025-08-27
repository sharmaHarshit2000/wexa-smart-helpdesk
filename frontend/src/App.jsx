import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/Layout";
import RoutesConfig from "./routes/RoutesConfig";

function App() {
  return (
    <Router>
      <Layout>
        <RoutesConfig />
      </Layout>
    </Router>
  );
}

export default App;
