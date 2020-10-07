import SimplexNoise from 'simplex-noise'

const seed = '0.812381239875'
const simplex = new SimplexNoise(seed)

const maxRange = 100000
const defaultPrice = 100

let xStart = 1
let yStart = 1

// This number is used to avoid generic numbers like, 0, 0.25, 0.75 etc.
const divider = 13.33456

/** Returns a purchase price based from a starting price, to simulate a stock transaction
 * @param volatility A multiplier that will change how much the price will shift by
 */
export function generateTransaction(startingPrice: number, volatility = 1) {
    const price = typeof startingPrice === 'number' ? startingPrice : defaultPrice
    const diff = simplex.noise2D(xStart / divider, yStart / divider) * volatility

    if (xStart < maxRange) {
        xStart += 1
    } else if (yStart < maxRange) {
        yStart += 1
    } else {
        yStart = 1
        xStart = 1
    }

    return price + diff
}
