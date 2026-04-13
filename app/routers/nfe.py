import httpx
from bs4 import BeautifulSoup
import logging
from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from app.auth import obter_usuario_atual

# Configuração do Logger para rastrear erros no Docker
logger = logging.getLogger(__name__)

# O Router blindado exigindo o Token JWT
router = APIRouter(dependencies=[Depends(obter_usuario_atual)], tags=["Nota Fiscal (SP)"])

def formatar_valor(valor_str: str) -> float:
    """Converte string de moeda (Ex: '1.250,50' ou '15,00') para float com segurança."""
    if not valor_str:
        return 0.0
    # Remove o ponto de milhar e troca a vírgula por ponto
    valor_limpo = valor_str.replace(".", "").replace(",", ".").strip()
    try:
        return float(valor_limpo)
    except ValueError:
        logger.warning(f"Falha ao converter valor financeiro: {valor_str}")
        return 0.0

async def extrair_nfe_logic(url: str):
    """
    Função interna para realizar a raspagem de dados (Exclusivo SEFAZ-SP).
    """
    # Faz a SEFAZ achar que é um navegador real
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        async with httpx.AsyncClient(verify=False, headers=headers) as client:
            response = await client.get(url, timeout=15.0)
            
            # Lança uma exceção se a SEFAZ retornar erro (ex: 404, 403, 500)
            response.raise_for_status() 

        texto_site = response.text
        produtos = []
        total_nota = 0.0

        # Processamento do HTML da SEFAZ de São Paulo
        soup = BeautifulSoup(texto_site, "html.parser")
        tabela = soup.find("table", {"id": "tabResult"})
        
        if tabela:
            linhas = tabela.find_all("tr", id=lambda x: x and x.startswith("Item +"))
            for linha in linhas:
                td_dados = linha.find("td")
                if not td_dados: continue
                
                # Nome
                nome_elem = td_dados.find(class_="txtTit")
                nome = nome_elem.text.strip() if nome_elem else "Desconhecido"
                
                # Quantidade
                qtd_elem = td_dados.find(class_="Rqtd")
                qtd_raw = qtd_elem.text.replace("Qtde.:", "") if qtd_elem else "0"
                qtd = formatar_valor(qtd_raw)
                
                # Unidade de Medida
                unidade_elem = td_dados.find(class_="RUN")
                unidade = unidade_elem.text.replace("UN:", "").strip().lower() if unidade_elem else "un"
                
                # Valor Total do Item
                vlr_elem = linha.find(class_="valor")
                vlr_raw = vlr_elem.text if vlr_elem else "0"
                valor_total_item = formatar_valor(vlr_raw)
                
                # Calcula o unitário
                valor_unit = valor_total_item / qtd if qtd > 0 else 0.0

                produtos.append({
                    "nome": nome,
                    "quantidade": qtd,
                    "valor_unitario": round(valor_unit, 2),
                    "unidade_medida": unidade
                })
            
            # Valor Total da Compra
            total_elem = soup.find(class_="txtMax")
            if total_elem:
                total_nota = formatar_valor(total_elem.text)
        else:
            # Se não achou a tabela, avisa que o formato é inválido
            return {"erro": "Apenas links de cupons da SEFAZ do estado de São Paulo são suportados ou o formato mudou."}

        return {"sucesso": True, "produtos": produtos, "total_nota": total_nota}

    # Tratamento de Erros Criterioso para Produção
    except httpx.TimeoutException:
        logger.error(f"Timeout na SEFAZ. URL: {url}")
        return {"erro": "O site da Receita demorou muito para responder. Tente novamente."}
        
    except httpx.HTTPStatusError as e:
        logger.error(f"SEFAZ bloqueou o acesso (Erro {e.response.status_code}) na URL: {url}")
        return {"erro": f"A Receita bloqueou a consulta (Código {e.response.status_code})."}
        
    except httpx.RequestError as e:
        logger.error(f"Erro de rede ao acessar SEFAZ: {e}")
        return {"erro": "Falha de conexão com o portal da Nota Fiscal."}
        
    except Exception as e:
        logger.exception("Erro interno inesperado na extração da nota de SP.")
        return {"erro": "O formato desta nota fiscal não pôde ser lido ou sofreu alterações."}

# --- Rota ---

@router.post("/nfe/extrair", summary="Extrair dados da NFC-e (SEFAZ-SP)")
async def extrair_nota(
    url: str = Body(..., description="URL do QR Code da Nota Fiscal de SP")
):
    """
    Recebe a URL de uma NFC-e de São Paulo e extrai automaticamente a lista de produtos, quantidades e valores.
    """
    if not url.startswith("http"):
        return JSONResponse(status_code=400, content={"message": "URL inválida. O link deve começar com http."})

    resultado = await extrair_nfe_logic(url)

    if "erro" in resultado:
        return JSONResponse(status_code=422, content={"message": resultado["erro"]})

    return resultado