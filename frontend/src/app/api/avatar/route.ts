import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return new NextResponse('Missing name', { status: 400 });

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&bold=true`;

  try {
    // 1. Search for the best Wikipedia article for this name
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json`);
    const searchData = await searchRes.json();
    const title = searchData.query?.search?.[0]?.title;

    if (!title) {
      return NextResponse.redirect(fallback);
    }

    // 2. Get the main image thumbnail for the article
    const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400`);
    const imgData = await imgRes.json();
    
    const pages = imgData.query?.pages;
    const pageId = Object.keys(pages || {})[0];
    const source = pages?.[pageId]?.thumbnail?.source;

    if (source) {
      // Redirect to the Wikipedia image, instructing browser to cache it
      const response = NextResponse.redirect(source, 302);
      response.headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800');
      return response;
    }

    return NextResponse.redirect(fallback);
  } catch (error) {
    console.error('Avatar API Error:', error);
    return NextResponse.redirect(fallback);
  }
}
