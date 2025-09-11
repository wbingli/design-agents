#!/usr/bin/env python3
"""
Run the deep research ML system design prompt against ChatGPT and save the result.

Usage examples:

  # Use inline JSON input
  python scripts/run_deep_research.py \
    --prompt-file prompts/deep-research-ml-system-design.md \
    --input-json '{"company_name":"Meta","ml_topic":"Design a News Feed ML Ranking System","interview_frequency":"Very High","product_description":"Design a machine learning system for Facebook News Feed ranking..."}'

  # Use JSON file and filter by company/topic (expects list of records)
  python scripts/run_deep_research.py \
    --prompt-file prompts/deep-research-ml-system-design.md \
    --input-json-file content/meta-ml-topics.json \
    --company-name Meta \
    --ml-topic "Design a News Feed ML Ranking System"

Environment:
  - Set OPENAI_API_KEY in your environment before running.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    from openai import OpenAI
except Exception as exc:  # pragma: no cover
    print("Missing dependency: openai. Install with: pip install openai", file=sys.stderr)
    raise


def read_text(path: Path) -> str:
    with path.open("r", encoding="utf-8") as f:
        return f.read()


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        f.write(content)


def sanitize_name(name: str) -> str:
    # Keep it readable while safe for file paths
    name = name.strip().replace("/", "-")
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"[^A-Za-z0-9._\-]", "", name)
    return name


def derive_output_path(base_dir: Path, record: dict) -> Path:
    company = sanitize_name(record.get("company_name", "Company"))
    topic = sanitize_name(record.get("ml_topic", "ML-Topic"))
    # As specified by the prompt template
    return base_dir / company / f"{topic}.md"


def build_messages(prompt_markdown: str, record: dict, include_mermaid_hint: bool) -> list:
    system_parts = [
        "You are an expert ML system design interviewer and architect.",
        "Produce a comprehensive, interview-focused document with advanced technical depth (E7 level).",
        "Follow the structure described in the provided prompt template.",
    ]
    if include_mermaid_hint:
        system_parts.append(
            "Include a clear 'System Design Diagram' section using Mermaid (flowchart) when appropriate."
        )

    system_prompt = "\n".join(system_parts)

    user_prompt = (
        f"PROMPT TEMPLATE:\n\n{prompt_markdown}\n\n"
        f"INPUT RECORD (JSON):\n```json\n{json.dumps(record, ensure_ascii=False, indent=2)}\n```\n\n"
        "Generate the output markdown now."
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def run_completion(messages: list, enable_deep_research: bool, model: str, temperature: float) -> str:
    client = OpenAI()

    # Some environments expose deep research via extra body; others do not.
    extra_body = None
    if enable_deep_research:
        # Best-effort toggle; ignored if unsupported by the model or account.
        extra_body = {"deep_research": {"enable": True}}

    # Prefer a reasoning-capable model when possible.
    chosen_model = model or ("o4-mini" if enable_deep_research else "gpt-4o-mini")

    try:
        # Use Chat Completions for widest compatibility
        resp = client.chat.completions.create(
            model=chosen_model,
            messages=messages,
            temperature=temperature,
            extra_body=extra_body,  # harmless if unsupported
        )
        return resp.choices[0].message.content or ""
    except Exception:
        # Fallback to Responses API if available
        try:
            resp = client.responses.create(
                model=chosen_model,
                input=messages,
                temperature=temperature,
                extra_body=extra_body,
            )
            # Collect text output parts
            chunks = []
            if getattr(resp, "output", None):
                for item in resp.output:
                    if item.type == "message":
                        for c in item.content:
                            if c.type == "output_text":
                                chunks.append(c.text)
            return "".join(chunks)
        except Exception as exc:
            raise RuntimeError(f"OpenAI API call failed: {exc}")


def load_record(args: argparse.Namespace) -> dict:
    if args.input_json:
        return json.loads(args.input_json)

    if args.input_json_file:
        data = json.loads(read_text(Path(args.input_json_file)))
        # If the file is an array, allow filtering by company/topic
        if isinstance(data, list):
            filtered = [
                r for r in data
                if (
                    (not args.company_name or r.get("company_name") == args.company_name)
                    and (not args.ml_topic or r.get("ml_topic") == args.ml_topic)
                )
            ]
            if not filtered:
                raise ValueError("No matching record found in input JSON file with provided filters.")
            return filtered[0]
        if isinstance(data, dict):
            return data
        raise ValueError("Unsupported JSON input format. Provide an object or array of objects.")

    raise ValueError("Provide --input-json or --input-json-file.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run deep research ML system design prompt via ChatGPT API")
    parser.add_argument("--prompt-file", required=True, help="Path to the prompt markdown file")
    parser.add_argument("--input-json", help="Inline JSON string with required fields")
    parser.add_argument("--input-json-file", help="Path to a JSON file containing the input record(s)")
    parser.add_argument("--company-name", help="Filter when JSON file has multiple records")
    parser.add_argument("--ml-topic", help="Filter when JSON file has multiple records")
    parser.add_argument("--output-base", default="content/ml-system-designs", help="Base output directory for generated markdown")
    parser.add_argument("--model", default="", help="Override model (default: o4-mini if deep research else gpt-4o-mini)")
    parser.add_argument("--temperature", type=float, default=0.2)
    parser.add_argument("--enable-deep-research", action="store_true", help="Try to enable deep research mode if available")
    parser.add_argument("--include-mermaid", action="store_true", help="Ask the model to include a Mermaid diagram section")

    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        print("OPENAI_API_KEY is not set in environment.", file=sys.stderr)
        sys.exit(2)

    prompt_markdown = read_text(Path(args.prompt_file))
    record = load_record(args)

    messages = build_messages(prompt_markdown, record, include_mermaid_hint=args.include_mermaid)
    output_markdown = run_completion(
        messages=messages,
        enable_deep_research=args.enable_deep_research,
        model=args.model,
        temperature=args.temperature,
    )

    output_path = derive_output_path(Path(args.output_base), record)
    write_text(output_path, output_markdown)
    print(f"Saved markdown to: {output_path}")


if __name__ == "__main__":
    main()


