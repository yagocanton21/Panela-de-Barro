import httpx
from bs4 import BeautifulSoup
import asyncio

async def testar_cupom():
    print("===========================================")
    print("   TESTE DE EXTRAÇÃO UNIVERSAL DE CUPOM")
    print("===========================================")
    url = input("Cole a URL do QR Code aqui: ").strip()

    if not url:
        print("URL inválida.")
        return

    print("\nFazendo o download pela rede...")
    try:
        # Usa GET simples sem navegador pesado (já que não precisamos do Javascript rendering)
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=15.0)

        if response.status_code != 200:
            print(f"ERRO: A página retornou status {response.status_code}")
            return
            
        print("Página baixada com sucesso! Analisando o formato...\n")
        
        texto_site = response.text
        # A SEFAZ-PE é maravilhosa: ela não retorna um HTML, ela devolve direto o XML Oficial da nota!
        if "<?xml" in texto_site or "<nfeProc" in texto_site:
            print(">>> Bingo! Detectamos um XML puro (Padrão SEFAZ Nacional).")
            
            import xml.etree.ElementTree as ET
            
            # O Python lê XML nativamente sem baixar nada!
            raiz = ET.fromstring(texto_site)
            
            # A SEFAZ exige que falemos a "língua" do portal fiscal (namespace)
            ns = {'ns': 'http://www.portalfiscal.inf.br/nfe'}
            
            produtos = raiz.findall('.//ns:det', ns)
            
            print("\n---------- EXTRAÇÃO DE XML (PE / Nacional) ----------")
            for det in produtos:
                prod = det.find("ns:prod", ns)
                if prod is not None:
                    nome = prod.find("ns:xProd", ns).text
                    qtd = prod.find("ns:qCom", ns).text
                    valor = prod.find("ns:vProd", ns).text
                    
                    print(f"🍔 {nome} | Qtd: {qtd} | Total a Pagar: R$ {valor}")
                
            total_xml = raiz.find('.//ns:ICMSTot/ns:vNF', ns)
            if total_xml is not None:
                print(f"--------------------------------------------------\n💰 VALOR TOTAL DA COMPRA: R$ {total_xml.text}")
                
        else:
            print(">>> O site retornou HTML (Como o de SC/SP).")
            
            soup = BeautifulSoup(texto_site, "html.parser")
            
            # Tenta encontrar a tabela de resultados (Padrão SP)
            tabela = soup.find("table", {"id": "tabResult"})
            
            if tabela:
                print("\n---------- EXTRAÇÃO DE HTML (São Paulo) ----------")
                linhas = tabela.find_all("tr", id=lambda x: x and x.startswith("Item +"))
                
                for linha in linhas:
                    # Nome do Produto
                    td_dados = linha.find("td")
                    nome_elem = td_dados.find(class_="txtTit")
                    nome = nome_elem.text.strip() if nome_elem else "Desconhecido"
                    
                    # Quantidade
                    qtd_elem = td_dados.find(class_="Rqtd")
                    qtd = "0"
                    if qtd_elem:
                        # O texto costuma ser "Qtde.: 1" -> pegamos só o número
                        qtd = qtd_elem.text.replace("Qtde.:", "").strip()
                    
                    # Valor Total do Item
                    vlr_elem = linha.find(class_="valor")
                    valor = vlr_elem.text.strip() if vlr_elem else "0,00"
                    
                    print(f"🛒 {nome} | Qtd: {qtd} | Total: R$ {valor}")
                
                # Valor Total da Nota
                total_nota = soup.find(class_="txtMax")
                if total_nota:
                    print(f"--------------------------------------------------\n💰 VALOR TOTAL DA COMPRA: R$ {total_nota.text.strip()}")
            else:
                # Caso seja o formato de SC ou outro
                print("Formato HTML específico não identificado ou tabela #tabResult ausente.")
                # Opcional: Adicionar lógica para SC aqui se for diferente
            
    except Exception as e:
        print(f"Gerou um erro ao tentar acessar a URL: {e}")

if __name__ == "__main__":
    asyncio.run(testar_cupom())
