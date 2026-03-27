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
import PrivateRoute from "./components/PrivateRoute";

// Rotas protegidas - só quem está logado pode acessar
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                {/* Página inicial - Dashboard com resumo do sistema */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<Dashboard />} />
                {/* Cadastrar novo produto no estoque */}
                <Route path="/cadastrar" element={<CadastroProduto />} />
                {/* Gerenciar categorias de produtos */}
                <Route path="/categorias" element={<Categorias />} />
                {/* Registrar entradas e saídas de produtos */}
                <Route path="/movimentacoes" element={<Movimentacoes />} />
                {/* Ver histórico de todas as movimentações */}
                <Route path="/historico" element={<Historico />} />
                {/* Visualizar estoque atual */}
                <Route path="/estoque" element={<Estoque />} />
                {/* Editar dados de um produto específico */}
                <Route path="/editar/:id" element={<EditarProduto />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
