# CoT Extractor & Quality Scorer

Extract chain-of-thought from LLM responses.

## Features
- Parse <REASONING>...</REASONING> blocks
- Extract <ANSWER>...</ANSWER> blocks
- Detect epistemik labels [FACT]/[OPINION]/[SPECULATION]/[UNKNOWN]
- Score reasoning quality: weak/adequate/strong
- Label coverage ratio (labeled claims / total)
- Confidence score (0.0-1.0)
- Safe multiline handling

## Usage
```python
from cot_extractor import extract_and_validate
output = extract_and_validate(llm_raw_response)
print(f'Quality: {output.reasoning_quality}')
print(f'Confidence: {output.confidence}')
print(f'Labels: {output.epistemic_labels}')
```

Open source — use it wisely.
