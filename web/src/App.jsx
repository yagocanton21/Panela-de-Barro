import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CadastroProduto from "./pages/CadastroProduto";
import Layout from "./components/Layout";
import Categorias from "./pages/Categorias";
import Movimentacoes from "./pages/Movimentacoes";
import Historico from "./pages/Historico";
import Estoque from "./pages/Estoque";
import EditarProduto from "./pages/EditarProduto";
import ListaCompras from "./pages/ListaCompras";
import Ajustes from "./pages/Ajustes";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Rotas protegidas - só quem está logado pode acessar
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        {/* Todas as outras rotas são protegidas e levam ao painel administrativo */}
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                {/* Página inicial do painel - Dashboard com resumo do sistema */}
                <Route path="/admin" element={<Dashboard />} />
                {/* Cadastrar novo produto no estoque (Exclusivo Admin) */}
                <Route path="/cadastrar" element={<AdminRoute><CadastroProduto /></AdminRoute>} />
                {/* Gerenciar categorias de produtos (Exclusivo Admin) */}
                <Route path="/categorias" element={<AdminRoute><Categorias /></AdminRoute>} />
                {/* Registrar entradas e saídas de produtos */}
                <Route path="/movimentacoes" element={<Movimentacoes />} />
                {/* Ver histórico de todas as movimentações */}
                <Route path="/historico" element={<Historico />} />
                {/* Visualizar estoque atual */}
                <Route path="/estoque" element={<Estoque />} />
                {/* Editar dados de um produto específico (Exclusivo Admin) */}
                <Route path="/editar/:id" element={<AdminRoute><EditarProduto /></AdminRoute>} />
                {/* Lista de compras com sincronização de estoque */}
                <Route path="/lista-compras" element={<ListaCompras />} />
                {/* Painel de gestão de usuários (Exclusivo Admin) */}
                <Route path="/ajustes" element={<AdminRoute><Ajustes /></AdminRoute>} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
