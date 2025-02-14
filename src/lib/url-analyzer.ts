import { supportedStores } from './buy4me-data'

// Use a CORS proxy service
const PROXY_URL = 'https://corsproxy.io/?'

export async function analyzeUrl(url: string) {
  try {
    // Validate URL format
    const urlObj = new URL(url)
    
    // Check if the URL is from a supported store
    const store = supportedStores.find(store => 
      urlObj.hostname.includes(store.id) || 
      urlObj.hostname.includes(store.name.toLowerCase())
    )

    if (!store) {
      throw new Error('This store is not supported. Please check our list of supported stores.')
    }

    // Fetch the page content through proxy
    const response = await fetch(PROXY_URL + encodeURIComponent(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch product page')
    }

    const html = await response.text()

    // Simple regex-based extraction
    let name = ''
    let price = 0
    let image = ''

    switch (store.id) {
      case 'amazon':
        name = html.match(/"product-title"[^>]*>([^<]+)</)?.[1] || 
               html.match(/id="productTitle"[^>]*>([^<]+)</)?.[1] || ''
        price = parseFloat(html.match(/class="a-price-whole">([^<]+)</)?.[1] || '0')
        image = html.match(/id="landingImage"[^>]*src="([^"]+)"/)?.[1] || ''
        break

      case 'ebay':
        name = html.match(/class="x-item-title__mainTitle"[^>]*>([^<]+)</)?.[1] || ''
        price = parseFloat(html.match(/itemprop="price"[^>]*content="([^"]+)"/)?.[1] || '0')
        image = html.match(/class="ux-image-carousel-item"[^>]*src="([^"]+)"/)?.[1] || ''
        break

      case 'walmart':
        name = html.match(/itemprop="name"[^>]*>([^<]+)</)?.[1] || ''
        price = parseFloat(html.match(/itemprop="price"[^>]*content="([^"]+)"/)?.[1] || '0')
        image = html.match(/property="og:image"[^>]*content="([^"]+)"/)?.[1] || ''
        break

      default:
        throw new Error('Unsupported store')
    }

    // Clean up extracted data
    name = name.trim()
    if (!name || !price) {
      throw new Error('Could not extract product details')
    }

    return {
      name,
      price,
      currency: 'USD',
      url,
      image: image || 'https://via.placeholder.com/150',
      store: store.name
    }

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze URL')
  }
}