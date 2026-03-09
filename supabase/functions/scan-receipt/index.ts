import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, mimeType } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Gambar tidak ditemukan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send to Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: `Analisa struk belanja ini dan ekstrak informasi berikut dalam format JSON.

Kembalikan HANYA JSON tanpa penjelasan apapun, dengan struktur:
{
  "merchant_name": "nama toko/restoran/merchant",
  "date": "YYYY-MM-DD (tanggal transaksi, jika tidak ada gunakan hari ini)",
  "total_amount": 0,
  "currency": "IDR",
  "category_suggestion": "salah satu dari: Makanan & Minuman, Belanja, Transportasi, Kesehatan, Hiburan, Pendidikan, Tagihan, Lainnya",
  "items": [
    {
      "name": "nama item",
      "qty": 1,
      "price": 0,
      "subtotal": 0
    }
  ],
  "subtotal": 0,
  "tax": 0,
  "discount": 0,
  "payment_method": "Cash/Debit/Credit/QRIS/Transfer",
  "notes": "informasi tambahan relevan",
  "confidence": "high/medium/low"
}

Jika gambar bukan struk belanja atau tidak bisa dibaca, kembalikan:
{"error": "Bukan struk belanja atau gambar tidak jelas"}`,
              },
            ],
          },
        ],
      }),
    })

    const aiData = await response.json()
    const textContent = aiData.content[0].text

    // Parse JSON from AI response
    const result = JSON.parse(textContent)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Scan receipt error:', error)
    return new Response(
      JSON.stringify({ error: 'Gagal memproses struk. Silakan coba lagi.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
