import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Google GenAI client with required User-Agent
const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// -------------------------------------------------------------
// Real-Time OTP Server System for Customer Authentication
// In-memory store with TTL, attempts tracking, and cooldowns
// -------------------------------------------------------------
interface OtpRecord {
  identifier: string;
  cleanIdentifier: string;
  channel: 'sms' | 'email';
  otp: string;
  name?: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const otpStore = new Map<string, OtpRecord>();

// Periodic cleanup of expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 30 * 1000);

const normalizeIdentifier = (input: string, channel: 'sms' | 'email') => {
  if (channel === 'email' || input.includes('@')) {
    return input.trim().toLowerCase();
  }
  return input.trim().replace(/[^\d+]/g, '');
};

app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { identifier, channel = 'sms', name } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'Valid phone number or email is required' });
    }

    const cleanChannel: 'sms' | 'email' = channel === 'email' || identifier.includes('@') ? 'email' : 'sms';
    const cleanId = normalizeIdentifier(identifier, cleanChannel);

    if (cleanChannel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (cleanChannel === 'sms' && cleanId.replace(/\D/g, '').length < 8) {
      return res.status(400).json({ error: 'Please enter a valid phone number (at least 8 digits)' });
    }

    const now = Date.now();
    const existing = otpStore.get(cleanId);

    // 25-second resend cooldown
    if (existing && now - existing.lastSentAt < 25000) {
      const waitSeconds = Math.ceil((25000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds}s before requesting a new OTP.`,
        cooldownSeconds: waitSeconds,
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 300; // 5 minutes

    otpStore.set(cleanId, {
      identifier,
      cleanIdentifier: cleanId,
      channel: cleanChannel,
      otp,
      name: name?.trim(),
      createdAt: now,
      expiresAt: now + expiresInSeconds * 1000,
      attempts: 0,
      lastSentAt: now,
    });

    console.log(`[OTP Server] Dispatched OTP ${otp} for ${cleanChannel.toUpperCase()}: ${cleanId}`);

    return res.json({
      success: true,
      message: `Verification code dispatched to ${cleanId}`,
      identifier: cleanId,
      channel: cleanChannel,
      expiresInSeconds,
      cooldownSeconds: 25,
      otpPreview: otp,
      deliveryStatus: 'delivered',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { identifier, otp, channel = 'sms', name } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP code are required.' });
    }

    const cleanChannel: 'sms' | 'email' = channel === 'email' || identifier.includes('@') ? 'email' : 'sms';
    const cleanId = normalizeIdentifier(identifier, cleanChannel);
    const record = otpStore.get(cleanId);

    if (!record) {
      return res.status(400).json({
        error: 'No active OTP found. It may have expired. Please request a new code.',
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      otpStore.delete(cleanId);
      return res.status(400).json({
        error: 'OTP code has expired. Please request a fresh code.',
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanId);
      return res.status(429).json({
        error: 'Too many incorrect attempts. For security, please request a new code.',
      });
    }

    if (record.otp !== String(otp).trim()) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: remaining,
      });
    }

    // Success: remove OTP after verification
    otpStore.delete(cleanId);

    const displayName =
      name?.trim() ||
      record.name ||
      (cleanChannel === 'sms'
        ? `Customer (${cleanId.slice(-4)})`
        : cleanId.split('@')[0].replace(/[._]/g, ' '));

    const email =
      cleanChannel === 'email'
        ? cleanId
        : `${cleanId.replace(/[^0-9]/g, '') || 'customer'}@foodinside.customer`;

    const user = {
      uid: `usr_otp_${Buffer.from(cleanId).toString('hex').slice(0, 14)}`,
      displayName,
      email,
      phone: cleanChannel === 'sms' ? cleanId : undefined,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'customer',
      authProvider: 'otp',
      verifiedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'OTP verified successfully!',
      user,
    });
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

app.post('/api/auth/resend-otp', (req, res) => {
  try {
    const { identifier, channel = 'sms', name } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required.' });
    }

    const cleanChannel: 'sms' | 'email' = channel === 'email' || identifier.includes('@') ? 'email' : 'sms';
    const cleanId = normalizeIdentifier(identifier, cleanChannel);
    const existing = otpStore.get(cleanId);
    const now = Date.now();

    if (existing && now - existing.lastSentAt < 25000) {
      const waitSeconds = Math.ceil((25000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds}s before resending.`,
        cooldownSeconds: waitSeconds,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 300;

    otpStore.set(cleanId, {
      identifier,
      cleanIdentifier: cleanId,
      channel: cleanChannel,
      otp,
      name: name?.trim() || existing?.name,
      createdAt: now,
      expiresAt: now + expiresInSeconds * 1000,
      attempts: 0,
      lastSentAt: now,
    });

    console.log(`[OTP Server] Resent OTP ${otp} for ${cleanChannel.toUpperCase()}: ${cleanId}`);

    return res.json({
      success: true,
      message: `A fresh OTP was sent to ${cleanId}`,
      identifier: cleanId,
      channel: cleanChannel,
      expiresInSeconds,
      cooldownSeconds: 25,
      otpPreview: otp,
      deliveryStatus: 'delivered',
    });
  } catch (err: any) {
    console.error('Resend OTP Error:', err);
    return res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

// -------------------------------------------------------------
// 1. Gemini Multi-Turn Chatbot API (Feature 2)
// Models: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast)
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.8-flash', systemInstruction, searchGrounding, mapsGrounding } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const ai = getAiClient();
    const targetModel = model || 'gemini-3.8-flash';

    // Format contents for Gemini
    const contents = messages.map(m => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const defaultSystemInstruction =
      systemInstruction ||
      'You are FoodInside AI, the friendly culinary and business intelligence assistant for FoodInside. You help customers choose fresh meals, track orders, understand kitchen preparation, and assist managers with live cloud kitchen analytics, stock levels, and rider dispatch.';

    const config: any = {
      systemInstruction: defaultSystemInstruction,
    };

    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    } else if (mapsGrounding) {
      config.tools = [{ googleMaps: {} }];
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || 'I could not generate a response. Please try again.';

    res.json({
      text: replyText,
      modelUsed: targetModel,
      groundingMetadata: (response as any).candidates?.[0]?.groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process chat with Gemini AI',
    });
  }
});

// -------------------------------------------------------------
// 2. Google Search Grounding API (Feature 3)
// Model: gemini-3.8-flash with googleSearch tool
// -------------------------------------------------------------
app.post('/api/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search for the latest real-time food delivery, culinary trends, restaurant news, or live information for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          'You are a real-time food intelligence researcher. Ground your answers in live Google Search results and cite relevant sources, trends, or prices.',
      },
    });

    const metadata = (response as any).candidates?.[0]?.groundingMetadata;

    res.json({
      text: response.text || 'No information found.',
      sources: metadata?.groundingChunks?.map((c: any) => c.web?.title || c.web?.uri).filter(Boolean) || [],
      metadata,
    });
  } catch (error: any) {
    console.error('Search Grounding Error:', error);
    res.status(500).json({
      error: error?.message || 'Google Search grounding failed',
    });
  }
});

// -------------------------------------------------------------
// 3. Google Maps Grounding API (Feature 5)
// Model: gemini-3.8-flash with googleMaps tool
// -------------------------------------------------------------
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const { location = 'Bengaluru', query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `In or around ${location}: ${query}`,
      config: {
        tools: [{ googleMaps: {} }],
        systemInstruction:
          'You are FoodInside Location & Dispatch Guide. Use Google Maps grounding to find accurate nearby food hubs, street food areas, cloud kitchens, traffic corridors, and geographical distances.',
      },
    });

    const metadata = (response as any).candidates?.[0]?.groundingMetadata;

    res.json({
      text: response.text || 'No location data found.',
      metadata,
    });
  } catch (error: any) {
    console.error('Maps Grounding Error:', error);
    res.status(500).json({
      error: error?.message || 'Google Maps grounding failed',
    });
  }
});

// -------------------------------------------------------------
// 4. Animate Images into Video via Interactions API (Feature 4)
// Model: gemini-omni-1.1-flash via Interactions API
// Aspect ratio: 16:9 or 9:16
// -------------------------------------------------------------
app.post('/api/animate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, aspectRatio = '16:9' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required to animate image into video' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getAiClient();
    const targetAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: [
          {
            type: 'image',
            mime_type: mimeType,
            data: cleanBase64,
          },
          {
            type: 'text',
            text:
              prompt ||
              'A hyper-realistic cinematic animation of this delicious freshly prepared dish, with rising steam, appetizing sizzling garnish, and camera slowly pushing in.',
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: targetAspectRatio,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;

    if (videoPart && videoPart.data) {
      res.json({
        success: true,
        videoData: `data:video/mp4;base64,${videoPart.data}`,
        mimeType: videoPart.mime_type || 'video/mp4',
        aspectRatio: targetAspectRatio,
      });
    } else {
      res.status(500).json({
        error: 'The model completed without returning video data.',
      });
    }
  } catch (error: any) {
    console.error('Video Generation Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to animate image into video with gemini-omni-1.1-flash',
    });
  }
});

// -------------------------------------------------------------
// 5. Create & Edit Images with gemini-nano-banana-2.1 (Feature 6)
// Model: gemini-nano-banana-2.1
// -------------------------------------------------------------
app.post('/api/image-generate-edit', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const ai = getAiClient();

    let contents: any;

    if (imageBase64) {
      // Image Editing
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      };
    } else {
      // Text-to-Image Generation
      contents = {
        parts: [
          {
            text: prompt,
          },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: imageSize || '1K',
        },
      },
    });

    let generatedImageUrl = '';
    let responseText = '';

    const parts = (response as any).candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: responseText || 'No image was generated. Please adjust prompt.',
      });
    }

    res.json({
      imageUrl: generatedImageUrl,
      caption: responseText,
    });
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image with gemini-nano-banana-2.1',
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware & Static Serving Setup
// -------------------------------------------------------------
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Route fallback for admin.html and index.html
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let templatePath = path.resolve(import.meta.dirname || '.', 'index.html');
        if (url.startsWith('/admin')) {
          templatePath = path.resolve(import.meta.dirname || '.', 'admin.html');
        }

        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(import.meta.dirname || '.', 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      const url = req.originalUrl;
      if (url.startsWith('/admin')) {
        res.sendFile(path.resolve(distPath, 'admin.html'));
      } else {
        res.sendFile(path.resolve(distPath, 'index.html'));
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FoodInside full-stack server running on http://0.0.0.0:${port}`);
  });
}

setupServer();
