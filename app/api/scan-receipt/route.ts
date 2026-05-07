import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 })
    }

    const { image } = await request.json() // Base64 image
    if (!image) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    const prompt = "Analyze this receipt or bill. Extract the merchant/bill name, the total amount, and the due date. Return ONLY a JSON object with these keys: name, amount (number), date (YYYY-MM-DD format). If date is not found, use today's date."

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(',')[1], // Remove prefix if exists
          mimeType: 'image/jpeg'
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Clean JSON if Gemini adds markdown formatting
    const jsonStr = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(jsonStr)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Scan Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
