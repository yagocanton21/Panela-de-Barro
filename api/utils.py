from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Função para obter um objeto ou retornar 404
async def get_or_404(db: AsyncSession, model, id: int, detail: str):
    resultado = await db.execute(select(model).where(model.id == id))
    obj = resultado.scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail=detail)
    return obj
