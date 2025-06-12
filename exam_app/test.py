import asyncio
import aiohttp

async def test_fetch():
    url = "https://orar.usv.ro/orar/vizualizare/data/orarSPG.php?ID=2368&mod=grupa&json"
    try:
        async with aiohttp.ClientSession() as session:
            print("🔍 Începe cererea...")
            async with session.get(url, timeout=5) as resp:
                print("✅ Răspuns primit!")
                data = await resp.text()
                print("📦 Conținut:", data[:100])
    except asyncio.TimeoutError:
        print("⏱️ Timeout detectat corect!")
    except Exception as e:
        print("❌ Eroare generală:", e)

asyncio.run(test_fetch())
