# Voice Clone & TTS Playbook

End-to-end pipeline for text-to-speech synthesis with user authentication, credit-based pricing, voice marketplace, and caching.

Reference implementation extracted from production. Adapt the provider logic, use your own inference stack.

## The Flow

User Registration → Assign Initial Credits (100) → User Requests Synthesis → Validate Credit Balance → TTS Provider Call (cache-first) → Deduct Credits, Log Transaction → Return Audio File → User Uploads Generated Voice to Marketplace (optional) → Set Price, Make Public/Private → Other Users Purchase Voice → Original Creator Earns Credits

## System Components

### 1. User Registration & Auth

Backend pseudocode:

```python
class User(BaseModel):
    email: str
    name: str
    password_hash: str  # bcrypt
    role: str  # user or admin
    credits: int = 100  # Initial allocation
    earnings: int = 0  # From voice marketplace sales
    created_at: datetime

@router.post("/auth/register")
async def register(req: UserRegister) -> User:
    # Validate email uniqueness
    # Hash password with bcrypt
    # Create user with INITIAL_CREDITS
    # Record initial credit transaction
    return user
```

### 2. Credit Management

Track credits as a currency. Each action costs credits:

- Synthesis (5 min audio): 10 credits
- Synthesis (30 min audio): 50 credits
- Voice Marketplace Upload: 5 credits (one-time)
- Voice Marketplace Purchase: Variable (set by creator)

Transaction Log Table:
```
{
  id: uuid,
  user_id: ObjectId,
  type: credit | debit | purchase | earning,
  amount: int,
  description: str,
  created_at: datetime,
  related_item_id?: str
}
```

### 3. TTS Synthesis

Call your TTS provider (OpenAI, ElevenLabs, local inference, etc.). The provider does not matter; the pattern is the same:

```python
async def synthesize_speech(
    user_id: str,
    text: str,
    voice_id: str,
    speed: float = 1.0
) -> dict:
    # Step 1: Validate credits
    user = await db.users.find_one({_id: ObjectId(user_id)})
    credit_cost = estimate_cost(len(text))
    if user[credits] < credit_cost:
        raise HTTPException(status_code=402, detail=Insufficient credits)
    
    # Step 2: Check cache (avoid re-synthesis)
    cache_key = f"{text}:{voice_id}:{speed}"
    cached = await redis.get(cache_key)
    if cached:
        return {audio_url: cached, cached: True}
    
    # Step 3: Call TTS provider
    audio_data = await call_tts_provider(
        text=text,
        voice=voice_id,
        speed=speed,
        api_key=os.environ[TTS_PROVIDER_KEY]
    )
    
    # Step 4: Store audio file
    storage_key = f"audio/{user_id}/{uuid.uuid4()}.mp3"
    audio_url = await upload_to_storage(audio_data, storage_key)
    
    # Step 5: Deduct credits
    await db.users.update_one(
        {_id: ObjectId(user_id)},
        {$inc: {credits: -credit_cost}}
    )
    
    # Step 6: Log transaction
    await db.transactions.insert_one({
        id: str(uuid.uuid4()),
        user_id: user_id,
        type: debit,
        amount: credit_cost,
        description: f"TTS synthesis: {text[:50]}...",
        audio_url: audio_url,
        created_at: datetime.now(timezone.utc).isoformat()
    })
    
    # Step 7: Cache for future requests
    await redis.setex(cache_key, 86400, audio_url)
    
    return {audio_url: audio_url, cached: False}
```

### 4. Voice Marketplace

After synthesis, user can share their generated voice:

```python
@router.post("/voices/upload")
async def upload_voice(
    current_user: dict,
    req: VoiceShareRequest
) -> dict:
    voice = {
        id: str(uuid.uuid4()),
        creator_id: current_user[_id],
        original_audio_url: req.audio_url,
        is_public: req.is_public,
        price_credits: req.price,
        downloads: 0,
        earnings: 0,
        created_at: datetime.now(timezone.utc).isoformat()
    }
    await db.voices.insert_one(voice)
    return voice
```

### 5. Key Decisions

Credit System vs. Direct Payment:
- Credits: Easier UX (no repeated payment entry), supports micro-transactions, marketplace neutral
- Direct: Simpler, standard payment flow

Caching Strategy:
- Redis: Fast hits, reduces synthesis cost
- Alternative: CDN edge cache with content-addressable URLs

Voice DRM:
- No DRM: Simpler, respects user ownership
- Alternative: Watermark audio or require token per playback

Provider Lock-in:
- Abstract provider calls into strategy pattern
- Easy to switch later (OpenAI to ElevenLabs to self-hosted)

## Metrics to Track

- Credit transactions per user (engagement)
- Cache hit rate (efficiency)
- Marketplace GMV (revenue)
- Provider API costs vs. revenue (profitability)
- Synthesis latency (UX)

## When to Use

- Building a voice marketplace
- Offering text-to-speech as a service
- Enabling user-generated audio content
- Implementing credit-based metering

Open source — use it wisely.
