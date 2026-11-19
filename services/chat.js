import db from './db.js';
import { getGoal } from './goal.js';

let chatCleanup;

const removeStoredChat = () => {
    if (!chatCleanup) {
        chatCleanup = db.raw(`
            DROP TABLE IF EXISTS chat_conversation;
            ALTER TABLE chat DROP COLUMN IF EXISTS conversation_id;
            DELETE FROM chat;
        `).catch((error) => {
            chatCleanup = null;
            throw error;
        });
    }
    return chatCleanup;
};

export const clearStoredChat = async (userId) => {
    await removeStoredChat();
    await db('chat').where({ user_id: userId }).del();
};

export const chatHistoryFrom = (history, newMessage) => {
    const rows = (Array.isArray(history) ? history : [])
        .filter((row) => row && (row.role === 'assistant' || row.role === 'user') && typeof row.message === 'string' && row.message.trim())
        .slice(-20)
        .map((row) => ({
            role: row.role === 'assistant' ? 'assistant' : 'user',
            message: row.message.trim().slice(0, 4000),
        }));

    const latest = rows[rows.length - 1];
    if (!latest || latest.role !== 'user' || latest.message !== newMessage) {
        rows.push({ role: 'user', message: newMessage });
    }

    return rows.slice(-20);
};

const formatDate = (value) => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
};

const dietContext = async (userId) => {
    const goalRow = await getGoal(userId).catch(() => null);
    const entries = await db('form_entry')
        .where({ user_id: userId })
        .select('date', 'weight', 'comment')
        .orderBy('date', 'asc');

    const lines = entries.map((row) => {
        const comment = row.comment ? ` — ${row.comment}` : '';
        return `${formatDate(row.date)}: ${row.weight} lb${comment}`;
    });

    return `You are the assistant inside this user's private weight-loss log. Weights are in pounds. You are not a doctor.

You may answer only about weight loss and diet: their weight entries, weekly change, goal weight, calories, meals, nutrition for losing weight, hunger, plateaus, and exercise that supports weight loss. A short hello is fine if you then offer help with their weight loss.

If the message is about anything else — news, coding, school, jokes, sports, relationships, general knowledge, or health topics that are not about weight loss — do not answer it. Reply with exactly this sentence and nothing else:
Sorry, I can only answer things related to this weight loss.

Keep on-topic answers short and practical.

Goal weight: ${goalRow?.goal ?? 'not set'} lb

Weight log:
${lines.length ? lines.join('\n') : 'No entries yet.'}`;
};

const OFF_TOPIC_REPLY = 'Sorry, I can only answer things related to this weight loss.';

const askOpenAI = async (apiKey, messages, maxTokens) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-6-luna',
            reasoning_effort: 'none',
            max_completion_tokens: maxTokens,
            messages,
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = data?.error?.message || `OpenAI request failed (${response.status})`;
        throw new Error(detail.replace(/sk-[A-Za-z0-9_-]+/g, 'sk-***'));
    }

    return data.choices?.[0]?.message?.content?.trim() || '';
};

const isWeightLossTopic = async (apiKey, message) => {
    const answer = await askOpenAI(apiKey, [
        {
            role: 'system',
            content: 'Decide if the message is about weight loss or diet. On topic: weight entries, weekly change, goal weight, calories, meals, nutrition for losing weight, hunger, plateaus, exercise for weight loss, and short greetings. Everything else is off topic. Reply with only YES or NO.',
        },
        { role: 'user', content: message },
    ], 16);

    return /^yes\b/i.test(answer);
};

export const replyWithOpenAI = async (userId, history) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is missing');
    }

    const latestUser = [...history].reverse().find((row) => row.role !== 'assistant');

    if (latestUser) {
        const onTopic = await isWeightLossTopic(apiKey, latestUser.message).catch(() => true);
        if (!onTopic) return OFF_TOPIC_REPLY;
    }

    const recent = history.map((row) => ({
        role: row.role === 'assistant' ? 'assistant' : 'user',
        content: row.message,
    }));

    const reply = await askOpenAI(apiKey, [
        { role: 'system', content: await dietContext(userId) },
        ...recent,
    ], 800);
    if (!reply) {
        throw new Error('OpenAI returned an empty reply');
    }

    return reply;
};
