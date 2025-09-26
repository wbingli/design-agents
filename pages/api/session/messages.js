import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';

const templateCache = new Map();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_API_MODEL || 'gpt-4.1-mini';

async function loadSegmentTemplate(segmentId) {
  if (templateCache.has(segmentId)) {
    return templateCache.get(segmentId);
  }

  const templatePath = path.join(process.cwd(), 'prompts', 'segments', `${segmentId}.json`);
  const rawTemplate = await fs.readFile(templatePath, 'utf8');
  const parsedTemplate = JSON.parse(rawTemplate);

  if (!parsedTemplate || typeof parsedTemplate !== 'object') {
    throw new Error(`Invalid template for segment: ${segmentId}`);
  }

  templateCache.set(segmentId, parsedTemplate);
  return parsedTemplate;
}

function buildSystemPrompt(sessionId, template) {
  const sections = [];

  if (template.title) {
    sections.push(`You are facilitating the "${template.title}" segment of an ML system design interview session.`);
  } else {
    sections.push('You are facilitating a segment of an ML system design interview session.');
  }

  if (template.tone) {
    sections.push(`Adopt the following tone: ${template.tone}`);
  }

  if (Array.isArray(template.expectations) && template.expectations.length > 0) {
    sections.push(`Segment expectations:\n- ${template.expectations.join('\n- ')}`);
  }

  if (template.guidance) {
    sections.push(template.guidance);
  }

  sections.push(
    'Address the candidate directly as their interviewer. Reference details from earlier messages when relevant, keep responses concise, and ask one focused question or deliver one piece of feedback at a time.'
  );

  sections.push(`This conversation belongs to session ${sessionId}. Maintain continuity with prior exchanges while staying aligned with the current segment objectives.`);

  return sections.join('\n\n');
}

function prepareMessagesForModel(messages, activeSegmentId) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message && typeof message.content === 'string' && message.content.trim().length > 0)
    .map((message) => {
      const role = message.role === 'assistant' ? 'assistant' : 'user';
      const prefix = message.segmentId && message.segmentId !== activeSegmentId ? `[Segment: ${message.segmentId}] ` : '';
      return {
        role,
        content: [
          {
            type: 'text',
            text: `${prefix}${message.content.trim()}`
          }
        ]
      };
    });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, segmentId, messages } = req.body || {};

  if (!sessionId || !segmentId) {
    return res.status(400).json({ error: 'sessionId and segmentId are required.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured.' });
  }

  let template;
  try {
    template = await loadSegmentTemplate(segmentId);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: `No prompt template found for segment ${segmentId}.` });
    }
    console.error('Failed to load segment template', error);
    return res.status(500).json({ error: 'Unable to load segment template.' });
  }

  const systemPrompt = buildSystemPrompt(sessionId, template);
  const conversationalMessages = prepareMessagesForModel(messages, segmentId);

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: systemPrompt
            }
          ]
        },
        ...conversationalMessages
      ]
    });

    const reply = (response && typeof response.output_text === 'string') ? response.output_text.trim() : '';

    if (!reply) {
      return res.status(500).json({ error: 'OpenAI response did not contain any text.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Failed to generate assistant response', error);
    return res.status(502).json({ error: 'Failed to generate assistant response.' });
  }
}
