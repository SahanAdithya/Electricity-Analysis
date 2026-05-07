import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 })
    }

    const { bills } = await request.json()
    if (!bills || bills.length === 0) {
      return NextResponse.json({ message: "Add some bills first so I can analyze them!" })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Analyze these household bills and provide 2-3 short, actionable financial insights. 
    Look for trends, high spenders, or upcoming crunches. 
    Keep it encouraging and professional.
    Bills: ${JSON.stringify(bills)}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ insight: text })
  } catch (error: any) {
    console.error('Insights Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
