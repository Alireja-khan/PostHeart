import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, lang } = await req.json();
    
    if (!text || !lang) {
      return NextResponse.json({ success: false, error: 'Text and lang are required' }, { status: 400 });
    }

    // Pass through if English
    if (lang === 'en') {
      return NextResponse.json({ success: true, options: [text] });
    }

    // Google Input Tools API undocumented endpoint for phonetic transliteration
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${lang}-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Google Input Tools returns data in this array structure: 
    // ["SUCCESS", [ ["phonetic_word", ["option1", "option2", ...], [], {"annotation":...}] ]]
    if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
      const options = data[1][0][1];
      return NextResponse.json({ success: true, options });
    }

    return NextResponse.json({ success: false, error: 'Failed to transliterate' }, { status: 500 });
  } catch (error: any) {
    console.error('Transliteration API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
