# Bez Filtra — dokumentacja deweloperska

Wersja techniczna: konfiguracja, wdrożenie, tuning i utrzymanie. Opis produktu znajdziesz w [README.md](README.md).

---

## Uruchomienie

### Wymagania

- Docker + Docker Compose
- 8 GB RAM (dla modelu 7B), 16 GB zalecane przy pracy równoległej z innymi usługami
- GPU NVIDIA z min. 4 GB VRAM (opcjonalne, ale znacznie przyspiesza)

### 1. Klonuj i skonfiguruj

```bash
git clone https://github.com/pi0trdotsys/Bez-Filtra-AI.git
cd ai-chat
cp .env.example .env
nano .env
```

Uzupełnij `.env`:

```env
JWT_SECRET=<losowy_ciąg_znaków>
ACCESS_PASSWORD=<twoje_hasło>
FRONTEND_URL=*
DEFAULT_MODEL=huihui_ai/qwen3-abliterated:8b
FALLBACK_MODEL=huihui_ai/qwen3-abliterated:4b
POSTGRES_PASSWORD=<losowy_ciąg_znaków>
```

### 2. GPU (opcjonalnie, ale polecane)

Jeśli masz kartę NVIDIA - zainstaluj [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html), dopisz do `.env`:

```env
COMPOSE_PROFILES=gpu
```

i gotowe - dockerowy serwis `ollama` jest schowany za profilem `gpu` właśnie po to, żeby domyślnie (bez tej zmiennej) `docker compose up` w ogóle go nie ruszał.

**Na hoście zupełnie bez GPU nic nie rób** - bez `COMPOSE_PROFILES=gpu` w `.env` serwis `ollama` nie jest nawet tworzony, więc redeploy nie ma szans wywalić się na brakującym sterowniku nvidia. Zamiast niego uruchom Ollamę natywnie na hoście i wskaż na nią backend przez `docker-compose.override.yml`:

```yaml
services:
  backend:
    environment:
      - OLLAMA_URL=http://172.17.0.1:11434
```

(`172.17.0.1` to domyślny adres bramy mostka Dockera - adres hosta widziany z wnętrza kontenerów). Upewnij się, że sama Ollama nasłuchuje na tym interfejsie (`OLLAMA_HOST=172.17.0.1:11434` w usłudze systemd albo w środowisku `ollama serve`), a nie tylko na loopbacku.

### 3. Uruchom

```bash
./redeploy.sh
```

Skrypt automatycznie: synchronizuje kod z repo, buduje obrazy, włącza stronę konserwacji na czas przebudowy i podnosi stack.

### 4. Pobierz modele

```bash
# Domyślny (Q4_K_M, 5 GB)
ollama pull huihui_ai/qwen3-abliterated:8b

# Awaryjny mniejszy model
ollama pull huihui_ai/qwen3-abliterated:4b
```

(Jeśli używasz natywnej Ollamy, dodaj `OLLAMA_HOST=172.17.0.1:11434` przed komendą. W Dockerze: `docker exec -it ollama ollama pull ...`.)

### 4b. Tuning wydajności na CPU (bez GPU)

Gdy Ollama działa natywnie na hoście, liczy się przepustowość RAM i liczba wątków. Zmienne w `.env`:

| Zmienna | Domyślnie | Opis |
|---|---|---|
| `DEFAULT_MODEL` | `huihui_ai/qwen3-abliterated:8b` | domyślny model |
| `OLLAMA_KEEP_ALIVE` | `10m` | po jakim czasie bezczynności zwolnić model z RAM |
| `FALLBACK_MODEL` | *(puste)* | awaryjny mniejszy model, gdy główny się nie załaduje (np. `huihui_ai/qwen3-abliterated:4b`) |
| `OLLAMA_NUM_CTX` | `2048` | rozmiar okna kontekstu (mniej = szybciej i mniej RAM) |
| `MAX_CONTEXT_MESSAGES` | `20` | ile ostatnich wiadomości trafia do modelu |

Rekomendowane ustawienia natywnej Ollamy (systemd, `override.conf`):

```ini
[Service]
Environment="OLLAMA_HOST=172.17.0.1:11434"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_FLASH_ATTENTION=1"
Environment="OLLAMA_KV_CACHE_TYPE=q4_0"
```

- `OLLAMA_NUM_PARALLEL=1` daje najwyższe tok/s przy jednym użytkowniku (cały CPU na jedno zapytanie).
- `OLLAMA_FLASH_ATTENTION=1` + `OLLAMA_KV_CACHE_TYPE=q4_0` - szybsza uwaga i skwantyzowany cache KV -> mniej RAM i wyższe tok/s.
- Jakość: `:8b` to kwantyzacja Q4_K_M (5 GB) - jedyna publikowana dla tego modelu. Większa jakość = `:14b` (9 GB), ale na 16 GB CPU będzie wolniejszy i zostawi mniej RAM.
- Przy 16 GB RAM `huihui_ai/qwen3-abliterated:8b` (5 GB) to najlepszy balans jakości do szybkości; `:4b` (2.5 GB) sprawdzi się jako zapas/fallback.

### 5. Cloudflare Tunnel (brak publicznego IP)

```bash
cloudflared tunnel login
cloudflared tunnel create bezfiltra
cloudflared tunnel route dns bezfiltra twoja-domena.com

cat > ~/.cloudflared/config.yml << EOF
tunnel: <TUNNEL_ID>
credentials-file: /home/$USER/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: twoja-domena.com
    service: http://localhost:5173
  - service: http_status:404
