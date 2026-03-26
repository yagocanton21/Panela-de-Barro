import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CadastroProduto from "./pages/CadastroProduto";
import Layout from "./components/Layout";
import Categorias from "./pages/Categorias";
import Movimentacoes from "./pages/Movimentacoes";
import Historico from "./pages/Historico";
import Estoque from "./pages/Estoque";
import EditarProduto from "./pages/EditarProduto";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de login sem o Layout (Sidebar/Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* Todas as outras rotas com Layout usando um wildcard (/*) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* Rota para a página inicial (Dashboard) */}
              <Route path="/" element={<Dashboard />} />
              {/* Redirecionamento temporário caso o login mude para /admin */}
              <Route path="/admin" element={<Dashboard />} />

              {/* Rota para a tela de cadastrar novo produto */}
              <Route path="/cadastrar" element={<CadastroProduto />} />

              {/* Rota para a tela de categorias */}
              <Route path="/categorias" element={<Categorias />} />

              {/* Rota para a tela de movimentações */}
              <Route path="/movimentacoes" element={<Movimentacoes />} />

              {/* Rota para o histórico de movimentações */}
              <Route path="/historico" element={<Historico />} />

              {/* Rota para o estoque */}
              <Route path="/estoque" element={<Estoque />} />

              {/* Rota para editar produto */}
              <Route path="/editar/:id" element={<EditarProduto />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
