import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CadastroProduto from "./pages/CadastroProduto";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      {/* O Layout envolve todas as rotas para que a Sidebar apareça em todas as telas */}
      <Layout>
        <Routes>
          {/* Rota para a página inicial (Dashboard) */}
          <Route path="/" element={<Dashboard />} />

          {/* Rota para a tela de cadastrar novo produto */}
          <Route path="/cadastrar" element={<CadastroProduto />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
