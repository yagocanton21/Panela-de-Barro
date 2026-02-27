import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// import CadastrarProduto from "./pages/cadastrar_produto";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal (Home) */}
        <Route path="/" element={<Dashboard />} />

        {/* Nova rota para cadastrar produtos */}
        {/* <Route path="/cadastrar" element={<CadastrarProduto />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
